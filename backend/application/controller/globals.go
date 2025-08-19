// controller/globals.go
package controller

import (
	"os"

	"github.com/pdhoang91/blog/database"
	"github.com/pdhoang91/blog/services"
	"github.com/pdhoang91/blog/storage"
)

// Global instances - initialized once at startup
var (
	globalStorageManager *storage.Manager
	globalImageProxy     *ImageProxyController
)

// InitGlobalServices initializes all global services once at startup
func InitGlobalServices() {
	// Initialize storage manager for S3 only
	bucket := os.Getenv("AWS_S3_BUCKET")
	if bucket == "" {
		bucket = "insight.storage" // default bucket
	}

	region := os.Getenv("AWS_REGION")
	if region == "" {
		region = "us-east-1" // default region
	}

	globalStorageManager = storage.NewManager("s3", database.DB)

	// Register S3 provider with environment-based config
	s3Provider := storage.NewS3Provider(
		bucket,    // bucket from env
		region,    // region from env
		"uploads", // basePath
		"",        // cdnDomain (empty for now)
	)
	globalStorageManager.RegisterProvider("s3", s3Provider)

	// Initialize image proxy controller
	globalImageProxy = &ImageProxyController{
		s3Service: services.NewS3Service(),
	}
}

// GetStorageManager returns the global storage manager instance
func GetStorageManager() *storage.Manager {
	return globalStorageManager
}

// GetImageProxyController returns the global image proxy controller
func GetImageProxyController() *ImageProxyController {
	return globalImageProxy
}
