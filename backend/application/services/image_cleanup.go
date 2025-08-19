// services/image_cleanup.go
package services

import (
	"log"
	"time"

	uuid "github.com/satori/go.uuid"

	"github.com/pdhoang91/blog/database"
	"github.com/pdhoang91/blog/models"
)

// ImageCleanupService handles event-triggered image cleanup
type ImageCleanupService struct {
	s3Service *S3Service
}

// NewImageCleanupService creates a new image cleanup service
func NewImageCleanupService() (*ImageCleanupService, error) {
	s3Service, err := NewS3Service()
	if err != nil {
		return nil, err
	}

	return &ImageCleanupService{
		s3Service: s3Service,
	}, nil
}

// CleanupPostImagesAsync triggers async cleanup when a post is updated/deleted
func (ics *ImageCleanupService) CleanupPostImagesAsync(postID uuid.UUID, action string) {
	go func() {
		log.Printf("Starting async image cleanup for post %s (action: %s)", postID, action)

		if err := ics.cleanupPostImages(postID, action); err != nil {
			log.Printf("Error during post image cleanup: %v", err)
		}
	}()
}

// cleanupPostImages handles the actual cleanup logic
func (ics *ImageCleanupService) cleanupPostImages(postID uuid.UUID, action string) error {
	switch action {
	case "update":
		return ics.handlePostUpdate(postID)
	case "delete":
		return ics.handlePostDelete(postID)
	default:
		log.Printf("Unknown cleanup action: %s", action)
		return nil
	}
}

// handlePostUpdate cleans up images when post is updated
func (ics *ImageCleanupService) handlePostUpdate(postID uuid.UUID) error {
	log.Printf("Handling post update cleanup for post %s", postID)

	// Get current post-image relationships
	var currentLinks []models.PostImage
	if err := database.DB.Where("post_id = ?", postID).Find(&currentLinks).Error; err != nil {
		return err
	}

	// Get current post content to extract referenced images
	var post models.Post
	if err := database.DB.First(&post, postID).Error; err != nil {
		return err
	}

	var postContent models.PostContent
	if err := database.DB.Where("post_id = ?", postID).First(&postContent).Error; err != nil {
		log.Printf("No content found for post %s", postID)
		return nil
	}

	// Extract image IDs from current content
	postImageService, err := NewPostImageService()
	if err != nil {
		return err
	}

	currentImageIDs := postImageService.ExtractImageIDsFromContent(postContent.Content)

	// Add title image if exists
	if post.ImageTitle != "" {
		if titleImageID, err := uuid.FromString(post.ImageTitle); err == nil {
			currentImageIDs = append(currentImageIDs, titleImageID)
		}
	}

	// Find images that were linked but are no longer referenced
	var orphanedImageIDs []uuid.UUID
	for _, link := range currentLinks {
		found := false
		for _, currentID := range currentImageIDs {
			if link.ImageID == currentID {
				found = true
				break
			}
		}
		if !found {
			orphanedImageIDs = append(orphanedImageIDs, link.ImageID)
		}
	}

	// Mark orphaned images and check if they can be deleted
	for _, imageID := range orphanedImageIDs {
		ics.handleOrphanedImage(imageID)
	}

	log.Printf("Post update cleanup completed for post %s, orphaned %d images", postID, len(orphanedImageIDs))
	return nil
}

// handlePostDelete cleans up all images when post is deleted
func (ics *ImageCleanupService) handlePostDelete(postID uuid.UUID) error {
	log.Printf("Handling post delete cleanup for post %s", postID)

	// Get all images linked to this post
	var postImages []models.PostImage
	if err := database.DB.Where("post_id = ?", postID).Find(&postImages).Error; err != nil {
		return err
	}

	// Remove all post-image links
	if err := database.DB.Where("post_id = ?", postID).Delete(&models.PostImage{}).Error; err != nil {
		return err
	}

	// Check each image to see if it's now orphaned
	for _, postImage := range postImages {
		ics.handleOrphanedImage(postImage.ImageID)
	}

	log.Printf("Post delete cleanup completed for post %s, processed %d images", postID, len(postImages))
	return nil
}

// handleOrphanedImage checks if an image is orphaned and handles cleanup
func (ics *ImageCleanupService) handleOrphanedImage(imageID uuid.UUID) {
	// Check if image is still linked to any post
	var linkCount int64
	database.DB.Model(&models.PostImage{}).Where("image_id = ?", imageID).Count(&linkCount)

	if linkCount == 0 {
		// Image is orphaned, mark it and schedule for deletion
		var image models.Image
		if err := database.DB.First(&image, imageID).Error; err != nil {
			log.Printf("Error finding image %s: %v", imageID, err)
			return
		}

		// Mark as orphaned
		image.MarkAsOrphaned()
		if err := database.DB.Save(&image).Error; err != nil {
			log.Printf("Error marking image %s as orphaned: %v", imageID, err)
			return
		}

		// Schedule for deletion after a delay (give time for potential recovery)
		ics.scheduleImageDeletion(imageID, 24*time.Hour) // Delete after 24 hours

		log.Printf("Image %s marked as orphaned and scheduled for deletion", imageID)
	}
}

// scheduleImageDeletion schedules an image for deletion after a delay
func (ics *ImageCleanupService) scheduleImageDeletion(imageID uuid.UUID, delay time.Duration) {
	go func() {
		time.Sleep(delay)

		// Double-check that image is still orphaned
		var linkCount int64
		database.DB.Model(&models.PostImage{}).Where("image_id = ?", imageID).Count(&linkCount)

		if linkCount > 0 {
			log.Printf("Image %s is no longer orphaned, skipping deletion", imageID)
			return
		}

		// Get image info
		var image models.Image
		if err := database.DB.First(&image, imageID).Error; err != nil {
			log.Printf("Error finding image %s for deletion: %v", imageID, err)
			return
		}

		// Delete from S3
		if err := ics.s3Service.DeleteFromS3(image.S3Key); err != nil {
			log.Printf("Error deleting image %s from S3: %v", imageID, err)
		} else {
			log.Printf("Successfully deleted image %s from S3", imageID)
		}

		// Mark as deleted in database
		image.MarkAsDeleted()
		if err := database.DB.Save(&image).Error; err != nil {
			log.Printf("Error marking image %s as deleted: %v", imageID, err)
		}

		log.Printf("Image %s cleanup completed", imageID)
	}()
}

// CleanupUserImagesAsync triggers cleanup for all user's orphaned images
func (ics *ImageCleanupService) CleanupUserImagesAsync(userID uuid.UUID) {
	go func() {
		log.Printf("Starting user image cleanup for user %s", userID)

		// Find user's orphaned images older than 24 hours
		cutoffTime := time.Now().Add(-24 * time.Hour)

		var orphanedImages []models.Image
		err := database.DB.Where("user_id = ? AND status = ? AND updated_at < ?",
			userID, models.ImageStatusOrphaned, cutoffTime).Find(&orphanedImages).Error

		if err != nil {
			log.Printf("Error finding orphaned images for user %s: %v", userID, err)
			return
		}

		if len(orphanedImages) == 0 {
			log.Printf("No orphaned images found for user %s", userID)
			return
		}

		cleaned := 0
		for _, image := range orphanedImages {
			// Delete from S3
			if err := ics.s3Service.DeleteFromS3(image.S3Key); err != nil {
				log.Printf("Error deleting image %s from S3: %v", image.ID, err)
				continue
			}

			// Mark as deleted
			image.MarkAsDeleted()
			if err := database.DB.Save(&image).Error; err != nil {
				log.Printf("Error marking image %s as deleted: %v", image.ID, err)
				continue
			}

			cleaned++
		}

		log.Printf("User image cleanup completed for user %s, cleaned %d images", userID, cleaned)
	}()
}

// TriggerImageCleanup provides a manual way to trigger cleanup
func TriggerImageCleanup(postID uuid.UUID, action string) {
	cleanupService, err := NewImageCleanupService()
	if err != nil {
		log.Printf("Error creating cleanup service: %v", err)
		return
	}

	cleanupService.CleanupPostImagesAsync(postID, action)
}
