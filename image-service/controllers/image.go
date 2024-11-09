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
)

// Danh sách các MIME type được phép
var allowedMimeTypes = map[string]bool{
	"image/jpeg":      true,
	"image/png":       true,
	"image/gif":       true,
	"image/webp":      true,
	"image/bmp":       true, // Thêm định dạng BMP
	"image/tiff":      true, // Thêm định dạng TIFF
	"application/pdf": true, // Thêm định dạng PDF
}

// Danh sách các loại hình ảnh được phép
var allowedTypes = map[string]bool{
	"avatar":  true,
	"content": true,
	"title":   true,
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
	// Giới hạn kích thước upload
	const maxUploadSize = 10 << 20 // 10 MB
	c.Request.Body = http.MaxBytesReader(c.Writer, c.Request.Body, maxUploadSize)
	if err := c.Request.ParseMultipartForm(maxUploadSize); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "File quá lớn"})
		return
	}

	// Lấy tham số "type" từ form data
	//c.Param("id")
	imageType := c.Param("type")
	if imageType == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Thiếu tham số 'type'"})
		return
	}

	// Kiểm tra giá trị của tham số "type"
	if !allowedTypes[imageType] {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Giá trị 'type' không hợp lệ"})
		return
	}

	// Lấy tệp từ form data
	file, err := c.FormFile("image")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Không có ảnh được tải lên"})
		return
	}

	// Kiểm tra MIME type
	if !isAllowedMimeType(file) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Định dạng ảnh hoặc tệp không được hỗ trợ"})
		return
	}

	// Lấy ngày hiện tại để tạo thư mục con
	currentDate := time.Now().Format("2006-01-02") // Định dạng YYYY-MM-DD
	uploadDir := filepath.Join("images", "uploads", currentDate, imageType)

	// Tạo thư mục nếu chưa tồn tại
	if err := os.MkdirAll(uploadDir, os.ModePerm); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Không thể tạo thư mục uploads"})
		return
	}
	fmt.Println("uploadDir", uploadDir)

	// Tạo prefix duy nhất
	prefix, err := generatePrefix()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Không thể tạo tên tệp duy nhất"})
		return
	}

	// Thay thế khoảng trắng bằng dấu gạch dưới
	safeFilename := strings.ReplaceAll(file.Filename, " ", "_")

	// Định nghĩa đường dẫn tệp
	filePath := filepath.Join(uploadDir, prefix+"_"+safeFilename)
	fmt.Println("filePath", filePath)

	// Lưu tệp vào thư mục uploads
	if err := c.SaveUploadedFile(file, filePath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Không thể lưu ảnh hoặc tệp"})
		return
	}

	// Tạo URL cho ảnh đã tải lên
	imageURL := "https://" + c.Request.Host + "/images/uploads/" + currentDate + "/" + imageType + "/" + prefix + "_" + safeFilename
	//imageURL := "http://" + c.Request.Host + "/images/uploads/" + currentDate + "/" + imageType + "/" + prefix + "_" + safeFilename

	fmt.Println("imageURL", imageURL)
	// Trả về URL của ảnh
	c.JSON(http.StatusOK, gin.H{"url": imageURL})
}
