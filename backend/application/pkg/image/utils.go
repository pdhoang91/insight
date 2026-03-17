package image

import (
	"fmt"
	"os"
	"strings"
)

func s3BaseURL() (oldVirtualHosted, newPathStyle string) {
	bucket := os.Getenv("AWS_S3_BUCKET")
	if bucket == "" {
		bucket = "insight.storage"
	}
	region := os.Getenv("AWS_REGION")
	if region == "" {
		region = "us-east-1"
	}
	// Old virtual-hosted style (broken SSL for dot-buckets, kept for backward compat)
	oldVirtualHosted = fmt.Sprintf("https://%s.s3.amazonaws.com/uploads/", bucket)
	// New path-style (SSL-safe for all bucket names)
	newPathStyle = fmt.Sprintf("https://s3.%s.amazonaws.com/%s/uploads/", region, bucket)
	return
}

// ConvertS3URLToProxy converts direct S3 URLs to proxy URLs in content.
// Handles both the legacy virtual-hosted format and the current path-style format.
func ConvertS3URLToProxy(content string) string {
	applicationServiceURL := os.Getenv("BASE_API_URL")
	if applicationServiceURL == "" {
		applicationServiceURL = "http://localhost:81"
	}

	proxyPattern := applicationServiceURL + "/images/proxy/"
	oldPattern, newPattern := s3BaseURL()

	result := strings.ReplaceAll(content, oldPattern, proxyPattern)
	result = strings.ReplaceAll(result, newPattern, proxyPattern)
	return result
}

// ConvertProxyToS3URL converts proxy URLs back to S3 URLs using the current path-style format.
func ConvertProxyToS3URL(content string) string {
	applicationServiceURL := os.Getenv("BASE_API_URL")
	if applicationServiceURL == "" {
		applicationServiceURL = "http://localhost:81"
	}

	proxyPattern := applicationServiceURL + "/images/proxy/"
	_, newPattern := s3BaseURL()

	return strings.ReplaceAll(content, proxyPattern, newPattern)
}

// GetImageServiceURL returns the base URL for the application service.
func GetImageServiceURL() string {
	applicationServiceURL := os.Getenv("BASE_API_URL")
	if applicationServiceURL == "" {
		applicationServiceURL = "http://localhost:81"
	}
	return applicationServiceURL
}
