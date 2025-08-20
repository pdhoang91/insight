// storage/s3_manager.go
package storage

import (
	"context"
	"fmt"
	"io"
	"os"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/aws/aws-sdk-go-v2/service/s3/types"
	"github.com/pdhoang91/blog/config"
)

// S3Manager manages all S3 operations centrally
type S3Manager struct {
	client    *s3.Client
	bucket    string
	region    string
	cdnDomain string
}

// NewS3Manager creates a new S3 manager with all necessary components
func NewS3Manager(bucket, region, cdnDomain string) (*S3Manager, error) {
	// Use existing S3 client from config
	client := config.S3Client
	if client == nil {
		return nil, fmt.Errorf("S3 client not initialized in config")
	}

	return &S3Manager{
		client:    client,
		bucket:    bucket,
		region:    region,
		cdnDomain: cdnDomain,
	}, nil
}

// Upload uploads a file to S3
func (s *S3Manager) Upload(ctx context.Context, reader io.Reader, key string, contentType string) error {
	_, err := s.client.PutObject(ctx, &s3.PutObjectInput{
		Bucket:      aws.String(s.bucket),
		Key:         aws.String(key),
		Body:        reader,
		ContentType: aws.String(contentType),
	})
	return err
}

// GetObject retrieves an object from S3
func (s *S3Manager) GetObject(ctx context.Context, key string) (io.ReadCloser, string, error) {
	result, err := s.client.GetObject(ctx, &s3.GetObjectInput{
		Bucket: aws.String(s.bucket),
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

// DeleteObject deletes an object from S3
func (s *S3Manager) DeleteObject(ctx context.Context, key string) error {
	_, err := s.client.DeleteObject(ctx, &s3.DeleteObjectInput{
		Bucket: aws.String(s.bucket),
		Key:    aws.String(key),
	})
	return err
}

// DeleteObjects deletes multiple objects from S3
func (s *S3Manager) DeleteObjects(ctx context.Context, keys []string) error {
	if len(keys) == 0 {
		return nil
	}

	// Prepare objects for deletion
	objects := make([]types.ObjectIdentifier, len(keys))
	for i, key := range keys {
		objects[i] = types.ObjectIdentifier{
			Key: aws.String(key),
		}
	}

	_, err := s.client.DeleteObjects(ctx, &s3.DeleteObjectsInput{
		Bucket: aws.String(s.bucket),
		Delete: &types.Delete{
			Objects: objects,
		},
	})
	return err
}

// HeadObject retrieves metadata about an S3 object
func (s *S3Manager) HeadObject(ctx context.Context, key string) (*s3.HeadObjectOutput, error) {
	return s.client.HeadObject(ctx, &s3.HeadObjectInput{
		Bucket: aws.String(s.bucket),
		Key:    aws.String(key),
	})
}

// GetURL returns the URL for an object
func (s *S3Manager) GetURL(key string) string {
	if s.cdnDomain != "" {
		return fmt.Sprintf("https://%s/%s", s.cdnDomain, key)
	}
	return fmt.Sprintf("https://%s.s3.%s.amazonaws.com/%s", s.bucket, s.region, key)
}

// GetPresignedURL generates a presigned URL for temporary access
func (s *S3Manager) GetPresignedURL(ctx context.Context, key string, expiration time.Duration) (string, error) {
	presignClient := s3.NewPresignClient(s.client)

	request, err := presignClient.PresignGetObject(ctx, &s3.GetObjectInput{
		Bucket: aws.String(s.bucket),
		Key:    aws.String(key),
	}, func(opts *s3.PresignOptions) {
		opts.Expires = expiration
	})

	if err != nil {
		return "", err
	}

	return request.URL, nil
}

// GetBucket returns the bucket name
func (s *S3Manager) GetBucket() string {
	return s.bucket
}

// GetRegion returns the region
func (s *S3Manager) GetRegion() string {
	return s.region
}

// GetClient returns the S3 client for advanced operations
func (s *S3Manager) GetClient() *s3.Client {
	return s.client
}

// InitFromEnv creates S3Manager from environment variables
func InitFromEnv() (*S3Manager, error) {
	bucket := os.Getenv("AWS_S3_BUCKET")
	if bucket == "" {
		bucket = "insight.storage" // default bucket
	}

	region := os.Getenv("AWS_REGION")
	if region == "" {
		region = "us-east-1" // default region
	}

	cdnDomain := os.Getenv("AWS_CDN_DOMAIN")

	return NewS3Manager(bucket, region, cdnDomain)
}
