package controller

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

	"github.com/gin-gonic/gin"
	"github.com/pdhoang91/blog/services"
	"github.com/pdhoang91/blog/utils"
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

	// Đọc 512 byte đầu tiên để xác định MIME type
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
	b := make([]byte, 4) // 8 ký tự hex
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return hex.EncodeToString(b), nil
}

// UploadImage .. Image upload handler (Không xử lý thêm)
func UploadImage(c *gin.Context) {
	// Giới hạn kích thước upload
	const maxUploadSize = 10 << 20 // 10 MB
	c.Request.Body = http.MaxBytesReader(c.Writer, c.Request.Body, maxUploadSize)
	if err := c.Request.ParseMultipartForm(maxUploadSize); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "File quá lớn"})
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
		c.JSON(http.StatusBadRequest, gin.H{"error": "Định dạng ảnh không được hỗ trợ"})
		return
	}

	// Tạo thư mục uploads nếu chưa tồn tại
	uploadDir := "uploads"
	if err := os.MkdirAll(uploadDir, os.ModePerm); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Không thể tạo thư mục uploads"})
		return
	}

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

	// Lưu tệp vào thư mục uploads
	if err := c.SaveUploadedFile(file, filePath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Không thể lưu ảnh"})
		return
	}

	// Tạo URL cho ảnh đã tải lên
	imageURL := "https://" + c.Request.Host + "/uploads/" + prefix + "_" + safeFilename

	// Trả về URL của ảnh
	c.JSON(http.StatusOK, gin.H{"url": imageURL})
}

// Image upload functionality migrated from image-service

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

func isAllowedImageMimeType(fileHeader *multipart.FileHeader) bool {
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
	return allowedImageMimeTypes[mimeType]
}

func generateImagePrefix() (string, error) {
	b := make([]byte, 4)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return hex.EncodeToString(b), nil
}

// GetUserIDFromContext lấy userID từ context
func GetUserIDFromContext(c *gin.Context) (string, error) {
	userIDInterface, exists := c.Get("userID")
	if !exists {
		return "", fmt.Errorf("user not authenticated")
	}

	switch v := userIDInterface.(type) {
	case string:
		return v, nil
	case float64:
		return fmt.Sprintf("%.0f", v), nil
	case int:
		return fmt.Sprintf("%d", v), nil
	default:
		return "", fmt.Errorf("invalid user ID type")
	}
}

// UploadImageV2 handles image upload to S3
func UploadImageV2(c *gin.Context) {
	fmt.Printf("DEBUG UPLOAD: Starting image upload\n")

	userID, err := GetUserIDFromContext(c)
	if err != nil {
		fmt.Printf("DEBUG UPLOAD: GetUserIDFromContext error: %v\n", err)
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	fmt.Printf("DEBUG UPLOAD: UserID: %s\n", userID)

	c.Request.Body = http.MaxBytesReader(c.Writer, c.Request.Body, maxImageUploadSize)
	if err := c.Request.ParseMultipartForm(maxImageUploadSize); err != nil {
		fmt.Printf("DEBUG UPLOAD: ParseMultipartForm error: %v\n", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "File quá lớn"})
		return
	}

	imageType := c.Param("type")
	fmt.Printf("DEBUG UPLOAD: ImageType: %s\n", imageType)
	if !allowedImageTypes[imageType] {
		fmt.Printf("DEBUG UPLOAD: Invalid image type: %s\n", imageType)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Giá trị 'type' không hợp lệ"})
		return
	}

	file, err := c.FormFile("image")
	if err != nil {
		fmt.Printf("DEBUG UPLOAD: FormFile error: %v\n", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Không có ảnh được tải lên"})
		return
	}

	fmt.Printf("DEBUG UPLOAD: File: %s, Size: %d\n", file.Filename, file.Size)

	// Check if file is empty
	if file.Size == 0 {
		fmt.Printf("DEBUG UPLOAD: Empty file detected\n")
		response := gin.H{"error": "File trống, vui lòng chọn file khác"}
		fmt.Printf("DEBUG UPLOAD: Response: %+v\n", response)
		c.JSON(http.StatusBadRequest, response)
		return
	}

	if !isAllowedImageMimeType(file) {
		fmt.Printf("DEBUG UPLOAD: Invalid MIME type - File: %s, Size: %d, Header: %v\n", file.Filename, file.Size, file.Header)
		response := gin.H{"error": "Định dạng ảnh hoặc tệp không được hỗ trợ"}
		fmt.Printf("DEBUG UPLOAD: Response: %+v\n", response)
		c.JSON(http.StatusBadRequest, response)
		return
	}

	prefix, err := generateImagePrefix()
	if err != nil {
		fmt.Printf("DEBUG UPLOAD: generateImagePrefix error: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Không thể tạo tên tệp duy nhất"})
		return
	}

	fmt.Printf("DEBUG UPLOAD: Prefix: %s\n", prefix)

	// Create S3 service
	s3Service := services.NewS3Service()
	fmt.Printf("DEBUG UPLOAD: S3Service created\n")

	// Upload to S3 and get the direct S3 URL
	s3URL, err := s3Service.UploadFile(c.Request.Context(), file, userID, imageType, prefix)
	if err != nil {
		fmt.Printf("DEBUG UPLOAD: S3 UploadFile error: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Không thể tải ảnh lên S3"})
		return
	}

	fmt.Printf("DEBUG UPLOAD: S3 URL: %s\n", s3URL)

	// Convert S3 URL to proxy URL
	proxyURL := utils.ConvertS3URLToProxy(s3URL)

	c.JSON(http.StatusOK, gin.H{
		"url":    proxyURL,
		"s3_url": s3URL, // Optional: keep for debugging/migration
	})
}

// ImageProxyController handles proxied image requests
type ImageProxyController struct {
	s3Service *services.S3Service
}

func NewImageProxyController() *ImageProxyController {
	return &ImageProxyController{
		s3Service: services.NewS3Service(),
	}
}

// ProxyImage serves images from S3
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
	imageData, contentType, err := ipc.s3Service.GetObject(c.Request.Context(), s3Key)
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

// GetImageInfo returns metadata about an image
func (ipc *ImageProxyController) GetImageInfo(c *gin.Context) {
	userID := c.Param("userID")
	date := c.Param("date")
	imageType := c.Param("type")
	filename := c.Param("filename")

	s3Key := fmt.Sprintf("uploads/%s/%s/%s/%s", userID, date, imageType, filename)

	info, err := ipc.s3Service.GetObjectInfo(c.Request.Context(), s3Key)
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
