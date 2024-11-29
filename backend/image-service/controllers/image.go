package controllers

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/gin-gonic/gin"

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

func UploadImageV2(c *gin.Context) {
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

	uploadDir := getImageUploadDir(userID.String(), imageType)
	if err := os.MkdirAll(uploadDir, os.ModePerm); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Không thể tạo thư mục uploads"})
		return
	}

	prefix, err := generatePrefix()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Không thể tạo tên tệp duy nhất"})
		return
	}

	filePath, err := saveImageFile(c, file, uploadDir, prefix)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Không thể lưu ảnh hoặc tệp"})
		return
	}

	imageURL := fmt.Sprintf("http://%s/images/uploads/%s/%s/%s/%s", c.Request.Host, userID, time.Now().Format("2006-01-02"), imageType, filepath.Base(filePath))
	c.JSON(http.StatusOK, gin.H{"url": imageURL})
}
