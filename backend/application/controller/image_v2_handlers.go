// controller/image_v2_handlers.go
package controller

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/pdhoang91/blog/database"
	"github.com/pdhoang91/blog/models"
	"github.com/pdhoang91/blog/utils"
)

// parseIntDefault parses a string to int with default value
func parseIntDefault(s string, defaultValue int) int {
	if i, err := strconv.Atoi(s); err == nil && i > 0 {
		return i
	}
	return defaultValue
}

// ServeImageV2 serves images by ID through the new system
func ServeImageV2(c *gin.Context) {
	imageID := c.Param("id")
	if imageID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Image ID required"})
		return
	}

	manager := GetStorageManager()

	// Get image metadata
	image, err := manager.GetImageByID(c.Request.Context(), imageID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Image not found"})
		return
	}

	// Get the storage provider
	provider, err := manager.GetProvider(image.StorageProvider)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Storage provider not available"})
		return
	}

	// For S3, we can redirect to the direct URL
	if image.StorageProvider == "s3" {
		directURL, err := provider.GetURL(c.Request.Context(), image.StorageKey)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate URL"})
			return
		}
		c.Redirect(http.StatusFound, directURL)
		return
	}

	// For local storage or other providers, we might need to proxy
	imageURL, err := provider.GetURL(c.Request.Context(), image.StorageKey)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get image URL"})
		return
	}

	c.Redirect(http.StatusFound, imageURL)
}

// GetImageInfoV2 returns metadata about an image
func GetImageInfoV2(c *gin.Context) {
	imageID := c.Param("id")
	if imageID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Image ID required"})
		return
	}

	manager := GetStorageManager()
	image, err := manager.GetImageByID(c.Request.Context(), imageID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Image not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"id":                image.ID,
		"storage_key":       image.StorageKey,
		"storage_provider":  image.StorageProvider,
		"original_filename": image.OriginalFilename,
		"content_type":      image.ContentType,
		"file_size":         image.FileSize,
		"image_type":        image.ImageType,
		"width":             image.Width,
		"height":            image.Height,
		"created_at":        image.CreatedAt,
		"url":               manager.GetImageURL(image.ID.String()),
	})
}

// DeleteImageV2 removes an image
func DeleteImageV2(c *gin.Context) {
	imageID := c.Param("id")
	if imageID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Image ID required"})
		return
	}

	// Get user ID from context for authorization
	userID, err := utils.GetUserIDFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	manager := GetStorageManager()

	// Check if user owns the image
	image, err := manager.GetImageByID(c.Request.Context(), imageID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Image not found"})
		return
	}

	if image.UserID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Not authorized to delete this image"})
		return
	}

	// Delete the image
	if err := manager.DeleteImage(c.Request.Context(), imageID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete image"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Image deleted successfully"})
}

// ListUserImages returns images uploaded by a user
func ListUserImages(c *gin.Context) {
	userID, err := utils.GetUserIDFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// Parse query parameters
	imageType := c.Query("type") // optional filter by type
	page := parseIntDefault(c.Query("page"), 1)
	limit := parseIntDefault(c.Query("limit"), 20)
	offset := (page - 1) * limit

	// Build query
	query := database.DB.Where("user_id = ?", userID)
	if imageType != "" {
		query = query.Where("image_type = ?", imageType)
	}

	// Get total count
	var total int64
	query.Model(&models.Image{}).Count(&total)

	// Get images
	var images []models.Image
	if err := query.Order("created_at DESC").Limit(limit).Offset(offset).Find(&images).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get images"})
		return
	}

	// Add URLs to response
	manager := GetStorageManager()
	imageResponses := make([]map[string]interface{}, len(images))
	for i, img := range images {
		imageResponses[i] = map[string]interface{}{
			"id":                img.ID,
			"original_filename": img.OriginalFilename,
			"content_type":      img.ContentType,
			"file_size":         img.FileSize,
			"image_type":        img.ImageType,
			"created_at":        img.CreatedAt,
			"url":               manager.GetImageURL(img.ID.String()),
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"images":      imageResponses,
		"total_count": total,
		"page":        page,
		"limit":       limit,
	})
}
