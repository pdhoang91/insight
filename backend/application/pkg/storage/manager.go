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
	image := &entities.Image{
		ID:               uuid.NewV4(), // Generate UUID manually
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
	var existing entities.ImageReference
	err = m.db.Where("image_id = ? AND post_id = ? AND ref_type = ?", id, postID, refType).First(&existing).Error
	if err == nil {
		return nil // Already exists
	}
	if err != gorm.ErrRecordNotFound {
		return err // Some other error
	}

	// Create new reference
	ref := &entities.ImageReference{
		ID:        uuid.NewV4(), // Generate UUID manually
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

	var image entities.Image
	err := m.db.Where("storage_key = ?", storageKey).First(&image).Error
	if err != nil {
		return "", fmt.Errorf("legacy image not found: %w", err)
	}

	return image.ID.String(), nil
}

// CleanupOrphanedImages removes images that are no longer referenced
func (m *Manager) CleanupOrphanedImages(ctx context.Context, userID uuid.UUID) (int, error) {
	// Find images that have no references
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
			// Log error but continue with other images
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
			// Log error but continue
			fmt.Printf("Warning: failed to delete user image %s: %v\n", img.ID, err)
		}
	}

	return nil
}

// UpdateImageReferences updates image references when post content changes
func (m *Manager) UpdateImageReferences(ctx context.Context, postID uuid.UUID, oldContent, newContent string) error {
	// Extract image IDs from old and new content
	oldImageIDs := m.extractImageIDsFromContent(oldContent)
	newImageIDs := m.extractImageIDsFromContent(newContent)

	// Remove references that are no longer used
	for _, oldID := range oldImageIDs {
		if !m.containsImageID(newImageIDs, oldID) {
			// Remove the reference
			if err := m.db.Where("image_id = ? AND post_id = ?", oldID, postID).Delete(&entities.ImageReference{}).Error; err != nil {
				fmt.Printf("Warning: failed to remove image reference %s: %v\n", oldID, err)
			}
		}
	}

	// Add references for new images
	for _, newID := range newImageIDs {
		if !m.containsImageID(oldImageIDs, newID) {
			// Create new reference
			if err := m.createImageReference(newID, postID, "content"); err != nil {
				fmt.Printf("Warning: failed to create image reference %s: %v\n", newID, err)
			}
		}
	}

	return nil
}

// Helper methods for cleanup logic
func (m *Manager) extractImageIDsFromContent(content string) []string {
	re := regexp.MustCompile(`data-image-id=['"]([^'"]+)['"]`)
	matches := re.FindAllStringSubmatch(content, -1)

	var imageIDs []string
	for _, match := range matches {
		if len(match) > 1 {
			imageIDs = append(imageIDs, match[1])
		}
	}

	return imageIDs
}

func (m *Manager) containsImageID(imageIDs []string, targetID string) bool {
	for _, id := range imageIDs {
		if id == targetID {
			return true
		}
	}
	return false
}

// MigrateLegacyImage migrates a single legacy image to V2 system
func (m *Manager) MigrateLegacyImage(ctx context.Context, legacyURL, userID, imageType string) (*entities.Image, error) {
	// Parse legacy URL to extract S3 key
	re := regexp.MustCompile(`/images/proxy/([^/]+)/([^/]+)/([^/]+)/([^/]+)`)
	matches := re.FindStringSubmatch(legacyURL)
	if len(matches) != 5 {
		return nil, fmt.Errorf("invalid legacy URL format: %s", legacyURL)
	}

	userIDStr := matches[1]
	date := matches[2]
	legacyType := matches[3]
	filename := matches[4]

	// Validate user ID matches
	if userIDStr != userID {
		return nil, fmt.Errorf("user ID mismatch in legacy URL")
	}

	// Construct S3 key
	s3Key := fmt.Sprintf("uploads/%s/%s/%s/%s", userIDStr, date, legacyType, filename)

	// Check if already migrated
	var existingImage entities.Image
	if err := m.db.Where("storage_key = ?", s3Key).First(&existingImage).Error; err == nil {
		return &existingImage, nil // Already migrated
	}

	// Get provider to check if file exists
	provider, err := m.GetProvider("")
	if err != nil {
		return nil, err
	}

	// Get file metadata from storage
	metadata, err := provider.GetMetadata(ctx, s3Key)
	if err != nil {
		return nil, fmt.Errorf("legacy file not found in storage: %w", err)
	}

	// Create image record
	userUUID, err := uuid.FromString(userID)
	if err != nil {
		return nil, fmt.Errorf("invalid user ID: %w", err)
	}

	image := &entities.Image{
		ID:               uuid.NewV4(),
		StorageKey:       s3Key,
		StorageProvider:  provider.GetProviderName(),
		OriginalFilename: filename,
		ContentType:      metadata.ContentType,
		FileSize:         metadata.Size,
		ImageType:        imageType,
		UserID:           userUUID,
		CreatedAt:        metadata.LastModified,
		UpdatedAt:        time.Now(),
	}

	if err := m.db.Create(image).Error; err != nil {
		return nil, fmt.Errorf("failed to create image record: %w", err)
	}

	return image, nil
}

// MigrateLegacyImagesForUser migrates all legacy images for a user
func (m *Manager) MigrateLegacyImagesForUser(ctx context.Context, userID string) (int, error) {
	userUUID, err := uuid.FromString(userID)
	if err != nil {
		return 0, fmt.Errorf("invalid user ID: %w", err)
	}

	// Find all posts by user to extract legacy image URLs from content
	var posts []entities.Post
	if err := m.db.Where("user_id = ?", userUUID).Find(&posts).Error; err != nil {
		return 0, fmt.Errorf("failed to find user posts: %w", err)
	}

	migratedCount := 0
	for _, post := range posts {
		// Get post content
		var postContent entities.PostContent
		if err := m.db.Where("post_id = ?", post.ID).First(&postContent).Error; err != nil {
			continue // Skip posts without content
		}

		// Extract legacy image URLs from content
		legacyURLs := m.extractLegacyURLsFromContent(postContent.Content)

		for _, legacyURL := range legacyURLs {
			_, err := m.MigrateLegacyImage(ctx, legacyURL, userID, "content")
			if err != nil {
				fmt.Printf("Warning: failed to migrate legacy image %s: %v\n", legacyURL, err)
				continue
			}
			migratedCount++
		}
	}

	// Also check user avatar
	var user entities.User
	if err := m.db.Where("id = ?", userUUID).First(&user).Error; err == nil {
		if user.AvatarURL != "" && strings.Contains(user.AvatarURL, "/images/proxy/") {
			_, err := m.MigrateLegacyImage(ctx, user.AvatarURL, userID, "avatar")
			if err == nil {
				migratedCount++
			}
		}
	}

	return migratedCount, nil
}

// extractLegacyURLsFromContent extracts legacy proxy URLs from content
func (m *Manager) extractLegacyURLsFromContent(content string) []string {
	re := regexp.MustCompile(`/images/proxy/[^/]+/[^/]+/[^/]+/[^"'\s]+`)
	matches := re.FindAllString(content, -1)

	// Remove duplicates
	seen := make(map[string]bool)
	var uniqueURLs []string
	for _, url := range matches {
		if !seen[url] {
			uniqueURLs = append(uniqueURLs, url)
			seen[url] = true
		}
	}

	return uniqueURLs
}
