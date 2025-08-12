package controllers

import (
	"context"
	"fmt"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/pdhoang91/image-service/services"
)

// ImageProxyController handles proxied image requests
type ImageProxyController struct {
	s3Service *services.S3Service
}

func NewImageProxyController(s3Service *services.S3Service) *ImageProxyController {
	return &ImageProxyController{
		s3Service: s3Service,
	}
}

// ProxyImage serves images through proxy instead of direct S3 URLs
// URL format: /images/proxy/{userID}/{date}/{type}/{filename}
func (ipc *ImageProxyController) ProxyImage(c *gin.Context) {
	userID := c.Param("userID")
	date := c.Param("date")
	imageType := c.Param("type")
	filename := c.Param("filename")

	// Validate parameters
	if userID == "" || date == "" || imageType == "" || filename == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid image path parameters"})
		return
	}

	// Construct S3 key
	s3Key := fmt.Sprintf("uploads/%s/%s/%s/%s", userID, date, imageType, filename)

	// Get image from S3
	imageData, contentType, err := ipc.s3Service.GetObject(context.Background(), s3Key)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Image not found"})
		return
	}
	defer imageData.Close()

	// Set appropriate headers
	c.Header("Content-Type", contentType)
	c.Header("Cache-Control", "public, max-age=86400") // Cache for 24 hours
	c.Header("ETag", fmt.Sprintf(`"%s"`, s3Key))

	// Stream the image data
	c.DataFromReader(http.StatusOK, -1, contentType, imageData, nil)
}

// GetImageInfo returns metadata about an image without downloading it
func (ipc *ImageProxyController) GetImageInfo(c *gin.Context) {
	userID := c.Param("userID")
	date := c.Param("date")
	imageType := c.Param("type")
	filename := c.Param("filename")

	s3Key := fmt.Sprintf("uploads/%s/%s/%s/%s", userID, date, imageType, filename)

	info, err := ipc.s3Service.GetObjectInfo(context.Background(), s3Key)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Image not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"key":           s3Key,
		"size":          info.Size,
		"last_modified": info.LastModified,
		"content_type":  info.ContentType,
	})
}

// ConvertS3URLToProxy converts direct S3 URLs to proxy URLs in content
func ConvertS3URLToProxy(content, baseURL string) string {
	// Pattern: https://insight.storage.s3.amazonaws.com/uploads/{userID}/{date}/{type}/{filename}
	// Convert to: {baseURL}/images/proxy/{userID}/{date}/{type}/{filename}

	s3Pattern := "https://insight.storage.s3.amazonaws.com/uploads/"
	proxyPattern := baseURL + "/images/proxy/"

	return strings.ReplaceAll(content, s3Pattern, proxyPattern)
}

// ConvertProxyToS3URL converts proxy URLs back to S3 URLs (for internal use)
func ConvertProxyToS3URL(content, baseURL string) string {
	proxyPattern := baseURL + "/images/proxy/"
	s3Pattern := "https://insight.storage.s3.amazonaws.com/uploads/"

	return strings.ReplaceAll(content, proxyPattern, s3Pattern)
}
