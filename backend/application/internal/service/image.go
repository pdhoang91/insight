package service

import (
	"context"
	"fmt"
	"mime/multipart"

	"github.com/pdhoang91/blog/config"
	"github.com/pdhoang91/blog/internal/entities"
	"github.com/pdhoang91/blog/pkg/storage"
	uuid "github.com/satori/go.uuid"
	"gorm.io/gorm"
)

var storageManager *storage.Manager

// GetStorageManager returns the global storage manager instance
func GetStorageManager() *storage.Manager {
	return storageManager
}

// InitStorageManager initializes the global storage manager
func InitStorageManager(db *gorm.DB) {
	// Initialize storage manager with S3 provider
	manager := storage.NewManager("s3", db)

	// Get S3 configuration from config
	bucket, region, cdnDomain := config.GetS3Config()
	basePath := "uploads"

	// Create and register S3 provider using existing S3 client
	s3Provider := storage.NewS3Provider(bucket, region, basePath, cdnDomain)
	manager.RegisterProvider("s3", s3Provider)

	storageManager = manager
}

// UploadImageV2 uploads an image using the new storage system
func (s *InsightService) UploadImageV2(ctx context.Context, file *multipart.FileHeader, userID uuid.UUID, imageType string) (*storage.UploadResponse, error) {
	manager := GetStorageManager()
	if manager == nil {
		return nil, fmt.Errorf("storage manager not initialized")
	}

	uploadReq := &storage.UploadRequest{
		File:   file,
		UserID: userID,
		Type:   imageType,
	}

	return manager.UploadImage(ctx, uploadReq)
}

// GetImageByID retrieves an image by ID
func (s *InsightService) GetImageByID(ctx context.Context, imageID string) (*entities.Image, error) {
	manager := GetStorageManager()
	if manager == nil {
		return nil, fmt.Errorf("storage manager not initialized")
	}

	return manager.GetImageByID(ctx, imageID)
}

// DeleteImageV2 deletes an image by ID
func (s *InsightService) DeleteImageV2(ctx context.Context, imageID string, userID uuid.UUID) error {
	manager := GetStorageManager()
	if manager == nil {
		return fmt.Errorf("storage manager not initialized")
	}

	// Check if user owns the image
	image, err := manager.GetImageByID(ctx, imageID)
	if err != nil {
		return err
	}

	if image.UserID != userID {
		return fmt.Errorf("not authorized to delete this image")
	}

	return manager.DeleteImage(ctx, imageID)
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
	manager := GetStorageManager()
	if manager == nil {
		return "", fmt.Errorf("storage manager not initialized")
	}

	return manager.ServeImage(ctx, imageID)
}

// ProcessContentForDisplay processes content to replace image references with URLs
func (s *InsightService) ProcessContentForDisplay(content string) string {
	manager := GetStorageManager()
	if manager == nil {
		return content
	}

	return manager.ProcessContent(content)
}

// ProcessContentForSaving processes content to replace image URLs with references
func (s *InsightService) ProcessContentForSaving(content string, postID uuid.UUID) (string, error) {
	manager := GetStorageManager()
	if manager == nil {
		return content, nil
	}

	return manager.ProcessContentForSaving(content, postID)
}

// LegacyURLToImageID converts legacy proxy URLs to new image IDs
func (s *InsightService) LegacyURLToImageID(legacyURL string) (string, error) {
	manager := GetStorageManager()
	if manager == nil {
		return "", fmt.Errorf("storage manager not initialized")
	}

	return manager.LegacyURLToImageID(legacyURL)
}
