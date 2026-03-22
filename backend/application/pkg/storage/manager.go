// storage/manager.go
package storage

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"time"

	"github.com/pdhoang91/blog/internal/entities"
	uuid "github.com/satori/go.uuid"
	"gorm.io/gorm"
)

// Manager handles storage operations and provider management
type Manager struct {
	providers       map[string]StorageProvider
	defaultProvider string
	db              *gorm.DB
}

// NewManager creates a new storage manager
func NewManager(defaultProvider string, db *gorm.DB) *Manager {
	return &Manager{
		providers:       make(map[string]StorageProvider),
		defaultProvider: defaultProvider,
		db:              db,
	}
}

// RegisterProvider registers a storage provider
func (m *Manager) RegisterProvider(name string, provider StorageProvider) {
	m.providers[name] = provider
}

// GetProvider returns a storage provider by name
func (m *Manager) GetProvider(name string) (StorageProvider, error) {
	if name == "" {
		name = m.defaultProvider
	}

	provider, exists := m.providers[name]
	if !exists {
		return nil, fmt.Errorf("storage provider '%s' not found", name)
	}

	return provider, nil
}

// allowedImageMIMETypes is the server-side allowlist of supported image MIME types for content uploads.
var allowedImageMIMETypes = map[string]bool{
	"image/jpeg":    true,
	"image/png":     true,
	"image/gif":     true,
	"image/webp":    true,
	"image/avif":    true,
	"image/bmp":     true,
	"image/tiff":    true,
	"image/svg+xml": true,
	"image/heic":    true,
	"image/heif":    true,
}

// browserDisplayableMIMETypes are formats that browsers can natively render as images.
// Used for title (cover) and avatar uploads where the image must be displayed directly.
var browserDisplayableMIMETypes = map[string]bool{
	"image/jpeg":    true,
	"image/png":     true,
	"image/gif":     true,
	"image/webp":    true,
	"image/avif":    true,
	"image/svg+xml": true,
}

// detectMIMEType reads the first 512 bytes of the file to detect its MIME type.
// Falls back to extension-based detection for formats not supported by net/http.
func detectMIMEType(filename string, openFn func() (io.Reader, error)) (string, error) {
	ext := strings.ToLower(filepath.Ext(filename))

	// HEIC/HEIF are not detectable by net/http — use extension
	switch ext {
	case ".heic":
		return "image/heic", nil
	case ".heif":
		return "image/heif", nil
	}

	r, err := openFn()
	if err != nil {
		return "", fmt.Errorf("failed to open file for MIME detection: %w", err)
	}

	buf := make([]byte, 512)
	n, err := r.Read(buf)
	if err != nil && err != io.EOF {
		return "", fmt.Errorf("failed to read file header: %w", err)
	}

	return http.DetectContentType(buf[:n]), nil
}

// UploadImage uploads an image and creates database record
func (m *Manager) UploadImage(ctx context.Context, req *UploadRequest) (*UploadResponse, error) {
	provider, err := m.GetProvider("")
	if err != nil {
		return nil, err
	}

	// Detect and validate MIME type from file bytes
	detectedType, err := detectMIMEType(req.File.Filename, func() (io.Reader, error) {
		return req.File.Open()
	})
	if err != nil {
		return nil, fmt.Errorf("failed to detect image format: %w", err)
	}
	if !allowedImageMIMETypes[detectedType] {
		return nil, fmt.Errorf(
			"unsupported image format '%s'. Supported: JPEG, PNG, GIF, WebP, AVIF, BMP, TIFF, HEIC, SVG",
			detectedType,
		)
	}

	// title and avatar images must be browser-displayable
	if req.Type == "title" || req.Type == "avatar" {
		if !browserDisplayableMIMETypes[detectedType] {
			return nil, fmt.Errorf(
				"format '%s' cannot be displayed by browsers. For %s images, use: JPEG, PNG, GIF, WebP, AVIF, or SVG",
				detectedType, req.Type,
			)
		}
	}

	// Override the browser-supplied Content-Type with the server-detected one
	req.File.Header.Set("Content-Type", detectedType)

	prefix := m.generatePrefix()
	safeFilename := m.sanitizeFilename(req.File.Filename)

	currentDate := time.Now().Format("2006-01-02")
	storagePath := filepath.Join(
		req.UserID.String(),
		currentDate,
		req.Type,
		fmt.Sprintf("%s_%s", prefix, safeFilename),
	)

	result, err := provider.Upload(ctx, req.File, storagePath)
	if err != nil {
		return nil, fmt.Errorf("failed to upload file: %w", err)
	}

	image := &entities.Image{
		ID:               uuid.NewV4(),
		StorageKey:       result.Key,
		StorageProvider:  provider.GetProviderName(),
		OriginalFilename: req.File.Filename,
		ContentType:      result.ContentType,
		FileSize:         result.Size,
		ImageType:        req.Type,
		UserID:           req.UserID,
		CreatedAt:        time.Now(),
		UpdatedAt:        time.Now(),
	}

	if err := m.db.Create(image).Error; err != nil {
		_ = provider.Delete(ctx, result.Key)
		return nil, fmt.Errorf("failed to save image record: %w", err)
	}

	return &UploadResponse{
		ImageID:     image.ID,
		URL:         m.GetImageURL(image.ID.String()),
		StorageKey:  result.Key,
		ContentType: result.ContentType,
		Size:        result.Size,
	}, nil
}

// GetImageURL returns the URL for an image by ID
func (m *Manager) GetImageURL(imageID string) string {
	baseURL := os.Getenv("BASE_API_URL")
	if baseURL == "" {
		baseURL = "http://localhost:81"
	}
	return fmt.Sprintf("%s/images/v2/%s", baseURL, imageID)
}

// GetImageByID retrieves an image record by ID
func (m *Manager) GetImageByID(ctx context.Context, imageID string) (*entities.Image, error) {
	var image entities.Image

	id, err := uuid.FromString(imageID)
	if err != nil {
		return nil, fmt.Errorf("invalid image ID: %w", err)
	}

	if err := m.db.First(&image, "id = ?", id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("image not found")
		}
		return nil, fmt.Errorf("failed to get image: %w", err)
	}

	return &image, nil
}

// ServeImage serves an image by ID through the appropriate provider
func (m *Manager) ServeImage(ctx context.Context, imageID string) (string, error) {
	image, err := m.GetImageByID(ctx, imageID)
	if err != nil {
		return "", err
	}

	provider, err := m.GetProvider(image.StorageProvider)
	if err != nil {
		return "", err
	}

	return provider.GetURL(ctx, image.StorageKey)
}

// DeleteImage removes an image and its file
func (m *Manager) DeleteImage(ctx context.Context, imageID string) error {
	image, err := m.GetImageByID(ctx, imageID)
	if err != nil {
		return err
	}

	provider, err := m.GetProvider(image.StorageProvider)
	if err != nil {
		return err
	}

	if err := provider.Delete(ctx, image.StorageKey); err != nil {
		return fmt.Errorf("failed to delete from storage: %w", err)
	}

	if err := m.db.Delete(image).Error; err != nil {
		return fmt.Errorf("failed to delete from database: %w", err)
	}

	return nil
}

// --- JSON Document Tree Processing ---

// ProcessJSONContent replaces image URLs with data-image-id in a JSON document tree (for saving)
func (m *Manager) ProcessJSONContent(doc json.RawMessage) json.RawMessage {
	return m.walkJSONTree(doc, func(node map[string]interface{}) {
		nodeType, _ := node["type"].(string)
		if nodeType != "image" && nodeType != "imageBlock" {
			return
		}
		attrs, ok := node["attrs"].(map[string]interface{})
		if !ok {
			return
		}
		src, ok := attrs["src"].(string)
		if !ok || src == "" {
			return
		}
		re := regexp.MustCompile(`/images/v2/([^/'"?\s]+)`)
		matches := re.FindStringSubmatch(src)
		if len(matches) >= 2 {
			attrs["dataImageId"] = matches[1]
			delete(attrs, "src")
		}
	})
}

// ProcessJSONContentForDisplay replaces data-image-id with actual URLs in a JSON document tree
func (m *Manager) ProcessJSONContentForDisplay(doc json.RawMessage) json.RawMessage {
	return m.walkJSONTree(doc, func(node map[string]interface{}) {
		nodeType, _ := node["type"].(string)
		if nodeType != "image" && nodeType != "imageBlock" {
			return
		}
		attrs, ok := node["attrs"].(map[string]interface{})
		if !ok {
			return
		}
		imageID, ok := attrs["dataImageId"].(string)
		if !ok || imageID == "" {
			return
		}
		attrs["src"] = m.GetImageURL(imageID)
	})
}

// ExtractImageIDsFromJSON walks a JSON document tree and returns all image IDs
func (m *Manager) ExtractImageIDsFromJSON(doc json.RawMessage) []string {
	var imageIDs []string
	m.walkJSONTree(doc, func(node map[string]interface{}) {
		nodeType, _ := node["type"].(string)
		if nodeType != "image" && nodeType != "imageBlock" {
			return
		}
		attrs, ok := node["attrs"].(map[string]interface{})
		if !ok {
			return
		}
		if id, ok := attrs["dataImageId"].(string); ok && id != "" {
			imageIDs = append(imageIDs, id)
			return
		}
		if src, ok := attrs["src"].(string); ok {
			re := regexp.MustCompile(`/images/v2/([^/'"?\s]+)`)
			matches := re.FindStringSubmatch(src)
			if len(matches) >= 2 {
				imageIDs = append(imageIDs, matches[1])
			}
		}
	})
	return imageIDs
}

// ExtractPlainTextFromJSON walks a JSON document tree and extracts all text content
func (m *Manager) ExtractPlainTextFromJSON(doc json.RawMessage) string {
	var parts []string
	m.walkJSONTree(doc, func(node map[string]interface{}) {
		if node["type"] == "text" {
			if text, ok := node["text"].(string); ok && text != "" {
				parts = append(parts, text)
			}
		}
	})
	return strings.Join(parts, " ")
}

// UpdateJSONImageReferences updates image references when JSON content changes
func (m *Manager) UpdateJSONImageReferences(ctx context.Context, postID uuid.UUID, oldDoc, newDoc json.RawMessage) error {
	oldIDs := m.ExtractImageIDsFromJSON(oldDoc)
	newIDs := m.ExtractImageIDsFromJSON(newDoc)

	for _, oldID := range oldIDs {
		if !containsString(newIDs, oldID) {
			if err := m.db.Where("image_id = ? AND post_id = ?", oldID, postID).Delete(&entities.ImageReference{}).Error; err != nil {
				fmt.Printf("Warning: failed to remove image reference %s: %v\n", oldID, err)
			}
		}
	}
	for _, newID := range newIDs {
		if !containsString(oldIDs, newID) {
			if err := m.createImageReference(newID, postID, "content"); err != nil {
				fmt.Printf("Warning: failed to create image reference %s: %v\n", newID, err)
			}
		}
	}
	return nil
}

// CleanupOrphanedImages removes images that are no longer referenced
func (m *Manager) CleanupOrphanedImages(ctx context.Context, userID uuid.UUID) (int, error) {
	var orphanedImages []entities.Image
	err := m.db.Where(`
		user_id = ? AND 
		id NOT IN (
			SELECT DISTINCT image_id FROM image_references 
			WHERE image_id IS NOT NULL
		) AND 
		image_type = 'content' AND 
		created_at < ?
	`, userID, time.Now().Add(-24*time.Hour)).Find(&orphanedImages).Error

	if err != nil {
		return 0, fmt.Errorf("failed to find orphaned images: %w", err)
	}

	deletedCount := 0
	for _, img := range orphanedImages {
		if err := m.DeleteImage(ctx, img.ID.String()); err != nil {
			fmt.Printf("Warning: failed to delete orphaned image %s: %v\n", img.ID, err)
			continue
		}
		deletedCount++
	}

	return deletedCount, nil
}

// CleanupUserImages removes all images for a user (for user deletion)
func (m *Manager) CleanupUserImages(ctx context.Context, userID uuid.UUID) error {
	var userImages []entities.Image
	if err := m.db.Where("user_id = ?", userID).Find(&userImages).Error; err != nil {
		return fmt.Errorf("failed to find user images: %w", err)
	}

	for _, img := range userImages {
		if err := m.DeleteImage(ctx, img.ID.String()); err != nil {
			fmt.Printf("Warning: failed to delete user image %s: %v\n", img.ID, err)
		}
	}

	return nil
}

// --- Internal helpers ---

func (m *Manager) generatePrefix() string {
	return uuid.NewV4().String()[:8]
}

func (m *Manager) sanitizeFilename(filename string) string {
	safe := strings.ReplaceAll(filename, " ", "_")
	re := regexp.MustCompile(`[^a-zA-Z0-9._-]`)
	return re.ReplaceAllString(safe, "")
}

func (m *Manager) createImageReference(imageID string, postID uuid.UUID, refType string) error {
	id, err := uuid.FromString(imageID)
	if err != nil {
		return err
	}

	var existing entities.ImageReference
	err = m.db.Where("image_id = ? AND post_id = ? AND ref_type = ?", id, postID, refType).First(&existing).Error
	if err == nil {
		return nil // Already exists
	}
	if err != gorm.ErrRecordNotFound {
		return err
	}

	ref := &entities.ImageReference{
		ID:        uuid.NewV4(),
		ImageID:   id,
		PostID:    postID,
		RefType:   refType,
		CreatedAt: time.Now(),
	}

	return m.db.Create(ref).Error
}

func (m *Manager) walkJSONTree(doc json.RawMessage, visitor func(node map[string]interface{})) json.RawMessage {
	var node map[string]interface{}
	if err := json.Unmarshal(doc, &node); err != nil {
		return doc
	}

	m.walkNode(node, visitor)

	result, err := json.Marshal(node)
	if err != nil {
		return doc
	}
	return result
}

func (m *Manager) walkNode(node map[string]interface{}, visitor func(node map[string]interface{})) {
	visitor(node)

	content, ok := node["content"]
	if !ok {
		return
	}

	children, ok := content.([]interface{})
	if !ok {
		return
	}

	for _, child := range children {
		childNode, ok := child.(map[string]interface{})
		if !ok {
			continue
		}
		m.walkNode(childNode, visitor)
	}
}

func containsString(slice []string, target string) bool {
	for _, s := range slice {
		if s == target {
			return true
		}
	}
	return false
}
