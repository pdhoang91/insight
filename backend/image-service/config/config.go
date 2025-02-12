package config

import (
	"log"
	"os"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

var S3Client *s3.Client

func InitS3Client() {
	region := os.Getenv("AWS_REGION")
	accessKey := os.Getenv("AWS_ACCESS_KEY_ID")
	secretKey := os.Getenv("AWS_SECRET_ACCESS_KEY")
	sessionToken := os.Getenv("AWS_SESSION_TOKEN") // có thể để trống nếu không dùng

	if region == "" || accessKey == "" || secretKey == "" {
		log.Fatal("Thiếu biến môi trường: AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY")
	}

	// Tạo credentials provider từ package credentials
	creds := aws.NewCredentialsCache(credentials.NewStaticCredentialsProvider(accessKey, secretKey, sessionToken))

	cfg := aws.Config{
		Region:      region,
		Credentials: creds,
	}

	S3Client = s3.NewFromConfig(cfg)
}
