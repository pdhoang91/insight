// config.go
package config

import (
	"fmt"
	"log"
	"os"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
)

var GoogleOauthConfig *oauth2.Config
var S3Client *s3.Client

func Init() error {
	// Initialize Google OAuth config
	GoogleOauthConfig = &oauth2.Config{
		RedirectURL:  os.Getenv("GOOGLE_REDIRECT_URL"),  // Change to your redirect URL
		ClientID:     os.Getenv("GOOGLE_CLIENT_ID"),     // Set your Google Client ID
		ClientSecret: os.Getenv("GOOGLE_CLIENT_SECRET"), // Set your Google Client Secret
		Scopes:       []string{"email", "profile"},
		Endpoint:     google.Endpoint,
	}

	// Initialize S3 client
	InitS3Client()

	fmt.Printf("Configuration: %+v\n", GoogleOauthConfig)
	return nil
}

func InitS3Client() {
	region := os.Getenv("AWS_REGION")
	accessKey := os.Getenv("AWS_ACCESS_KEY_ID")
	secretKey := os.Getenv("AWS_SECRET_ACCESS_KEY")
	sessionToken := os.Getenv("AWS_SESSION_TOKEN") // có thể để trống nếu không dùng

	if region == "" || accessKey == "" || secretKey == "" {
		log.Fatal("Thiếu biến môi trường: AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY")
	}

	// Skip session token if it's a placeholder value
	if sessionToken == "your-aws-session-token" || sessionToken == "" {
		sessionToken = ""
	}

	// Tạo credentials provider từ package credentials
	creds := aws.NewCredentialsCache(credentials.NewStaticCredentialsProvider(accessKey, secretKey, sessionToken))

	cfg := aws.Config{
		Region:      region,
		Credentials: creds,
	}

	S3Client = s3.NewFromConfig(cfg)
}

// Get -
func Get() *oauth2.Config {
	if GoogleOauthConfig == nil {
		panic("Config was not initialized")
	}
	return GoogleOauthConfig
}
