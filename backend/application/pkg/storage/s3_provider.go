// storage/s3_provider.go
package storage

import (
	"context"
	"fmt"
	"mime/multipart"
	"path/filepath"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/pdhoang91/blog/config"
)

// S3Provider implements StorageProvider for AWS S3
type S3Provider struct {
	client    *s3.Client
	bucket    string
	region    string
	basePath  string
	cdnDomain string // Optional CDN domain
}

// NewS3Provider creates a new S3 storage provider
func NewS3Provider(bucket, region, basePath, cdnDomain string) *S3Provider {
	return &S3Provider{
		client:    config.S3Client,
		bucket:    bucket,
		region:    region,
		basePath:  basePath,
		cdnDomain: cdnDomain,
	}
}

// Upload uploads a file to S3
func (s *S3Provider) Upload(ctx context.Context, file *multipart.FileHeader, path string) (*StorageResult, error) {
	// Open the uploaded file
	src, err := file.Open()
	if err != nil {
		return nil, fmt.Errorf("failed to open file: %w", err)
	}
	defer src.Close()

	// Construct the full S3 key
	s3Key := filepath.Join(s.basePath, path)

	// Upload to S3
	_, err = s.client.PutObject(ctx, &s3.PutObjectInput{
		Bucket:      aws.String(s.bucket),
		Key:         aws.String(s3Key),
		Body:        src,
		ContentType: aws.String(file.Header.Get("Content-Type")),
	})

	if err != nil {
		return nil, fmt.Errorf("failed to upload to S3: %w", err)
	}

	// Generate public URL
	publicURL := s.generatePublicURL(s3Key)

	return &StorageResult{
		Key:         s3Key,
		PublicURL:   publicURL,
		StorageType: "s3",
		ContentType: file.Header.Get("Content-Type"),
		Size:        file.Size,
		UploadedAt:  time.Now(),
	}, nil
}

// GetURL returns the public URL for the file
func (s *S3Provider) GetURL(ctx context.Context, key string) (string, error) {
	return s.generatePublicURL(key), nil
}

// Delete removes a file from S3
func (s *S3Provider) Delete(ctx context.Context, key string) error {
	_, err := s.client.DeleteObject(ctx, &s3.DeleteObjectInput{
		Bucket: aws.String(s.bucket),
		Key:    aws.String(key),
	})

	if err != nil {
		return fmt.Errorf("failed to delete from S3: %w", err)
	}

	return nil
}

// GetMetadata retrieves file metadata from S3
func (s *S3Provider) GetMetadata(ctx context.Context, key string) (*FileMetadata, error) {
	result, err := s.client.HeadObject(ctx, &s3.HeadObjectInput{
		Bucket: aws.String(s.bucket),
		Key:    aws.String(key),
	})

	if err != nil {
		return nil, fmt.Errorf("failed to get metadata from S3: %w", err)
	}

	metadata := &FileMetadata{
		Key: key,
	}

	if result.ContentLength != nil {
		metadata.Size = *result.ContentLength
	}

	if result.ContentType != nil {
		metadata.ContentType = *result.ContentType
	}

	if result.LastModified != nil {
		metadata.LastModified = *result.LastModified
	}

	if result.ETag != nil {
		metadata.ETag = *result.ETag
	}

	return metadata, nil
}

// GetProviderName returns the provider name
func (s *S3Provider) GetProviderName() string {
	return "s3"
}

// generatePublicURL creates the public URL for the file
func (s *S3Provider) generatePublicURL(key string) string {
	if s.cdnDomain != "" {
		return fmt.Sprintf("https://%s/%s", s.cdnDomain, key)
	}
	return fmt.Sprintf("https://%s.s3.amazonaws.com/%s", s.bucket, key)
}
