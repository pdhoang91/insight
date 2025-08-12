package utils

import (
	"os"
	"strings"
)

// ConvertS3URLToProxy converts direct S3 URLs to proxy URLs in content
func ConvertS3URLToProxy(content string) string {
	imageServiceURL := os.Getenv("BASE_IMAGE_SERVICE_URL")
	if imageServiceURL == "" {
		imageServiceURL = "http://localhost:82" // fallback
	}

	// Pattern: https://insight.storage.s3.amazonaws.com/uploads/{userID}/{date}/{type}/{filename}
	// Convert to: {imageServiceURL}/images/proxy/{userID}/{date}/{type}/{filename}

	s3Pattern := "https://insight.storage.s3.amazonaws.com/uploads/"
	proxyPattern := imageServiceURL + "/images/proxy/"

	return strings.ReplaceAll(content, s3Pattern, proxyPattern)
}

// ConvertProxyToS3URL converts proxy URLs back to S3 URLs (for internal use)
func ConvertProxyToS3URL(content string) string {
	imageServiceURL := os.Getenv("BASE_IMAGE_SERVICE_URL")
	if imageServiceURL == "" {
		imageServiceURL = "http://localhost:82" // fallback
	}

	proxyPattern := imageServiceURL + "/images/proxy/"
	s3Pattern := "https://insight.storage.s3.amazonaws.com/uploads/"

	return strings.ReplaceAll(content, proxyPattern, s3Pattern)
}

// GetImageServiceURL returns the base URL for the image service
func GetImageServiceURL() string {
	imageServiceURL := os.Getenv("BASE_IMAGE_SERVICE_URL")
	if imageServiceURL == "" {
		imageServiceURL = "http://localhost:82" // fallback
	}
	return imageServiceURL
}
