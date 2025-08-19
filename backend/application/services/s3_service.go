// services/s3_service.go
package services

import (
	"bytes"
	"fmt"
	"image"
	_ "image/gif"
	_ "image/jpeg"
	_ "image/png"
	"io"
	"mime/multipart"
	"path/filepath"
	"strings"
	"time"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
	"github.com/aws/aws-sdk-go/service/s3/s3manager"
	uuid "github.com/satori/go.uuid"

	"github.com/pdhoang91/blog/config"
	"github.com/pdhoang91/blog/database"
	"github.com/pdhoang91/blog/models"
)

// S3Service handles S3 operations
type S3Service struct {
	session    *session.Session
	uploader   *s3manager.Uploader
	downloader *s3manager.Downloader
	s3Client   *s3.S3
	config     *config.StorageConfig
}

// UploadResult contains the result of an upload operation
type UploadResult struct {
	ImageID     uuid.UUID `json:"image_id"`
	URL         string    `json:"url"`
	S3Key       string    `json:"s3_key"`
	Filename    string    `json:"filename"`
	ContentType string    `json:"content_type"`
	Size        int64     `json:"size"`
	Width       int       `json:"width"`
	Height      int       `json:"height"`
}

// NewS3Service creates a new S3 service instance
func NewS3Service() (*S3Service, error) {
	storageConfig := config.GetStorageConfig()

	// Validate configuration
	if err := storageConfig.Validate(); err != nil {
		return nil, fmt.Errorf("invalid storage config: %w", err)
	}

	// Create AWS session
	awsConfig := &aws.Config{
		Region: aws.String(storageConfig.S3Config.Region),
		Credentials: credentials.NewStaticCredentials(
			storageConfig.S3Config.AccessKeyID,
			storageConfig.S3Config.SecretAccessKey,
			"",
		),
	}

	// Set custom endpoint if provided (for LocalStack, MinIO, etc.)
	if storageConfig.S3Config.Endpoint != "" {
		awsConfig.Endpoint = aws.String(storageConfig.S3Config.Endpoint)
		awsConfig.S3ForcePathStyle = aws.Bool(true)
	}

	sess, err := session.NewSession(awsConfig)
	if err != nil {
		return nil, fmt.Errorf("failed to create AWS session: %w", err)
	}

	return &S3Service{
		session:    sess,
		uploader:   s3manager.NewUploader(sess),
		downloader: s3manager.NewDownloader(sess),
		s3Client:   s3.New(sess),
		config:     storageConfig,
	}, nil
}

// UploadImage uploads an image to S3 and saves metadata to database
func (s *S3Service) UploadImage(userID uuid.UUID, imageType models.ImageType, file multipart.File, header *multipart.FileHeader) (*UploadResult, error) {
	// Validate file type
	if !s.isValidImageType(header.Filename) {
		return nil, fmt.Errorf("invalid file type: %s", filepath.Ext(header.Filename))
	}

	// Read file content
	fileContent, err := io.ReadAll(file)
	if err != nil {
		return nil, fmt.Errorf("failed to read file: %w", err)
	}

	// Get image dimensions
	width, height, err := s.getImageDimensions(bytes.NewReader(fileContent))
	if err != nil {
		// Don't fail upload for dimension errors, just log and continue
		width, height = 0, 0
	}

	// Generate unique filename
	filename := s.generateFilename(userID, header.Filename)
	s3Key := s.config.GetS3Key(userID.String(), string(imageType), filename)

	// Upload to S3
	result, err := s.uploader.Upload(&s3manager.UploadInput{
		Bucket:      aws.String(s.config.S3Config.Bucket),
		Key:         aws.String(s3Key),
		Body:        bytes.NewReader(fileContent),
		ContentType: aws.String(s.getContentType(header.Filename)),
		// ACL removed - bucket doesn't allow ACLs
		Metadata: map[string]*string{
			"user-id":     aws.String(userID.String()),
			"image-type":  aws.String(string(imageType)),
			"uploaded-at": aws.String(time.Now().Format(time.RFC3339)),
		},
	})
	if err != nil {
		return nil, fmt.Errorf("failed to upload to S3: %w", err)
	}

	// Create image record in database
	imageRecord := &models.Image{
		UserID:      userID,
		OriginalURL: s.config.GetPublicURL(s3Key),
		S3Key:       s3Key,
		S3Bucket:    s.config.S3Config.Bucket,
		Filename:    header.Filename,
		ContentType: s.getContentType(header.Filename),
		Size:        header.Size,
		Width:       width,
		Height:      height,
		Type:        imageType,
		Status:      models.ImageStatusActive,
	}

	if err := database.DB.Create(imageRecord).Error; err != nil {
		// If database save fails, try to delete from S3 (cleanup)
		s.deleteFromS3(s3Key)
		return nil, fmt.Errorf("failed to save image metadata: %w", err)
	}

	return &UploadResult{
		ImageID:     imageRecord.ID,
		URL:         result.Location,
		S3Key:       s3Key,
		Filename:    filename,
		ContentType: imageRecord.ContentType,
		Size:        imageRecord.Size,
		Width:       width,
		Height:      height,
	}, nil
}

// DeleteImage deletes an image from S3 and marks it as deleted in database
func (s *S3Service) DeleteImage(imageID uuid.UUID, userID uuid.UUID) error {
	// Get image record
	var imageRecord models.Image
	if err := database.DB.Where("id = ? AND user_id = ?", imageID, userID).First(&imageRecord).Error; err != nil {
		return fmt.Errorf("image not found or access denied: %w", err)
	}

	// Delete from S3
	if err := s.deleteFromS3(imageRecord.S3Key); err != nil {
		return fmt.Errorf("failed to delete from S3: %w", err)
	}

	// Mark as deleted in database
	imageRecord.MarkAsDeleted()
	if err := database.DB.Save(&imageRecord).Error; err != nil {
		return fmt.Errorf("failed to update image status: %w", err)
	}

	return nil
}

// LinkImageToPost creates a relationship between an image and a post
func (s *S3Service) LinkImageToPost(imageID, postID uuid.UUID, usage string, order int) error {
	postImage := &models.PostImage{
		PostID:  postID,
		ImageID: imageID,
		Usage:   usage,
		Order:   order,
	}

	return database.DB.Create(postImage).Error
}

// UnlinkImageFromPost removes the relationship between an image and a post
func (s *S3Service) UnlinkImageFromPost(imageID, postID uuid.UUID) error {
	return database.DB.Where("image_id = ? AND post_id = ?", imageID, postID).Delete(&models.PostImage{}).Error
}

// GetImagesByPost returns all images linked to a post
func (s *S3Service) GetImagesByPost(postID uuid.UUID) ([]models.Image, error) {
	var images []models.Image

	err := database.DB.
		Joins("JOIN post_images ON images.id = post_images.image_id").
		Where("post_images.post_id = ? AND images.status = ?", postID, models.ImageStatusActive).
		Order("post_images.usage, post_images.order").
		Find(&images).Error

	return images, err
}

// CleanupOrphanedImages marks images as orphaned if they're not linked to any post
func (s *S3Service) CleanupOrphanedImages() error {
	// Find images that are not linked to any post and older than 24 hours
	var orphanedImages []models.Image

	err := database.DB.
		Where("id NOT IN (SELECT DISTINCT image_id FROM post_images) AND created_at < ? AND status = ?",
			time.Now().Add(-24*time.Hour), models.ImageStatusActive).
		Find(&orphanedImages).Error

	if err != nil {
		return err
	}

	// Mark as orphaned
	for _, img := range orphanedImages {
		img.MarkAsOrphaned()
		database.DB.Save(&img)
	}

	return nil
}

// Helper methods

func (s *S3Service) generateFilename(userID uuid.UUID, originalFilename string) string {
	ext := filepath.Ext(originalFilename)
	timestamp := time.Now().Unix()
	return fmt.Sprintf("%s_%d%s", userID.String(), timestamp, ext)
}

func (s *S3Service) isValidImageType(filename string) bool {
	ext := strings.ToLower(filepath.Ext(filename))
	validTypes := []string{".jpg", ".jpeg", ".png", ".gif", ".webp"}

	for _, validType := range validTypes {
		if ext == validType {
			return true
		}
	}
	return false
}

func (s *S3Service) getContentType(filename string) string {
	ext := strings.ToLower(filepath.Ext(filename))
	switch ext {
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

func (s *S3Service) getImageDimensions(reader io.Reader) (int, int, error) {
	img, _, err := image.DecodeConfig(reader)
	if err != nil {
		return 0, 0, err
	}
	return img.Width, img.Height, nil
}

func (s *S3Service) DeleteFromS3(s3Key string) error {
	_, err := s.s3Client.DeleteObject(&s3.DeleteObjectInput{
		Bucket: aws.String(s.config.S3Config.Bucket),
		Key:    aws.String(s3Key),
	})
	return err
}

func (s *S3Service) deleteFromS3(s3Key string) error {
	return s.DeleteFromS3(s3Key)
}

// GetSignedURL generates a signed URL for private images
func (s *S3Service) GetSignedURL(s3Key string, expiration time.Duration) (string, error) {
	req, _ := s.s3Client.GetObjectRequest(&s3.GetObjectInput{
		Bucket: aws.String(s.config.S3Config.Bucket),
		Key:    aws.String(s3Key),
	})

	return req.Presign(expiration)
}
