package service

import (
	"context"
	"encoding/json"
	"mime/multipart"
	"time"

	"github.com/pdhoang91/blog/internal/apperror"
	"github.com/pdhoang91/blog/internal/entities"
	"github.com/pdhoang91/blog/pkg/storage"
	uuid "github.com/satori/go.uuid"
)

// UploadImageV2 uploads an image using the new storage system
func (s *InsightService) UploadImageV2(ctx context.Context, file *multipart.FileHeader, userID uuid.UUID, imageType string) (*storage.UploadResponse, error) {
	return s.StorageManager.UploadImage(ctx, &storage.UploadRequest{
		File: file, UserID: userID, Type: imageType,
	})
}

// GetImageByID retrieves an image by ID
func (s *InsightService) GetImageByID(ctx context.Context, imageID string) (*entities.Image, error) {
	return s.StorageManager.GetImageByID(ctx, imageID)
}

// DeleteImageV2 deletes an image by ID
func (s *InsightService) DeleteImageV2(ctx context.Context, imageID string, userID uuid.UUID) error {
	image, err := s.StorageManager.GetImageByID(ctx, imageID)
	if err != nil {
		return apperror.NewNotFound("image not found")
	}
	if image.UserID != userID {
		return apperror.NewForbidden("not authorized to delete this image")
	}
	if err := s.StorageManager.DeleteImage(ctx, imageID); err != nil {
		return err
	}
	s.InvalidateImageCache(imageID)
	return nil
}

// ListUserImages returns images uploaded by a user
func (s *InsightService) ListUserImages(ctx context.Context, userID uuid.UUID, imageType string, page, limit int) ([]entities.Image, int64, error) {
	offset := (page - 1) * limit
	images, total, err := s.ImageRepo.FindByUserID(userID, imageType, limit, offset)
	if err != nil {
		return nil, 0, apperror.NewInternal("failed to get images", err)
	}
	return images, total, nil
}

// ServeImageV2 serves an image by ID through the storage system
func (s *InsightService) ServeImageV2(ctx context.Context, imageID string) (string, error) {
	return s.StorageManager.ServeImage(ctx, imageID)
}

// UpdateJSONImageReferences updates image references when JSON post content changes
func (s *InsightService) UpdateJSONImageReferences(ctx context.Context, postID uuid.UUID, oldDoc, newDoc json.RawMessage) error {
	return s.StorageManager.UpdateJSONImageReferences(ctx, postID, oldDoc, newDoc)
}

// CleanupOrphanedImages removes images that are no longer referenced
func (s *InsightService) CleanupOrphanedImages(ctx context.Context, userID uuid.UUID) (int, error) {
	return s.StorageManager.CleanupOrphanedImages(ctx, userID)
}

// CleanupUserImages removes all images for a user (for user deletion)
func (s *InsightService) CleanupUserImages(ctx context.Context, userID uuid.UUID) error {
	return s.StorageManager.CleanupUserImages(ctx, userID)
}

// GetImageURL returns the public URL for an image by ID
func (s *InsightService) GetImageURL(imageID string) string {
	return s.StorageManager.GetImageURL(imageID)
}

func (s *InsightService) GetImageRedirectURL(ctx context.Context, imageID string) (string, error) {
	cacheKey := "img_redirect:" + imageID
	if cached, ok := s.Cache.Get(cacheKey); ok {
		return cached.(string), nil
	}

	image, err := s.StorageManager.GetImageByID(ctx, imageID)
	if err != nil {
		return "", apperror.NewNotFound("image not found")
	}
	provider, err := s.StorageManager.GetProvider(image.StorageProvider)
	if err != nil {
		return "", apperror.NewInternal("storage provider not available", err)
	}
	url, err := provider.GetURL(ctx, image.StorageKey)
	if err != nil {
		return "", apperror.NewInternal("failed to generate URL", err)
	}

	s.Cache.Set(cacheKey, url, time.Hour)
	return url, nil
}

func (s *InsightService) InvalidateImageCache(imageID string) {
	s.Cache.Delete("img_redirect:" + imageID)
}
