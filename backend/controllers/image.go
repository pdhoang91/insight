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
	"github.com/disintegration/imaging"
	"github.com/gin-gonic/gin"
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

// UploadImageV2 .. Image upload handler (Giảm kích thước và chuyển đổi sang WebP)
func UploadImageV2(c *gin.Context) {
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

	// Mở tệp đã tải lên
	src, err := file.Open()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Không thể mở tệp ảnh"})
		return
	}
	defer src.Close()

	// Giải mã ảnh
	img, _, err := image.Decode(src)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Định dạng ảnh không hợp lệ"})
		return
	}

	// Giảm kích thước ảnh giữ nguyên tỷ lệ
	maxWidth := 800
	maxHeight := 800
	img = imaging.Fit(img, maxWidth, maxHeight, imaging.Lanczos)

	// Tạo prefix duy nhất
	prefix, err := generatePrefix()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Không thể tạo tên tệp duy nhất"})
		return
	}

	// Thay thế khoảng trắng bằng dấu gạch dưới và đổi đuôi tệp thành .webp
	safeFilename := strings.ReplaceAll(file.Filename, " ", "_")
	filename := strings.TrimSuffix(safeFilename, filepath.Ext(safeFilename)) + ".webp"

	// Định nghĩa thư mục uploads
	uploadDir := "uploads"

	// Tạo thư mục uploads nếu chưa tồn tại
	if err := os.MkdirAll(uploadDir, os.ModePerm); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Không thể tạo thư mục uploads"})
		return
	}

	// Định nghĩa đường dẫn tệp
	filePath := filepath.Join(uploadDir, prefix+"_"+filename)

	// Tạo tệp đích
	dst, err := os.Create(filePath)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Không thể tạo tệp ảnh"})
		return
	}
	defer dst.Close()

	// Mã hóa ảnh sang WebP và lưu nó
	options := &webp.Options{Lossless: false, Quality: 80} // Điều chỉnh chất lượng tại đây
	if err := webp.Encode(dst, img, options); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Không thể mã hóa ảnh sang WebP"})
		return
	}

	// Tạo URL cho ảnh đã tải lên
	imageURL := "https://" + c.Request.Host + "/uploads/" + prefix + "_" + filename

	// Trả về URL của ảnh
	c.JSON(http.StatusOK, gin.H{"url": imageURL})
}
