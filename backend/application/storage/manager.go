// storage/manager.go
package storage

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"time"

	"github.com/pdhoang91/blog/models"
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

// UploadImage uploads an image and creates database record
func (m *Manager) UploadImage(ctx context.Context, req *UploadRequest) (*UploadResponse, error) {
	// Get the storage provider
	provider, err := m.GetProvider("")
	if err != nil {
		return nil, err
	}

	// Generate unique filename with prefix
	prefix := m.generatePrefix()
	safeFilename := m.sanitizeFilename(req.File.Filename)

	// Create storage path: userID/date/type/prefix_filename
	currentDate := time.Now().Format("2006-01-02")
	storagePath := filepath.Join(
		req.UserID.String(),
		currentDate,
		req.Type,
		fmt.Sprintf("%s_%s", prefix, safeFilename),
	)

	// Upload the file
	result, err := provider.Upload(ctx, req.File, storagePath)
	if err != nil {
		return nil, fmt.Errorf("failed to upload file: %w", err)
	}

	// Create image record in database
	image := &models.Image{
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
		// If database save fails, try to cleanup uploaded file
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
	// Return new image serving endpoint
	baseURL := os.Getenv("BASE_API_URL")
	if baseURL == "" {
		baseURL = "http://localhost:81"
	}
	return fmt.Sprintf("%s/images/v2/%s", baseURL, imageID)
}

// GetImageByID retrieves an image record by ID
func (m *Manager) GetImageByID(ctx context.Context, imageID string) (*models.Image, error) {
	var image models.Image

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

// ProcessContent replaces image references in content with URLs
func (m *Manager) ProcessContent(content string) string {
	// Replace data-image-id attributes with actual URLs
	re := regexp.MustCompile(`data-image-id=['"]([^'"]+)['"]`)

	return re.ReplaceAllStringFunc(content, func(match string) string {
		// Extract image ID from the match
		imageID := m.extractImageID(match)
		if imageID == "" {
			return match // Return original if can't extract ID
		}

		// Generate URL for the image
		imageURL := m.GetImageURL(imageID)
		return fmt.Sprintf(`src="%s"`, imageURL)
	})
}

// ProcessContentForSaving replaces image URLs with data-image-id references
func (m *Manager) ProcessContentForSaving(content string, postID uuid.UUID) (string, error) {
	// Find all image URLs in content and replace with data-image-id
	re := regexp.MustCompile(`src=['"]([^'"]*\/images\/v2\/([^'"\/]+))['"]`)

	processedContent := re.ReplaceAllStringFunc(content, func(match string) string {
		// Extract image ID from URL
		matches := re.FindStringSubmatch(match)
		if len(matches) < 3 {
			return match
		}

		imageID := matches[2]

		// Create image reference if it doesn't exist
		if err := m.createImageReference(imageID, postID, "content"); err != nil {
			// Log error but don't fail the whole operation
			fmt.Printf("Warning: failed to create image reference: %v\n", err)
		}

		return fmt.Sprintf(`data-image-id="%s"`, imageID)
	})

	return processedContent, nil
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

	// Delete from storage
	if err := provider.Delete(ctx, image.StorageKey); err != nil {
		return fmt.Errorf("failed to delete from storage: %w", err)
	}

	// Delete from database
	if err := m.db.Delete(image).Error; err != nil {
		return fmt.Errorf("failed to delete from database: %w", err)
	}

	return nil
}

// Helper methods

func (m *Manager) generatePrefix() string {
	return uuid.NewV4().String()[:8]
}

func (m *Manager) sanitizeFilename(filename string) string {
	// Replace spaces and special characters
	safe := strings.ReplaceAll(filename, " ", "_")
	// Remove any characters that aren't alphanumeric, underscore, dash, or dot
	re := regexp.MustCompile(`[^a-zA-Z0-9._-]`)
	return re.ReplaceAllString(safe, "")
}

func (m *Manager) extractImageID(match string) string {
	re := regexp.MustCompile(`data-image-id=['"]([^'"]+)['"]`)
	matches := re.FindStringSubmatch(match)
	if len(matches) > 1 {
		return matches[1]
	}
	return ""
}

func (m *Manager) createImageReference(imageID string, postID uuid.UUID, refType string) error {
	id, err := uuid.FromString(imageID)
	if err != nil {
		return err
	}

	// Check if reference already exists
	var existing models.ImageReference
	err = m.db.Where("image_id = ? AND post_id = ? AND ref_type = ?", id, postID, refType).First(&existing).Error
	if err == nil {
		return nil // Already exists
	}
	if err != gorm.ErrRecordNotFound {
		return err // Some other error
	}

	// Create new reference
	ref := &models.ImageReference{
		ImageID:   id,
		PostID:    postID,
		RefType:   refType,
		CreatedAt: time.Now(),
	}

	return m.db.Create(ref).Error
}

// LegacyURLToImageID converts legacy proxy URLs to new image IDs
// This is for backward compatibility during migration
func (m *Manager) LegacyURLToImageID(legacyURL string) (string, error) {
	// Parse legacy URL format: /images/proxy/{userID}/{date}/{type}/{filename}
	re := regexp.MustCompile(`/images/proxy/([^/]+)/([^/]+)/([^/]+)/([^/]+)`)
	matches := re.FindStringSubmatch(legacyURL)
	if len(matches) != 5 {
		return "", fmt.Errorf("invalid legacy URL format")
	}

	userID := matches[1]
	date := matches[2]
	imageType := matches[3]
	filename := matches[4]

	// Try to find existing image by storage key pattern
	storageKey := fmt.Sprintf("uploads/%s/%s/%s/%s", userID, date, imageType, filename)

	var image models.Image
	err := m.db.Where("storage_key = ?", storageKey).First(&image).Error
	if err != nil {
		return "", fmt.Errorf("legacy image not found: %w", err)
	}

	return image.ID.String(), nil
}
