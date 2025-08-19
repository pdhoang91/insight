// controllers/image_upload.go
package controller

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	uuid "github.com/satori/go.uuid"

	"github.com/pdhoang91/blog/database"
	"github.com/pdhoang91/blog/models"
	"github.com/pdhoang91/blog/services"
	"github.com/pdhoang91/blog/utils"
)

// ImageController handles image-related operations
type ImageController struct {
	s3Service *services.S3Service
}

// NewImageController creates a new image controller
func NewImageController() (*ImageController, error) {
	s3Service, err := services.NewS3Service()
	if err != nil {
		return nil, err
	}

	return &ImageController{
		s3Service: s3Service,
	}, nil
}

// UploadImage handles image upload to S3
func (ic *ImageController) UploadImage(c *gin.Context) {
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
	result, err := ic.s3Service.UploadImage(userID, imageType, file, header)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    result,
	})
}

// DeleteImage handles image deletion
func (ic *ImageController) DeleteImage(c *gin.Context) {
	// Get user ID from context
	userID, err := utils.GetUserIDFromContext(c)
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
	if err := ic.s3Service.DeleteImage(imageID, userID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Image deleted successfully",
	})
}

// GetUserImages returns paginated list of user's images
func (ic *ImageController) GetUserImages(c *gin.Context) {
	// Get user ID from context
	userID, err := utils.GetUserIDFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// Get pagination parameters
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	imageType := c.Query("type") // Optional filter by type

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 20
	}

	offset := (page - 1) * limit

	// Build query
	query := database.DB.Where("user_id = ? AND status = ?", userID, models.ImageStatusActive)
	if imageType != "" {
		query = query.Where("type = ?", imageType)
	}

	// Get total count
	var total int64
	query.Model(&models.Image{}).Count(&total)

	// Get images
	var images []models.Image
	err = query.Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&images).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch images"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"images":      images,
			"total":       total,
			"page":        page,
			"limit":       limit,
			"total_pages": (total + int64(limit) - 1) / int64(limit),
		},
	})
}

// GetImageInfo returns information about a specific image
func (ic *ImageController) GetImageInfo(c *gin.Context) {
	// Get image ID from URL parameter
	imageIDStr := c.Param("id")
	imageID, err := uuid.FromString(imageIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid image ID"})
		return
	}

	// Get image record
	var image models.Image
	err = database.DB.Where("id = ? AND status = ?", imageID, models.ImageStatusActive).First(&image).Error
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Image not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    image,
	})
}

// LinkImageToPost links an image to a post
func (ic *ImageController) LinkImageToPost(c *gin.Context) {
	var input struct {
		ImageID uuid.UUID `json:"image_id" binding:"required"`
		PostID  uuid.UUID `json:"post_id" binding:"required"`
		Usage   string    `json:"usage" binding:"required"` // "title" or "content"
		Order   int       `json:"order"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get user ID from context
	userID, err := utils.GetUserIDFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// Verify image ownership
	var image models.Image
	err = database.DB.Where("id = ? AND user_id = ? AND status = ?", input.ImageID, userID, models.ImageStatusActive).First(&image).Error
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Image not found or access denied"})
		return
	}

	// Verify post ownership
	var post models.Post
	err = database.DB.Where("id = ? AND user_id = ?", input.PostID, userID).First(&post).Error
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Post not found or access denied"})
		return
	}

	// Link image to post
	if err := ic.s3Service.LinkImageToPost(input.ImageID, input.PostID, input.Usage, input.Order); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Image linked to post successfully",
	})
}

// Helper functions

func isValidImageType(imageType models.ImageType) bool {
	validTypes := []models.ImageType{
		models.ImageTypeAvatar,
		models.ImageTypeTitle,
		models.ImageTypeContent,
		models.ImageTypeGeneral,
	}

	for _, validType := range validTypes {
		if imageType == validType {
			return true
		}
	}
	return false
}
