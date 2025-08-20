// controller/image_upload_methods.go
package controller

import (
	"fmt"
	"io"
	"mime/multipart"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/pdhoang91/blog/storage"
	"github.com/pdhoang91/blog/utils"
	uuid "github.com/satori/go.uuid"
)

// ProxyImage handles legacy image proxy
func (ctrl *Controller) ProxyImage(c *gin.Context) {
	// Delegate to existing function for now
	GetImageProxyController().ProxyImage(c)
}

// GetImageInfo handles legacy image info
func (ctrl *Controller) GetImageInfo(c *gin.Context) {
	// Delegate to existing function for now
	GetImageProxyController().GetImageInfo(c)
}

// ServeImageProxy handles serving legacy proxy images
func (ctrl *Controller) ServeImageProxy(c *gin.Context) {
	// Delegate to existing function for now
	GetImageProxyController().ProxyImage(c)
}

func isAllowedImageMimeTypeV2(fileHeader *multipart.FileHeader) bool {
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
	allowedTypes := map[string]bool{
		"image/jpeg":      true,
		"image/png":       true,
		"image/gif":       true,
		"image/webp":      true,
		"image/bmp":       true,
		"image/tiff":      true,
		"application/pdf": true,
	}
	return allowedTypes[mimeType]
}

// UploadImageV2 handles image upload using unified controller
func (ctrl *Controller) UploadImageV2(c *gin.Context) {
	fmt.Printf("DEBUG UPLOAD: Starting image upload\n")

	userID, err := utils.GetUserIDFromContext(c)
	if err != nil {
		fmt.Printf("DEBUG UPLOAD: GetUserIDFromContext error: %v\n", err)
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	fmt.Printf("DEBUG UPLOAD: UserID: %s\n", userID)

	const maxUploadSize = 10 << 20 // 10 MB
	c.Request.Body = http.MaxBytesReader(c.Writer, c.Request.Body, maxUploadSize)
	if err := c.Request.ParseMultipartForm(maxUploadSize); err != nil {
		fmt.Printf("DEBUG UPLOAD: ParseMultipartForm error: %v\n", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "File quá lớn"})
		return
	}

	imageType := c.Param("type")
	fmt.Printf("DEBUG UPLOAD: ImageType: %s\n", imageType)
	allowedTypes := map[string]bool{
		"avatar":  true,
		"content": true,
		"title":   true,
	}
	if !allowedTypes[imageType] {
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
		c.JSON(http.StatusBadRequest, gin.H{"error": "File trống, vui lòng chọn file khác"})
		return
	}

	if !isAllowedImageMimeTypeV2(file) {
		fmt.Printf("DEBUG UPLOAD: Invalid MIME type - File: %s, Size: %d\n", file.Filename, file.Size)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Định dạng ảnh hoặc tệp không được hỗ trợ"})
		return
	}

	// Use unified controller's storage manager
	uploadReq := &storage.UploadRequest{
		File:   file,
		UserID: userID,
		Type:   imageType,
	}

	response, err := ctrl.StorageManager.UploadImage(c.Request.Context(), uploadReq)
	if err != nil {
		fmt.Printf("DEBUG UPLOAD: Storage manager error: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Không thể tải ảnh lên"})
		return
	}

	fmt.Printf("DEBUG UPLOAD: Upload successful - ImageID: %s, URL: %s\n", response.ImageID, response.URL)

	// Return in same format as before for compatibility
	c.JSON(http.StatusOK, gin.H{
		"url":       response.URL,
		"image_id":  response.ImageID,
		"file_size": response.Size,
	})
}

// DeleteImageV2 deletes an image using unified controller
func (ctrl *Controller) DeleteImageV2(c *gin.Context) {
	imageID := c.Param("id")
	if imageID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Image ID required"})
		return
	}

	userID, err := utils.GetUserIDFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	// Parse image ID
	imageUUID, err := uuid.FromString(imageID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid image ID"})
		return
	}

	// Get image to verify ownership
	image, err := ctrl.StorageManager.GetImageByID(c.Request.Context(), imageID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Image not found"})
		return
	}

	// Check ownership
	if image.UserID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
		return
	}

	// Delete image using unified controller method
	if err := ctrl.DeleteImageDirectly(c.Request.Context(), imageUUID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete image"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Image deleted successfully"})
}

// ServeImageV2 serves images by ID through unified controller
func (ctrl *Controller) ServeImageV2(c *gin.Context) {
	imageID := c.Param("id")
	if imageID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Image ID required"})
		return
	}

	// Get image metadata
	image, err := ctrl.StorageManager.GetImageByID(c.Request.Context(), imageID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Image not found"})
		return
	}

	// Get the storage provider
	provider, err := ctrl.StorageManager.GetProvider(image.StorageProvider)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Storage provider not available"})
		return
	}

	// For S3, we can redirect to the direct URL
	if image.StorageProvider == "s3" {
		directURL, err := provider.GetURL(c.Request.Context(), image.StorageKey)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate URL"})
			return
		}
		c.Redirect(http.StatusFound, directURL)
		return
	}

	// For other providers, redirect to URL
	imageURL, err := provider.GetURL(c.Request.Context(), image.StorageKey)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get image URL"})
		return
	}

	c.Redirect(http.StatusFound, imageURL)
}

// GetImageInfoV2 returns metadata about an image using unified controller
func (ctrl *Controller) GetImageInfoV2(c *gin.Context) {
	imageID := c.Param("id")
	if imageID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Image ID required"})
		return
	}

	image, err := ctrl.StorageManager.GetImageByID(c.Request.Context(), imageID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Image not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
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
		"url":               ctrl.StorageManager.GetImageURL(image.ID.String()),
	})
}
