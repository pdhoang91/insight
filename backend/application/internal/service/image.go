package service

import (
	"context"
	"fmt"
	"mime/multipart"

	"github.com/pdhoang91/blog/internal/entities"
	"github.com/pdhoang91/blog/pkg/storage"
	uuid "github.com/satori/go.uuid"
)

// UploadImageV2 uploads an image using the new storage system
func (s *InsightService) UploadImageV2(ctx context.Context, file *multipart.FileHeader, userID uuid.UUID, imageType string) (*storage.UploadResponse, error) {
	uploadReq := &storage.UploadRequest{
		File:   file,
		UserID: userID,
		Type:   imageType,
	}

	return s.StorageManager.UploadImage(ctx, uploadReq)
}

// GetImageByID retrieves an image by ID
func (s *InsightService) GetImageByID(ctx context.Context, imageID string) (*entities.Image, error) {
	return s.StorageManager.GetImageByID(ctx, imageID)
}

// DeleteImageV2 deletes an image by ID
func (s *InsightService) DeleteImageV2(ctx context.Context, imageID string, userID uuid.UUID) error {
	// Check if user owns the image
	image, err := s.StorageManager.GetImageByID(ctx, imageID)
	if err != nil {
		return err
	}

	if image.UserID != userID {
		return fmt.Errorf("not authorized to delete this image")
	}

	return s.StorageManager.DeleteImage(ctx, imageID)
}

// ListUserImages returns images uploaded by a user
func (s *InsightService) ListUserImages(ctx context.Context, userID uuid.UUID, imageType string, page, limit int) ([]entities.Image, int64, error) {
	offset := (page - 1) * limit

	// Build query
	query := s.DB.Where("user_id = ?", userID)
	if imageType != "" {
		query = query.Where("image_type = ?", imageType)
	}

	// Get total count
	var total int64
	query.Model(&entities.Image{}).Count(&total)

	// Get images
	var images []entities.Image
	if err := query.Order("created_at DESC").Limit(limit).Offset(offset).Find(&images).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to get images: %w", err)
	}

	return images, total, nil
}

// ServeImageV2 serves an image by ID through the storage system
func (s *InsightService) ServeImageV2(ctx context.Context, imageID string) (string, error) {
	return s.StorageManager.ServeImage(ctx, imageID)
}

// ProcessContentForDisplay processes content to replace image references with URLs
func (s *InsightService) ProcessContentForDisplay(content string) string {
	return s.StorageManager.ProcessContent(content)
}

// ProcessContentForSaving processes content to replace image URLs with references
func (s *InsightService) ProcessContentForSaving(content string, postID uuid.UUID) (string, error) {
	return s.StorageManager.ProcessContentForSaving(content, postID)
}

// LegacyURLToImageID converts legacy proxy URLs to new image IDs
func (s *InsightService) LegacyURLToImageID(legacyURL string) (string, error) {
	return s.StorageManager.LegacyURLToImageID(legacyURL)
}

// CleanupOrphanedImages removes images that are no longer referenced
func (s *InsightService) CleanupOrphanedImages(ctx context.Context, userID uuid.UUID) (int, error) {
	return s.StorageManager.CleanupOrphanedImages(ctx, userID)
}

// CleanupUserImages removes all images for a user (for user deletion)
func (s *InsightService) CleanupUserImages(ctx context.Context, userID uuid.UUID) error {
	return s.StorageManager.CleanupUserImages(ctx, userID)
}

// UpdateImageReferences updates image references when post content changes
func (s *InsightService) UpdateImageReferences(ctx context.Context, postID uuid.UUID, oldContent, newContent string) error {
	return s.StorageManager.UpdateImageReferences(ctx, postID, oldContent, newContent)
}

// MigrateLegacyImage migrates a single legacy image to V2 system
func (s *InsightService) MigrateLegacyImage(ctx context.Context, legacyURL, userID, imageType string) (*entities.Image, error) {
	return s.StorageManager.MigrateLegacyImage(ctx, legacyURL, userID, imageType)
}

// MigrateLegacyImagesForUser migrates all legacy images for a user
func (s *InsightService) MigrateLegacyImagesForUser(ctx context.Context, userID string) (int, error) {
	return s.StorageManager.MigrateLegacyImagesForUser(ctx, userID)
}
