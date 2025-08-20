package main

import (
	"log"
	"os"

	"github.com/pdhoang91/blog/config"
	"github.com/pdhoang91/blog/controller"
	"github.com/pdhoang91/blog/database"
	"github.com/pdhoang91/blog/router"
	"github.com/pdhoang91/blog/storage"
	"gorm.io/gorm"
)

func main() {
	// Initialize config first
	if err := config.Init(); err != nil {
		log.Fatal("Failed to initialize config:", err)
	}

	// Initialize database
	db := database.ConnectDatabase()
	database.DB = db // Set global DB for backward compatibility

	// Initialize global services for backward compatibility
	controller.InitGlobalServices()

	// Initialize storage components
	storageManager, s3Manager, err := initializeStorage(db)
	if err != nil {
		log.Fatal("Failed to initialize storage:", err)
	}

	// Create unified controller with all dependencies
	ctrl := controller.NewController(db, storageManager, s3Manager)

	// Setup router with clean architecture
	r := router.SetupRouter(ctrl)

	// Start server
	port := getPort()
	log.Printf("Server starting on port %s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}

// initializeStorage sets up storage manager and S3 manager
func initializeStorage(db *gorm.DB) (*storage.Manager, *storage.S3Manager, error) {
	bucket := getEnvOrDefault("AWS_S3_BUCKET", "insight.storage")
	region := getEnvOrDefault("AWS_REGION", "us-east-1")

	// Initialize S3 Manager
	s3Manager, err := storage.InitFromEnv()
	if err != nil {
		return nil, nil, err
	}

	// Initialize storage manager
	storageManager := storage.NewManager("s3", db)
	s3Provider := storage.NewS3Provider(bucket, region, "uploads", "")
	storageManager.RegisterProvider("s3", s3Provider)

	return storageManager, s3Manager, nil
}

// getPort returns the port from environment or default
func getPort() string {
	if port := os.Getenv("PORT"); port != "" {
		return port
	}
	return "81"
}

// getEnvOrDefault returns environment variable or default value
func getEnvOrDefault(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
