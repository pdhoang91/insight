// controller/controller.go
package controller

import (
	"context"
	"fmt"
	"regexp"
	"strings"

	"github.com/pdhoang91/blog/models"
	"github.com/pdhoang91/blog/storage"
	uuid "github.com/satori/go.uuid"
	"gorm.io/gorm"
)

// Controller is the unified controller struct that contains all dependencies
type Controller struct {
	DB             *gorm.DB
	StorageManager *storage.Manager
	S3Manager      *storage.S3Manager
}

// NewController creates a new unified controller instance
func NewController(
	db *gorm.DB,
	storageManager *storage.Manager,
	s3Manager *storage.S3Manager,
) *Controller {
	return &Controller{
		DB:             db,
		StorageManager: storageManager,
		S3Manager:      s3Manager,
	}
}

// DeleteImageDirectly deletes an image from both database and S3 immediately
func (ctrl *Controller) DeleteImageDirectly(ctx context.Context, imageID uuid.UUID) error {
	// Get image record
	var image models.Image
	if err := ctrl.DB.First(&image, "id = ?", imageID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil // Already deleted, no error
		}
		return fmt.Errorf("failed to get image: %w", err)
	}

	// Delete from S3
	if err := ctrl.S3Manager.DeleteObject(ctx, image.StorageKey); err != nil {
		// Log error but continue with database deletion
		fmt.Printf("Warning: failed to delete image from S3: %v\n", err)
	}

	// Delete image references first
	if err := ctrl.DB.Where("image_id = ?", imageID).Delete(&models.ImageReference{}).Error; err != nil {
		return fmt.Errorf("failed to delete image references: %w", err)
	}

	// Delete from database
	if err := ctrl.DB.Delete(&image).Error; err != nil {
		return fmt.Errorf("failed to delete image from database: %w", err)
	}

	return nil
}

// DeleteImagesByStorageKeys deletes multiple images by their storage keys
func (ctrl *Controller) DeleteImagesByStorageKeys(ctx context.Context, storageKeys []string) error {
	if len(storageKeys) == 0 {
		return nil
	}

	// Get images by storage keys
	var images []models.Image
	if err := ctrl.DB.Where("storage_key IN ?", storageKeys).Find(&images).Error; err != nil {
		return fmt.Errorf("failed to get images: %w", err)
	}

	// Delete from S3 in batch
	if err := ctrl.S3Manager.DeleteObjects(ctx, storageKeys); err != nil {
		fmt.Printf("Warning: failed to delete some images from S3: %v\n", err)
	}

	// Delete from database
	imageIDs := make([]uuid.UUID, len(images))
	for i, img := range images {
		imageIDs[i] = img.ID
	}

	// Delete image references first
	if len(imageIDs) > 0 {
		if err := ctrl.DB.Where("image_id IN ?", imageIDs).Delete(&models.ImageReference{}).Error; err != nil {
			return fmt.Errorf("failed to delete image references: %w", err)
		}

		// Delete images
		if err := ctrl.DB.Where("id IN ?", imageIDs).Delete(&models.Image{}).Error; err != nil {
			return fmt.Errorf("failed to delete images from database: %w", err)
		}
	}

	return nil
}

// DeletePostImages deletes all images associated with a post
func (ctrl *Controller) DeletePostImages(ctx context.Context, postID uuid.UUID) error {
	// Get all image references for this post
	var imageRefs []models.ImageReference
	if err := ctrl.DB.Preload("Image").Where("post_id = ?", postID).Find(&imageRefs).Error; err != nil {
		return fmt.Errorf("failed to get image references: %w", err)
	}

	if len(imageRefs) == 0 {
		return nil
	}

	// Collect storage keys and image IDs
	storageKeys := make([]string, len(imageRefs))
	imageIDs := make([]uuid.UUID, len(imageRefs))

	for i, ref := range imageRefs {
		storageKeys[i] = ref.Image.StorageKey
		imageIDs[i] = ref.ImageID
	}

	// Delete from S3 in batch
	if err := ctrl.S3Manager.DeleteObjects(ctx, storageKeys); err != nil {
		fmt.Printf("Warning: failed to delete some images from S3: %v\n", err)
	}

	// Delete image references
	if err := ctrl.DB.Where("post_id = ?", postID).Delete(&models.ImageReference{}).Error; err != nil {
		return fmt.Errorf("failed to delete image references: %w", err)
	}

	// Delete images
	if err := ctrl.DB.Where("id IN ?", imageIDs).Delete(&models.Image{}).Error; err != nil {
		return fmt.Errorf("failed to delete images: %w", err)
	}

	return nil
}

// DeleteUserAvatar deletes user's current avatar
func (ctrl *Controller) DeleteUserAvatar(ctx context.Context, userID uuid.UUID, currentAvatarURL string) error {
	if currentAvatarURL == "" {
		return nil
	}

	// Extract image ID from avatar URL if it's using new system
	if strings.Contains(currentAvatarURL, "/images/v2/") {
		re := regexp.MustCompile(`/images/v2/([^/]+)`)
		matches := re.FindStringSubmatch(currentAvatarURL)
		if len(matches) > 1 {
			imageID, err := uuid.FromString(matches[1])
			if err == nil {
				return ctrl.DeleteImageDirectly(ctx, imageID)
			}
		}
	}

	// Handle legacy avatar URLs
	if strings.Contains(currentAvatarURL, "/images/proxy/") {
		// Extract storage key from legacy URL
		re := regexp.MustCompile(`/images/proxy/([^/]+)/([^/]+)/([^/]+)/([^/]+)`)
		matches := re.FindStringSubmatch(currentAvatarURL)
		if len(matches) == 5 {
			storageKey := fmt.Sprintf("uploads/%s/%s/%s/%s", matches[1], matches[2], matches[3], matches[4])
			return ctrl.DeleteImagesByStorageKeys(ctx, []string{storageKey})
		}
	}

	return nil
}

// ExtractImageIDsFromContent extracts image IDs from post content
func (ctrl *Controller) ExtractImageIDsFromContent(content string) []uuid.UUID {
	var imageIDs []uuid.UUID

	// Find all data-image-id attributes
	re := regexp.MustCompile(`data-image-id=['"]([^'"]+)['"]`)
	matches := re.FindAllStringSubmatch(content, -1)

	for _, match := range matches {
		if len(match) > 1 {
			if id, err := uuid.FromString(match[1]); err == nil {
				imageIDs = append(imageIDs, id)
			}
		}
	}

	return imageIDs
}

// ExtractImageIDFromTitleURL extracts image ID from title image URL
func (ctrl *Controller) ExtractImageIDFromTitleURL(titleURL string) *uuid.UUID {
	if titleURL == "" {
		return nil
	}

	// Extract from new system URL
	if strings.Contains(titleURL, "/images/v2/") {
		re := regexp.MustCompile(`/images/v2/([^/]+)`)
		matches := re.FindStringSubmatch(titleURL)
		if len(matches) > 1 {
			if id, err := uuid.FromString(matches[1]); err == nil {
				return &id
			}
		}
	}

	return nil
}
