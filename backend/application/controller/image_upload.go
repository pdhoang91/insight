// controllers/image_upload.go
package controller

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/pdhoang91/blog/utils"
)

// UploadImage handles simple image upload to local storage
func UploadImage(c *gin.Context) {
	// Get user ID from context
	userID, err := utils.GetUserIDFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// Get upload type from URL parameter
	uploadType := c.Param("type")
	if uploadType == "" {
		uploadType = "general"
	}

	// Parse multipart form
	file, header, err := c.Request.FormFile("image")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No file uploaded"})
		return
	}
	defer file.Close()

	// Validate file type
	if !isValidImageType(header.Filename) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid file type. Only PNG, JPG, JPEG, GIF are allowed"})
		return
	}

	// Create upload directory if not exists
	uploadDir := filepath.Join("uploads", "images", uploadType)
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create upload directory"})
		return
	}

	// Generate unique filename
	timestamp := time.Now().Unix()
	ext := filepath.Ext(header.Filename)
	filename := fmt.Sprintf("%s_%d%s", userID, timestamp, ext)
	filePath := filepath.Join(uploadDir, filename)

	// Create the file
	dst, err := os.Create(filePath)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create file"})
		return
	}
	defer dst.Close()

	// Copy file content
	if _, err := io.Copy(dst, file); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file"})
		return
	}

	// Generate URL for the uploaded file
	baseURL := getBaseURL(c)
	fileURL := fmt.Sprintf("%s/uploads/images/%s/%s", baseURL, uploadType, filename)

	c.JSON(http.StatusOK, gin.H{
		"url":      fileURL,
		"filename": filename,
		"type":     uploadType,
	})
}

// isValidImageType checks if the file extension is valid
func isValidImageType(filename string) bool {
	ext := strings.ToLower(filepath.Ext(filename))
	validTypes := []string{".jpg", ".jpeg", ".png", ".gif"}

	for _, validType := range validTypes {
		if ext == validType {
			return true
		}
	}
	return false
}

// getBaseURL extracts base URL from request
func getBaseURL(c *gin.Context) string {
	scheme := "http"
	if c.Request.TLS != nil {
		scheme = "https"
	}

	// Check for forwarded headers
	if forwarded := c.GetHeader("X-Forwarded-Proto"); forwarded != "" {
		scheme = forwarded
	}

	host := c.Request.Host
	if forwarded := c.GetHeader("X-Forwarded-Host"); forwarded != "" {
		host = forwarded
	}

	return fmt.Sprintf("%s://%s", scheme, host)
}
