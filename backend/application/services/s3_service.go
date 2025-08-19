// services/s3_service.go
package services

import (
	"context"
	"fmt"
	"io"
	"mime/multipart"
	"path/filepath"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/pdhoang91/blog/config"
)

const (
	BucketName = "insight.storage" // Thay đổi tên bucket của bạn
	CDNDomain  = ""                // Nếu bạn sử dụng CloudFront CDN
)

type S3Service struct {
	client *s3.Client
}

// ObjectInfo holds metadata about an S3 object
type ObjectInfo struct {
	Key          string
	Size         int64
	LastModified time.Time
	ContentType  string
}

func NewS3Service() *S3Service {
	return &S3Service{
		client: config.S3Client, // This might be nil if AWS config failed
	}
}

func (s *S3Service) UploadFile(ctx context.Context, file *multipart.FileHeader, userID, imageType, prefix string) (string, error) {
	// Mở file
	src, err := file.Open()
	if err != nil {
		return "", err
	}
	defer src.Close()

	// Tạo key cho S3 object
	currentDate := time.Now().Format("2006-01-02")
	safeFilename := filepath.Base(file.Filename)

	// Tạo key theo format: uploads/userID/date/type/prefix_filename
	s3Key := fmt.Sprintf("uploads/%s/%s/%s/%s_%s", userID, currentDate, imageType, prefix, safeFilename)

	// Upload file lên S3
	_, err = s.client.PutObject(ctx, &s3.PutObjectInput{
		Bucket: aws.String(BucketName),
		Key:    aws.String(s3Key),
		Body:   src,
	})

	if err != nil {
		return "", err
	}

	// Trả về URL của file
	if CDNDomain != "" {
		return fmt.Sprintf("https://%s/%s", CDNDomain, s3Key), nil
	}
	return fmt.Sprintf("https://%s.s3.amazonaws.com/%s", BucketName, s3Key), nil
}

// GetObject retrieves an object from S3
func (s *S3Service) GetObject(ctx context.Context, key string) (io.ReadCloser, string, error) {
	if s.client == nil {
		return nil, "", fmt.Errorf("S3 client not initialized")
	}

	result, err := s.client.GetObject(ctx, &s3.GetObjectInput{
		Bucket: aws.String(BucketName),
		Key:    aws.String(key),
	})
	if err != nil {
		return nil, "", err
	}

	contentType := "application/octet-stream"
	if result.ContentType != nil {
		contentType = *result.ContentType
	}

	return result.Body, contentType, nil
}

// GetObjectInfo retrieves metadata about an S3 object
func (s *S3Service) GetObjectInfo(ctx context.Context, key string) (*ObjectInfo, error) {
	result, err := s.client.HeadObject(ctx, &s3.HeadObjectInput{
		Bucket: aws.String(BucketName),
		Key:    aws.String(key),
	})
	if err != nil {
		return nil, err
	}

	info := &ObjectInfo{
		Key:  key,
		Size: *result.ContentLength,
	}

	if result.LastModified != nil {
		info.LastModified = *result.LastModified
	}

	if result.ContentType != nil {
		info.ContentType = *result.ContentType
	}

	return info, nil
}
