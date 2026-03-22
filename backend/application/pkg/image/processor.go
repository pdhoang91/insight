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
	uuid "github.com/satori/go.uuid"
)

// ImageProcessor handles image processing and S3 operations
type ImageProcessor struct {
	s3Client   *s3.Client
	bucketName string
	region     string
}

// NewImageProcessor creates a new image processor with an injected S3 client.
func NewImageProcessor(client *s3.Client, bucketName, region string) *ImageProcessor {
	if region == "" {
		region = "us-east-1"
	}
	return &ImageProcessor{
		s3Client:   client,
		bucketName: bucketName,
		region:     region,
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

	// Return path-style public URL (required for bucket names containing dots)
	imageURL := fmt.Sprintf("https://s3.%s.amazonaws.com/%s/%s", p.region, p.bucketName, key)
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
	validTypes := map[string]bool{
		".jpg":  true,
		".jpeg": true,
		".png":  true,
		".gif":  true,
		".webp": true,
		".avif": true,
		".bmp":  true,
		".tiff": true,
		".tif":  true,
		".heic": true,
		".heif": true,
		".svg":  true,
	}
	return validTypes[ext]
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
	case ".avif":
		return "image/avif"
	case ".bmp":
		return "image/bmp"
	case ".tiff", ".tif":
		return "image/tiff"
	case ".heic":
		return "image/heic"
	case ".heif":
		return "image/heif"
	case ".svg":
		return "image/svg+xml"
	default:
		return "application/octet-stream"
	}
}

// extractKeyFromURL extracts the S3 key from a full S3 URL.
// Handles three formats:
//   - Virtual-hosted (legacy, broken for dot-buckets): https://bucket.s3.amazonaws.com/key
//   - Path-style with region (current): https://s3.region.amazonaws.com/bucket/key
//   - Path-style without region (legacy): https://s3.amazonaws.com/bucket/key
func (p *ImageProcessor) extractKeyFromURL(imageURL string) (string, error) {
	// Virtual-hosted style: https://bucket-name.s3.amazonaws.com/key
	if strings.Contains(imageURL, ".s3.amazonaws.com/") {
		parts := strings.Split(imageURL, ".s3.amazonaws.com/")
		if len(parts) == 2 {
			return parts[1], nil
		}
	}

	// Path-style (with or without region): https://s3[.region].amazonaws.com/bucket/key
	if strings.Contains(imageURL, "s3.amazonaws.com/") || strings.Contains(imageURL, "s3."+p.region+".amazonaws.com/") {
		// Split on amazonaws.com/ to get everything after the host
		if _, rest, ok := strings.Cut(imageURL, "amazonaws.com/"); ok {
			// Remove bucket name prefix
			if _, key, ok := strings.Cut(rest, "/"); ok {
				return key, nil
			}
		}
	}

	return "", fmt.Errorf("invalid S3 URL format")
}

