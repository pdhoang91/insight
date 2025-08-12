package controllers

import (
	"crypto/rand"
	"encoding/hex"
	"io"
	"mime/multipart"
	"net/http"
	"path/filepath"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/pdhoang91/image-service/services"
	"github.com/pdhoang91/image-service/utils"
)

const maxUploadSize = 10 << 20 // 10 MB

var (
	allowedMimeTypes = map[string]bool{
		"image/jpeg":      true,
		"image/png":       true,
		"image/gif":       true,
		"image/webp":      true,
		"image/bmp":       true,
		"image/tiff":      true,
		"application/pdf": true,
	}
	allowedTypes = map[string]bool{
		"avatar":  true,
		"content": true,
		"title":   true,
	}
)

func isAllowedMimeType(fileHeader *multipart.FileHeader) bool {
	file, err := fileHeader.Open()
	if err != nil {
		return false
	}
	defer file.Close()

	buffer := make([]byte, maxUploadSize)
	_, err = file.Read(buffer)
	if err != nil && err != io.EOF {
		return false
	}

	mimeType := http.DetectContentType(buffer)
	return allowedMimeTypes[mimeType]
}

func generatePrefix() (string, error) {
	b := make([]byte, 4)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return hex.EncodeToString(b), nil
}

func getImageUploadDir(userID, imageType string) string {
	currentDate := time.Now().Format("2006-01-02")
	return filepath.Join("images", "uploads", userID, currentDate, imageType)
}

func saveImageFile(c *gin.Context, file *multipart.FileHeader, uploadDir, prefix string) (string, error) {
	safeFilename := strings.ReplaceAll(file.Filename, " ", "_")
	filePath := filepath.Join(uploadDir, prefix+"_"+safeFilename)
	if err := c.SaveUploadedFile(file, filePath); err != nil {
		return "", err
	}
	return filePath, nil
}

// Thêm đối số s3Service vào UploadImageV2
func UploadImageV2(c *gin.Context, s3Service *services.S3Service) {
	userID, err := utils.GetUserIDFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	c.Request.Body = http.MaxBytesReader(c.Writer, c.Request.Body, maxUploadSize)
	if err := c.Request.ParseMultipartForm(maxUploadSize); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "File quá lớn"})
		return
	}

	imageType := c.Param("type")
	if !allowedTypes[imageType] {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Giá trị 'type' không hợp lệ"})
		return
	}

	file, err := c.FormFile("image")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Không có ảnh được tải lên"})
		return
	}

	if !isAllowedMimeType(file) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Định dạng ảnh hoặc tệp không được hỗ trợ"})
		return
	}

	prefix, err := generatePrefix()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Không thể tạo tên tệp duy nhất"})
		return
	}

	// Upload to S3 and get the direct S3 URL
	s3URL, err := s3Service.UploadFile(c.Request.Context(), file, userID.String(), imageType, prefix)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Không thể tải ảnh lên S3"})
		return
	}

	// Convert S3 URL to proxy URL
	baseURL := getBaseImageServiceURL()
	proxyURL := ConvertS3URLToProxy(s3URL, baseURL)

	c.JSON(http.StatusOK, gin.H{
		"url":    proxyURL,
		"s3_url": s3URL, // Optional: keep for debugging/migration
	})
}

// getBaseImageServiceURL gets the base URL for the image service
func getBaseImageServiceURL() string {
	// You can get this from environment variables or config
	// For now, using a placeholder - should be configured based on your setup
	return "http://localhost:82" // or your actual image service URL
}
