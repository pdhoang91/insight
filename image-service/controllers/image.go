package controllers

import (
	"crypto/rand"
	"encoding/hex"
	"image"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/chai2010/webp"
	"github.com/gin-gonic/gin"
	"github.com/nfnt/resize"
)

// Danh sách các MIME type được phép
var allowedMimeTypes = map[string]bool{
	"image/jpeg": true,
	"image/png":  true,
	"image/gif":  true,
	"image/webp": true,
}

// Kiểm tra MIME type của tệp
func isAllowedMimeType(fileHeader *multipart.FileHeader) bool {
	file, err := fileHeader.Open()
	if err != nil {
		return false
	}
	defer file.Close()

	buffer := make([]byte, 512)
	_, err = file.Read(buffer)
	if err != nil && err != io.EOF {
		return false
	}

	mimeType := http.DetectContentType(buffer)
	return allowedMimeTypes[mimeType]
}

// Tạo prefix duy nhất cho tên tệp
func generatePrefix() (string, error) {
	b := make([]byte, 4)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return hex.EncodeToString(b), nil
}

// UploadImageV2 .. Image upload handler (Giảm kích thước và chuyển đổi sang WebP)
func UploadImageV2(c *gin.Context) {
	const maxUploadSize = 10 << 20 // 10 MB
	c.Request.Body = http.MaxBytesReader(c.Writer, c.Request.Body, maxUploadSize)
	if err := c.Request.ParseMultipartForm(maxUploadSize); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "File quá lớn"})
		return
	}

	file, err := c.FormFile("image")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Không có ảnh được tải lên"})
		return
	}

	if !isAllowedMimeType(file) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Định dạng ảnh không được hỗ trợ"})
		return
	}

	src, err := file.Open()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Không thể mở tệp ảnh"})
		return
	}
	defer src.Close()

	img, _, err := image.Decode(src)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Định dạng ảnh không hợp lệ"})
		return
	}

	maxWidth, maxHeight := 800, 800
	img = resize.Thumbnail(uint(maxWidth), uint(maxHeight), img, resize.Lanczos3)

	prefix, err := generatePrefix()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Không thể tạo tên tệp duy nhất"})
		return
	}

	safeFilename := strings.ReplaceAll(file.Filename, " ", "_")
	filename := strings.TrimSuffix(safeFilename, filepath.Ext(safeFilename)) + ".webp"
	uploadDir := "uploads"

	if err := os.MkdirAll(uploadDir, os.ModePerm); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Không thể tạo thư mục uploads"})
		return
	}

	filePath := filepath.Join(uploadDir, prefix+"_"+filename)
	dst, err := os.Create(filePath)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Không thể lưu ảnh WebP"})
		return
	}
	defer dst.Close()

	if err := webp.Encode(dst, img, &webp.Options{Lossless: true}); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Không thể chuyển đổi ảnh sang WebP"})
		return
	}

	imageURL := "https://" + c.Request.Host + "/uploads/" + prefix + "_" + filename
	c.JSON(http.StatusOK, gin.H{"url": imageURL})
}
