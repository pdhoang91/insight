// config/storage.go
package config

import (
	"fmt"
	"os"
)

// StorageConfig holds S3 configuration
type StorageConfig struct {
	S3Config  S3Config
	CDNConfig CDNConfig
}

// S3Config holds S3-specific configuration
type S3Config struct {
	Region          string
	Bucket          string
	AccessKeyID     string
	SecretAccessKey string
	Endpoint        string // For custom S3-compatible services (LocalStack)
	UseSSL          bool
	BasePath        string // Base path within bucket
}

// CDNConfig holds CDN configuration
type CDNConfig struct {
	Enabled    bool
	BaseURL    string
	SignedURLs bool
}

// GetStorageConfig returns storage configuration
func GetStorageConfig() *StorageConfig {
	config := &StorageConfig{
		S3Config: S3Config{
			Region:          "us-east-1",       // Hardcoded
			Bucket:          "insight.storage", // Hardcoded
			AccessKeyID:     getEnvWithDefault("AWS_ACCESS_KEY_ID", ""),
			SecretAccessKey: getEnvWithDefault("AWS_SECRET_ACCESS_KEY", ""),
			Endpoint:        getEnvWithDefault("AWS_S3_ENDPOINT", ""), // For LocalStack
			UseSSL:          getEnvWithDefault("AWS_S3_USE_SSL", "true") == "true",
			BasePath:        getEnvWithDefault("AWS_S3_BASE_PATH", "uploads"),
		},
		CDNConfig: CDNConfig{
			Enabled:    getEnvWithDefault("CDN_ENABLED", "false") == "true",
			BaseURL:    getEnvWithDefault("CDN_BASE_URL", ""),
			SignedURLs: getEnvWithDefault("CDN_SIGNED_URLS", "false") == "true",
		},
	}

	return config
}

// getEnvWithDefault gets environment variable with default value
func getEnvWithDefault(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

// GetS3Key generates S3 key based on file info
func (c *StorageConfig) GetS3Key(userID, fileType, filename string) string {
	return fmt.Sprintf("%s/%s/%s/%s",
		c.S3Config.BasePath,
		fileType,
		userID,
		filename,
	)
}

// GetPublicURL returns the public URL for an S3 object
func (c *StorageConfig) GetPublicURL(s3Key string) string {
	if c.CDNConfig.Enabled && c.CDNConfig.BaseURL != "" {
		return fmt.Sprintf("%s/%s", c.CDNConfig.BaseURL, s3Key)
	}

	// Return S3 URL
	if c.S3Config.Endpoint != "" {
		// Custom endpoint (LocalStack, etc.)
		protocol := "http"
		if c.S3Config.UseSSL {
			protocol = "https"
		}
		return fmt.Sprintf("%s://%s/%s/%s", protocol, c.S3Config.Endpoint, c.S3Config.Bucket, s3Key)
	}

	// AWS S3 URL
	return fmt.Sprintf("https://%s.s3.%s.amazonaws.com/%s", c.S3Config.Bucket, c.S3Config.Region, s3Key)
}

// Validate validates the storage configuration
func (c *StorageConfig) Validate() error {
	if c.S3Config.Bucket == "" {
		return fmt.Errorf("S3 bucket is required")
	}
	if c.S3Config.Region == "" {
		return fmt.Errorf("S3 region is required")
	}
	if c.S3Config.AccessKeyID == "" {
		return fmt.Errorf("AWS access key ID is required")
	}
	if c.S3Config.SecretAccessKey == "" {
		return fmt.Errorf("AWS secret access key is required")
	}
	return nil
}
