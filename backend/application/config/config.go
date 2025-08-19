// config.go
package config

import (
	"fmt"
	"log"
	"os"

	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
)

var GoogleOauthConfig *oauth2.Config

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
	_ = os.Getenv("AWS_SESSION_TOKEN") // session token not used in current implementation

	if region == "" || accessKey == "" || secretKey == "" {
		log.Printf("Warning: Missing AWS credentials, some features may not work")
		return // Don't fatal, just return
	}

	// AWS configuration is now handled by individual services
	log.Println("AWS credentials configured successfully")
}

// Get -
func Get() *oauth2.Config {
	if GoogleOauthConfig == nil {
		panic("Config was not initialized")
	}
	return GoogleOauthConfig
}
