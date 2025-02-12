// services/s3_service.go
package services

import (
	"context"
	"fmt"
	"mime/multipart"
	"path/filepath"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/pdhoang91/image-service/config"
)

const (
	BucketName = "insight.storage" // Thay đổi tên bucket của bạn
	CDNDomain  = ""                // Nếu bạn sử dụng CloudFront CDN
)

type S3Service struct {
	client *s3.Client
}

func NewS3Service() *S3Service {
	return &S3Service{
		client: config.S3Client,
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
	s3Key := fmt.Sprintf("uploads/%s/%s/%s/%s_%s", userID, currentDate, imageType, prefix, safeFilename)

	// Upload file lên S3
	_, err = s.client.PutObject(ctx, &s3.PutObjectInput{
		Bucket:      aws.String(BucketName),
		Key:         aws.String(s3Key),
		Body:        src,
		ContentType: aws.String(file.Header.Get("Content-Type")),
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
