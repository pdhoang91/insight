package controller

import (
	"fmt"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	uuid "github.com/satori/go.uuid"
)

// ==================== IMAGE ROUTES ====================

const maxImageUploadSize = 10 << 20 // 10 MB

var (
	allowedImageMimeTypes = map[string]bool{
		"image/jpeg":      true,
		"image/png":       true,
		"image/gif":       true,
		"image/webp":      true,
		"image/bmp":       true,
		"image/tiff":      true,
		"application/pdf": true,
	}
	allowedImageTypes = map[string]bool{
		"avatar":  true,
		"content": true,
		"title":   true,
	}
)

// parseIntDefault parses a string to int with default value
func parseIntDefault(s string, defaultValue int) int {
	if i, err := strconv.Atoi(s); err == nil && i > 0 {
		return i
	}
	return defaultValue
}

// UploadImageV2 handles image upload using new storage system
func (c *Controller) UploadImageV2(ctx *gin.Context) {
	// Get user ID from context
	userIDStr, exists := ctx.Get("userID")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	userID, err := uuid.FromString(fmt.Sprintf("%v", userIDStr))
	if err != nil {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid user ID"})
		return
	}

	// Parse multipart form
	ctx.Request.Body = http.MaxBytesReader(ctx.Writer, ctx.Request.Body, maxImageUploadSize)
	if err := ctx.Request.ParseMultipartForm(maxImageUploadSize); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "File quá lớn"})
		return
	}

	// Get image type from URL parameter
	imageType := ctx.Param("type")
	if !allowedImageTypes[imageType] {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Giá trị 'type' không hợp lệ"})
		return
	}

	// Get file from form
	file, err := ctx.FormFile("image")
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Không có ảnh được tải lên"})
		return
	}

	// Check if file is empty
	if file.Size == 0 {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "File trống, vui lòng chọn file khác"})
		return
	}

	// Upload image using service
	response, err := c.service.UploadImageV2(ctx.Request.Context(), file, userID, imageType)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Không thể tải ảnh lên"})
		return
	}

	// Return URL for compatibility
	ctx.JSON(http.StatusOK, gin.H{
		"url": response.URL,
	})
}

// ServeImageV2 serves images by ID through the new system
func (c *Controller) ServeImageV2(ctx *gin.Context) {
	imageID := ctx.Param("id")
	if imageID == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Image ID required"})
		return
	}

	// Get image metadata
	image, err := c.service.GetImageByID(ctx.Request.Context(), imageID)
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "Image not found"})
		return
	}

	// Get the storage provider
	provider, err := c.service.StorageManager.GetProvider(image.StorageProvider)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Storage provider not available"})
		return
	}

	// For S3, we can redirect to the direct URL
	if image.StorageProvider == "s3" {
		directURL, err := provider.GetURL(ctx.Request.Context(), image.StorageKey)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate URL"})
			return
		}
		ctx.Redirect(http.StatusFound, directURL)
		return
	}

	// For local storage or other providers, we might need to proxy
	imageURL, err := provider.GetURL(ctx.Request.Context(), image.StorageKey)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get image URL"})
		return
	}

	ctx.Redirect(http.StatusFound, imageURL)
}

// GetImageInfoV2 returns metadata about an image
func (c *Controller) GetImageInfoV2(ctx *gin.Context) {
	imageID := ctx.Param("id")
	if imageID == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Image ID required"})
		return
	}

	image, err := c.service.GetImageByID(ctx.Request.Context(), imageID)
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "Image not found"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
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
		"url":               c.service.StorageManager.GetImageURL(image.ID.String()),
	})
}

// DeleteImageV2 removes an image
func (c *Controller) DeleteImageV2(ctx *gin.Context) {
	imageID := ctx.Param("id")
	if imageID == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Image ID required"})
		return
	}

	// Get user ID from context
	userIDStr, exists := ctx.Get("userID")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	userID, err := uuid.FromString(fmt.Sprintf("%v", userIDStr))
	if err != nil {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid user ID"})
		return
	}

	// Delete the image using service
	if err := c.service.DeleteImageV2(ctx.Request.Context(), imageID, userID); err != nil {
		if err.Error() == "not authorized to delete this image" {
			ctx.JSON(http.StatusForbidden, gin.H{"error": "Not authorized to delete this image"})
			return
		}
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete image"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "Image deleted successfully"})
}

// ListUserImages returns images uploaded by a user
func (c *Controller) ListUserImages(ctx *gin.Context) {
	// Get user ID from context
	userIDStr, exists := ctx.Get("userID")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	userID, err := uuid.FromString(fmt.Sprintf("%v", userIDStr))
	if err != nil {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid user ID"})
		return
	}

	// Parse query parameters
	imageType := ctx.Query("type") // optional filter by type
	page := parseIntDefault(ctx.Query("page"), 1)
	limit := parseIntDefault(ctx.Query("limit"), 20)

	// Get images using service
	images, total, err := c.service.ListUserImages(ctx.Request.Context(), userID, imageType, page, limit)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get images"})
		return
	}

	// Add URLs to response
	imageResponses := make([]map[string]interface{}, len(images))
	for i, img := range images {
		imageResponses[i] = map[string]interface{}{
			"id":                img.ID,
			"original_filename": img.OriginalFilename,
			"content_type":      img.ContentType,
			"file_size":         img.FileSize,
			"image_type":        img.ImageType,
			"created_at":        img.CreatedAt,
			"url":               c.service.StorageManager.GetImageURL(img.ID.String()),
		}
	}

	ctx.JSON(http.StatusOK, gin.H{
		"images":      imageResponses,
		"total_count": total,
		"page":        page,
		"limit":       limit,
	})
}

// ProxyImage serves images from legacy S3 paths
// URL format: /images/proxy/{userID}/{date}/{type}/{filename}
func (c *Controller) ProxyImage(ctx *gin.Context) {
	userID := ctx.Param("userID")
	date := ctx.Param("date")
	imageType := ctx.Param("type")
	filename := ctx.Param("filename")

	// Validate parameters
	if userID == "" || date == "" || imageType == "" || filename == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid image path parameters"})
		return
	}

	// Try new system first - check if this is a migrated image
	legacyURL := fmt.Sprintf("/images/proxy/%s/%s/%s/%s", userID, date, imageType, filename)

	if imageID, err := c.service.StorageManager.LegacyURLToImageID(legacyURL); err == nil {
		// Found in new system, redirect to new endpoint
		newURL := c.service.StorageManager.GetImageURL(imageID)
		ctx.Redirect(http.StatusMovedPermanently, newURL)
		return
	}

	// Fallback to legacy S3 proxy - construct S3 URL and redirect
	s3Key := fmt.Sprintf("uploads/%s/%s/%s/%s", userID, date, imageType, filename)
	s3URL := fmt.Sprintf("https://insight.storage.s3.amazonaws.com/%s", s3Key)

	ctx.Redirect(http.StatusFound, s3URL)
}

// GetImageInfo returns metadata about a legacy image
func (c *Controller) GetImageInfo(ctx *gin.Context) {
	userID := ctx.Param("userID")
	date := ctx.Param("date")
	imageType := ctx.Param("type")
	filename := ctx.Param("filename")

	s3Key := fmt.Sprintf("uploads/%s/%s/%s/%s", userID, date, imageType, filename)

	ctx.JSON(http.StatusOK, gin.H{
		"key":           s3Key,
		"legacy":        true,
		"proxy_url":     fmt.Sprintf("/images/proxy/%s/%s/%s/%s", userID, date, imageType, filename),
		"direct_s3_url": fmt.Sprintf("https://insight.storage.s3.amazonaws.com/%s", s3Key),
	})
}
