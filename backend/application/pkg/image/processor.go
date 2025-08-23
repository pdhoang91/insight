package image

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"mime/multipart"
	"path/filepath"
	"strings"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/pdhoang91/blog/config"
	uuid "github.com/satori/go.uuid"
)

// ImageProcessor handles image processing and S3 operations
type ImageProcessor struct {
	s3Client   *s3.Client
	bucketName string
}

// NewImageProcessor creates a new image processor
func NewImageProcessor(bucketName string) *ImageProcessor {
	return &ImageProcessor{
		s3Client:   config.S3Client,
		bucketName: bucketName,
	}
}

// ProcessAndUploadImage processes and uploads an image to S3
func (p *ImageProcessor) ProcessAndUploadImage(file multipart.File, header *multipart.FileHeader, folder string) (string, error) {
	if p.s3Client == nil {
		return "", fmt.Errorf("S3 client not initialized")
	}

	// Validate file type
	if !p.isValidImageType(header.Filename) {
		return "", fmt.Errorf("invalid image type. Only JPEG, PNG, GIF, and WebP are allowed")
	}

	// Validate file size (max 10MB)
	if header.Size > 10*1024*1024 {
		return "", fmt.Errorf("file size too large. Maximum size is 10MB")
	}

	// Generate unique filename
	ext := filepath.Ext(header.Filename)
	filename := fmt.Sprintf("%s_%d%s", uuid.NewV4().String(), time.Now().Unix(), ext)
	key := fmt.Sprintf("%s/%s", folder, filename)

	// Read file content
	fileContent, err := io.ReadAll(file)
	if err != nil {
		return "", fmt.Errorf("failed to read file content: %w", err)
	}

	// Upload to S3
	_, err = p.s3Client.PutObject(context.TODO(), &s3.PutObjectInput{
		Bucket:      aws.String(p.bucketName),
		Key:         aws.String(key),
		Body:        bytes.NewReader(fileContent),
		ContentType: aws.String(p.getContentType(ext)),
		ACL:         "public-read", // Make the image publicly accessible
	})

	if err != nil {
		return "", fmt.Errorf("failed to upload image to S3: %w", err)
	}

	// Return the public URL
	imageURL := fmt.Sprintf("https://%s.s3.amazonaws.com/%s", p.bucketName, key)
	return imageURL, nil
}

// DeleteImage deletes an image from S3
func (p *ImageProcessor) DeleteImage(imageURL string) error {
	if p.s3Client == nil {
		return fmt.Errorf("S3 client not initialized")
	}

	// Extract key from URL
	key, err := p.extractKeyFromURL(imageURL)
	if err != nil {
		return fmt.Errorf("failed to extract key from URL: %w", err)
	}

	// Delete from S3
	_, err = p.s3Client.DeleteObject(context.TODO(), &s3.DeleteObjectInput{
		Bucket: aws.String(p.bucketName),
		Key:    aws.String(key),
	})

	if err != nil {
		return fmt.Errorf("failed to delete image from S3: %w", err)
	}

	return nil
}

// ProcessImagesInContent extracts and processes images from content
func (p *ImageProcessor) ProcessImagesInContent(content string) ([]string, error) {
	// This is a placeholder for image processing logic
	// In a real implementation, you would:
	// 1. Parse the content for image references
	// 2. Download and process images
	// 3. Upload processed images to S3
	// 4. Return the list of processed image URLs

	// For now, return empty slice
	return []string{}, nil
}

// isValidImageType checks if the file type is a valid image type
func (p *ImageProcessor) isValidImageType(filename string) bool {
	ext := strings.ToLower(filepath.Ext(filename))
	validTypes := []string{".jpg", ".jpeg", ".png", ".gif", ".webp"}

	for _, validType := range validTypes {
		if ext == validType {
			return true
		}
	}
	return false
}

// getContentType returns the MIME type for the file extension
func (p *ImageProcessor) getContentType(ext string) string {
	switch strings.ToLower(ext) {
	case ".jpg", ".jpeg":
		return "image/jpeg"
	case ".png":
		return "image/png"
	case ".gif":
		return "image/gif"
	case ".webp":
		return "image/webp"
	default:
		return "application/octet-stream"
	}
}

// extractKeyFromURL extracts the S3 key from a full S3 URL
func (p *ImageProcessor) extractKeyFromURL(imageURL string) (string, error) {
	// Expected format: https://bucket-name.s3.amazonaws.com/folder/filename.ext
	// or https://s3.amazonaws.com/bucket-name/folder/filename.ext

	if strings.Contains(imageURL, ".s3.amazonaws.com/") {
		parts := strings.Split(imageURL, ".s3.amazonaws.com/")
		if len(parts) == 2 {
			return parts[1], nil
		}
	}

	if strings.Contains(imageURL, "s3.amazonaws.com/") {
		parts := strings.Split(imageURL, "s3.amazonaws.com/")
		if len(parts) == 2 {
			// Remove bucket name from the beginning
			pathParts := strings.SplitN(parts[1], "/", 2)
			if len(pathParts) == 2 {
				return pathParts[1], nil
			}
		}
	}

	return "", fmt.Errorf("invalid S3 URL format")
}

// GetDefaultProcessor returns a default image processor instance
func GetDefaultProcessor() *ImageProcessor {
	bucketName := config.GetString("AWS_S3_BUCKET", "insight-blog-images")
	return NewImageProcessor(bucketName)
}
