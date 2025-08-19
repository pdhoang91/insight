// controller/controller_image.go
package controller

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	uuid "github.com/satori/go.uuid"

	"github.com/pdhoang91/blog/database"
	"github.com/pdhoang91/blog/models"
	"github.com/pdhoang91/blog/utils"
)

// ===== IMAGE METHODS =====

// UploadImage handles image upload to S3
func (ctrl *Controller) UploadImage(c *gin.Context) {
	// Get user ID from context
	userID, err := utils.GetUserIDFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// Get upload type from URL parameter
	uploadTypeStr := c.Param("type")
	imageType := models.ImageType(uploadTypeStr)

	// Validate image type
	if !isValidImageType(imageType) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid image type. Allowed: avatar, title, content, general"})
		return
	}

	// Parse multipart form
	file, header, err := c.Request.FormFile("image")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No file uploaded"})
		return
	}
	defer file.Close()

	// Upload to S3
	result, err := ctrl.S3Manager.UploadToS3(file, header, imageType, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Upload failed: %v", err)})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Image uploaded successfully",
		"data":    result,
	})
}

// DeleteImage handles image deletion
func (ctrl *Controller) DeleteImage(c *gin.Context) {
	// Get user ID from context
	_, err := utils.GetUserIDFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// Get image ID from URL parameter
	imageIDStr := c.Param("id")
	imageID, err := uuid.FromString(imageIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid image ID"})
		return
	}

	// Delete image
	if err := ctrl.deleteImageCompletely(imageID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Image deleted successfully",
	})
}

// GetUserImages returns user's images
func (ctrl *Controller) GetUserImages(c *gin.Context) {
	// Get user ID from context
	userID, err := utils.GetUserIDFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var images []models.Image
	if err := database.DB.Where("user_id = ?", userID).Find(&images).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch images"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": images})
}

// GetImageInfo returns image information
func (ctrl *Controller) GetImageInfo(c *gin.Context) {
	// Get image ID from URL parameter
	imageIDStr := c.Param("id")
	imageID, err := uuid.FromString(imageIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid image ID"})
		return
	}

	var image models.Image
	if err := database.DB.First(&image, imageID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Image not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": image})
}

// LinkImageToPost links an image to a post
func (ctrl *Controller) LinkImageToPost(c *gin.Context) {
	// Get user ID from context
	userID, err := utils.GetUserIDFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var input struct {
		ImageID uuid.UUID `json:"image_id" binding:"required"`
		PostID  uuid.UUID `json:"post_id" binding:"required"`
		Usage   string    `json:"usage" binding:"required"`
		Order   int       `json:"order"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Verify that the post belongs to the user
	var post models.Post
	if err := database.DB.Where("id = ? AND user_id = ?", input.PostID, userID).First(&post).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Post not found or access denied"})
		return
	}

	// Link image to post
	if err := ctrl.linkImageToPost(input.ImageID, input.PostID, models.ImageType(input.Usage)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Image linked to post successfully",
	})
}
