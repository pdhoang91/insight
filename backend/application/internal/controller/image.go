package controller

import (
	"fmt"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// ==================== IMAGE ROUTES ====================

const maxImageUploadSize = 10 << 20 // 10 MB

var (
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
	userID, ok := requireUserID(ctx)
	if !ok {
		return
	}

	ctx.Request.Body = http.MaxBytesReader(ctx.Writer, ctx.Request.Body, maxImageUploadSize)
	if err := ctx.Request.ParseMultipartForm(maxImageUploadSize); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "File too large"})
		return
	}

	imageType := ctx.Param("type")
	if !allowedImageTypes[imageType] {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid image type"})
		return
	}

	file, err := ctx.FormFile("image")
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "No image uploaded"})
		return
	}

	if file.Size == 0 {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Empty file"})
		return
	}

	response, err := c.service.UploadImageV2(ctx.Request.Context(), file, userID, imageType)
	if err != nil {
		respondError(ctx, err)
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"url": response.URL})
}

// ServeImageV2 serves images by ID through the new system
func (c *Controller) ServeImageV2(ctx *gin.Context) {
	imageID := ctx.Param("id")
	if imageID == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Image ID required"})
		return
	}

	redirectURL, err := c.service.GetImageRedirectURL(ctx.Request.Context(), imageID)
	if err != nil {
		respondError(ctx, err)
		return
	}

	ctx.Redirect(http.StatusFound, redirectURL)
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
		"url":               c.service.GetImageURL(image.ID.String()),
	})
}

// DeleteImageV2 removes an image
func (c *Controller) DeleteImageV2(ctx *gin.Context) {
	imageID := ctx.Param("id")
	if imageID == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Image ID required"})
		return
	}

	userID, ok := requireUserID(ctx)
	if !ok {
		return
	}

	if err := c.service.DeleteImageV2(ctx.Request.Context(), imageID, userID); err != nil {
		respondError(ctx, err)
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "Image deleted successfully"})
}

// ListUserImages returns images uploaded by a user
func (c *Controller) ListUserImages(ctx *gin.Context) {
	userID, ok := requireUserID(ctx)
	if !ok {
		return
	}

	imageType := ctx.Query("type")
	page := parseIntDefault(ctx.Query("page"), 1)
	limit := parseIntDefault(ctx.Query("limit"), 20)

	images, total, err := c.service.ListUserImages(ctx.Request.Context(), userID, imageType, page, limit)
	if err != nil {
		respondError(ctx, err)
		return
	}

	imageResponses := make([]map[string]interface{}, len(images))
	for i, img := range images {
		imageResponses[i] = map[string]interface{}{
			"id":                img.ID,
			"original_filename": img.OriginalFilename,
			"content_type":      img.ContentType,
			"file_size":         img.FileSize,
			"image_type":        img.ImageType,
			"created_at":        img.CreatedAt,
			"url":               c.service.GetImageURL(img.ID.String()),
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
func (c *Controller) ProxyImage(ctx *gin.Context) {
	userID := ctx.Param("userID")
	date := ctx.Param("date")
	imageType := ctx.Param("type")
	filename := ctx.Param("filename")

	if userID == "" || date == "" || imageType == "" || filename == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid image path parameters"})
		return
	}

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
