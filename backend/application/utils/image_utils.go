package utils

import (
	"os"
	"strings"
)

// ConvertS3URLToProxy converts direct S3 URLs to proxy URLs in content
func ConvertS3URLToProxy(content string) string {
	// Use application service URL (migrated from image-service)
	applicationServiceURL := os.Getenv("BASE_API_URL")
	if applicationServiceURL == "" {
		applicationServiceURL = "http://localhost:81" // fallback to application service
	}

	// Pattern: https://insight.storage.s3.amazonaws.com/uploads/{userID}/{date}/{type}/{filename}
	// Convert to: {applicationServiceURL}/images/proxy/{userID}/{date}/{type}/{filename}

	s3Pattern := "https://insight.storage.s3.amazonaws.com/uploads/"
	proxyPattern := applicationServiceURL + "/images/proxy/"

	return strings.ReplaceAll(content, s3Pattern, proxyPattern)
}

// ConvertProxyToS3URL converts proxy URLs back to S3 URLs (for internal use)
func ConvertProxyToS3URL(content string) string {
	// Use application service URL (migrated from image-service)
	applicationServiceURL := os.Getenv("BASE_API_URL")
	if applicationServiceURL == "" {
		applicationServiceURL = "http://localhost:81" // fallback to application service
	}

	proxyPattern := applicationServiceURL + "/images/proxy/"
	s3Pattern := "https://insight.storage.s3.amazonaws.com/uploads/"

	return strings.ReplaceAll(content, proxyPattern, s3Pattern)
}

// GetImageServiceURL returns the base URL for the application service (migrated from image-service)
func GetImageServiceURL() string {
	applicationServiceURL := os.Getenv("BASE_API_URL")
	if applicationServiceURL == "" {
		applicationServiceURL = "http://localhost:81" // fallback to application service
	}
	return applicationServiceURL
}
