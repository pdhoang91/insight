// services/post_image_service.go
package services

import (
	"fmt"
	"regexp"

	uuid "github.com/satori/go.uuid"

	"github.com/pdhoang91/blog/database"
	"github.com/pdhoang91/blog/models"
)

// PostImageService handles post-image relationships
type PostImageService struct {
	s3Service      *S3Service
	cleanupService *ImageCleanupService
}

// NewPostImageService creates a new post image service
func NewPostImageService() (*PostImageService, error) {
	s3Service, err := NewS3Service()
	if err != nil {
		return nil, err
	}

	cleanupService, err := NewImageCleanupService()
	if err != nil {
		return nil, err
	}

	return &PostImageService{
		s3Service:      s3Service,
		cleanupService: cleanupService,
	}, nil
}

// ProcessPostContent processes post content and manages image relationships
func (pis *PostImageService) ProcessPostContent(postID uuid.UUID, content string, titleImageID *uuid.UUID) error {
	// Start transaction
	tx := database.DB.Begin()
	if tx.Error != nil {
		return tx.Error
	}
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// Remove existing image links for this post
	if err := tx.Where("post_id = ?", postID).Delete(&models.PostImage{}).Error; err != nil {
		tx.Rollback()
		return fmt.Errorf("failed to remove existing image links: %w", err)
	}

	// Link title image if provided
	if titleImageID != nil {
		titleLink := &models.PostImage{
			PostID:  postID,
			ImageID: *titleImageID,
			Usage:   "title",
			Order:   0,
		}
		if err := tx.Create(titleLink).Error; err != nil {
			tx.Rollback()
			return fmt.Errorf("failed to link title image: %w", err)
		}
	}

	// Extract and link content images
	imageIDs := pis.extractImageIDsFromContent(content)
	for i, imageID := range imageIDs {
		contentLink := &models.PostImage{
			PostID:  postID,
			ImageID: imageID,
			Usage:   "content",
			Order:   i,
		}
		if err := tx.Create(contentLink).Error; err != nil {
			tx.Rollback()
			return fmt.Errorf("failed to link content image %s: %w", imageID, err)
		}
	}

	return tx.Commit().Error
}

// CleanupPostImages removes image links when a post is deleted and triggers cleanup
func (pis *PostImageService) CleanupPostImages(postID uuid.UUID) error {
	// Trigger async cleanup - this will handle the actual cleanup logic
	pis.cleanupService.CleanupPostImagesAsync(postID, "delete")

	return nil
}

// UpdatePostImages updates image relationships for a post and triggers cleanup
func (pis *PostImageService) UpdatePostImages(postID uuid.UUID, content string, titleImageID *uuid.UUID) error {
	err := pis.ProcessPostContent(postID, content, titleImageID)
	if err != nil {
		return err
	}

	// Trigger async cleanup for orphaned images
	pis.cleanupService.CleanupPostImagesAsync(postID, "update")

	return nil
}

// GetPostImages returns all images for a post
func (pis *PostImageService) GetPostImages(postID uuid.UUID) (map[string][]models.Image, error) {
	result := make(map[string][]models.Image)

	var postImages []struct {
		models.PostImage
		Image models.Image `gorm:"embedded"`
	}

	err := database.DB.
		Table("post_images").
		Select("post_images.*, images.*").
		Joins("JOIN images ON images.id = post_images.image_id").
		Where("post_images.post_id = ? AND images.status = ?", postID, models.ImageStatusActive).
		Order("post_images.usage, post_images.order").
		Find(&postImages).Error

	if err != nil {
		return nil, err
	}

	for _, pi := range postImages {
		result[pi.Usage] = append(result[pi.Usage], pi.Image)
	}

	return result, nil
}

// ProcessContentForDisplay converts image IDs in content to URLs
func (pis *PostImageService) ProcessContentForDisplay(content string) string {
	// Replace image references with actual URLs
	// Pattern: [image:image_id] or <img data-image-id="image_id">

	// Handle [image:uuid] format
	imageRefPattern := regexp.MustCompile(`\[image:([a-fA-F0-9-]{36})\]`)
	content = imageRefPattern.ReplaceAllStringFunc(content, func(match string) string {
		matches := imageRefPattern.FindStringSubmatch(match)
		if len(matches) < 2 {
			return match
		}

		imageID, err := uuid.FromString(matches[1])
		if err != nil {
			return match
		}

		var image models.Image
		if err := database.DB.Where("id = ? AND status = ?", imageID, models.ImageStatusActive).First(&image).Error; err != nil {
			return match // Image not found, keep original
		}

		return fmt.Sprintf(`<img src="%s" alt="%s" class="content-image">`, image.GetCDNURL(), image.Filename)
	})

	// Handle <img data-image-id="uuid"> format
	dataImagePattern := regexp.MustCompile(`<img([^>]*)\s+data-image-id="([a-fA-F0-9-]{36})"([^>]*)>`)
	content = dataImagePattern.ReplaceAllStringFunc(content, func(match string) string {
		matches := dataImagePattern.FindStringSubmatch(match)
		if len(matches) < 3 {
			return match
		}

		imageID, err := uuid.FromString(matches[2])
		if err != nil {
			return match
		}

		var image models.Image
		if err := database.DB.Where("id = ? AND status = ?", imageID, models.ImageStatusActive).First(&image).Error; err != nil {
			return match // Image not found, keep original
		}

		// Preserve other attributes but replace src
		return fmt.Sprintf(`<img%s src="%s"%s>`, matches[1], image.GetCDNURL(), matches[3])
	})

	return content
}

// ProcessContentForSaving converts image URLs in content to IDs for storage
func (pis *PostImageService) ProcessContentForSaving(content string) string {
	// This is the reverse of ProcessContentForDisplay
	// Convert image URLs back to references for storage

	// Pattern to match our generated image tags
	imgPattern := regexp.MustCompile(`<img[^>]*src="([^"]*)"[^>]*class="content-image"[^>]*>`)
	content = imgPattern.ReplaceAllStringFunc(content, func(match string) string {
		matches := imgPattern.FindStringSubmatch(match)
		if len(matches) < 2 {
			return match
		}

		imageURL := matches[1]

		// Find image by URL
		var image models.Image
		if err := database.DB.Where("original_url = ? AND status = ?", imageURL, models.ImageStatusActive).First(&image).Error; err != nil {
			return match // Image not found, keep original
		}

		return fmt.Sprintf(`[image:%s]`, image.ID)
	})

	return content
}

// ExtractImageIDsFromContent extracts image IDs from content (public method)
func (pis *PostImageService) ExtractImageIDsFromContent(content string) []uuid.UUID {
	return pis.extractImageIDsFromContent(content)
}

// extractImageIDsFromContent extracts image IDs from content
func (pis *PostImageService) extractImageIDsFromContent(content string) []uuid.UUID {
	var imageIDs []uuid.UUID

	// Extract from [image:uuid] format
	imageRefPattern := regexp.MustCompile(`\[image:([a-fA-F0-9-]{36})\]`)
	matches := imageRefPattern.FindAllStringSubmatch(content, -1)

	for _, match := range matches {
		if len(match) >= 2 {
			if imageID, err := uuid.FromString(match[1]); err == nil {
				imageIDs = append(imageIDs, imageID)
			}
		}
	}

	// Extract from data-image-id attributes
	dataImagePattern := regexp.MustCompile(`data-image-id="([a-fA-F0-9-]{36})"`)
	dataMatches := dataImagePattern.FindAllStringSubmatch(content, -1)

	for _, match := range dataMatches {
		if len(match) >= 2 {
			if imageID, err := uuid.FromString(match[1]); err == nil {
				// Avoid duplicates
				found := false
				for _, existing := range imageIDs {
					if existing == imageID {
						found = true
						break
					}
				}
				if !found {
					imageIDs = append(imageIDs, imageID)
				}
			}
		}
	}

	return imageIDs
}

// ValidateImageOwnership validates that all images in content are owned by the user
func (pis *PostImageService) ValidateImageOwnership(content string, titleImageID *uuid.UUID, userID uuid.UUID) error {
	// Collect all image IDs
	var imageIDs []uuid.UUID

	if titleImageID != nil {
		imageIDs = append(imageIDs, *titleImageID)
	}

	contentImageIDs := pis.extractImageIDsFromContent(content)
	imageIDs = append(imageIDs, contentImageIDs...)

	// Check ownership for all images
	for _, imageID := range imageIDs {
		var image models.Image
		err := database.DB.Where("id = ? AND user_id = ? AND status = ?",
			imageID, userID, models.ImageStatusActive).First(&image).Error

		if err != nil {
			return fmt.Errorf("image %s not found or access denied", imageID)
		}
	}

	return nil
}

// GetImageUsageStats returns usage statistics for images
func (pis *PostImageService) GetImageUsageStats(userID uuid.UUID) (map[string]interface{}, error) {
	stats := make(map[string]interface{})

	// Total images by type
	var typeCounts []struct {
		Type  string
		Count int64
	}

	err := database.DB.Model(&models.Image{}).
		Select("type, count(*) as count").
		Where("user_id = ? AND status = ?", userID, models.ImageStatusActive).
		Group("type").
		Find(&typeCounts).Error

	if err != nil {
		return nil, err
	}

	typeStats := make(map[string]int64)
	var totalImages int64
	for _, tc := range typeCounts {
		typeStats[tc.Type] = tc.Count
		totalImages += tc.Count
	}

	// Orphaned images
	var orphanedCount int64
	database.DB.Model(&models.Image{}).
		Where("user_id = ? AND status = ?", userID, models.ImageStatusOrphaned).
		Count(&orphanedCount)

	// Storage usage
	var totalSize int64
	database.DB.Model(&models.Image{}).
		Select("COALESCE(SUM(size), 0)").
		Where("user_id = ? AND status = ?", userID, models.ImageStatusActive).
		Row().Scan(&totalSize)

	stats["total_images"] = totalImages
	stats["by_type"] = typeStats
	stats["orphaned_count"] = orphanedCount
	stats["total_size_bytes"] = totalSize
	stats["total_size_mb"] = float64(totalSize) / (1024 * 1024)

	return stats, nil
}
