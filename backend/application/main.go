package main

import (
	"fmt"
	"log"
	"os"

	"github.com/gin-contrib/cors"

	"github.com/gin-gonic/gin"
	"github.com/pdhoang91/blog/config"
	"github.com/pdhoang91/blog/internal"
	"github.com/pdhoang91/blog/internal/controller"
	"github.com/pdhoang91/blog/internal/service"
	"github.com/pdhoang91/blog/pkg/storage"
)

func main() {
	// Initialize config first
	cfg := config.NewConfig()

	// Initialize database connection
	db, err := config.InitDBConnection(cfg)
	if err != nil {
		fmt.Println("Failed to connect to the database:", err)
		return
	}
	defer config.CloseDBConnection(db)

	// Create a new Gin router
	r := gin.New()

	// Add middleware
	r.Use(gin.Logger())
	r.Use(gin.Recovery())

	// Enable CORS with custom settings
	ConfigureCORS(r)

	// Initialize storage manager
	storageManager := storage.NewManager("s3", db)

	// Get S3 configuration from config
	bucket, region, cdnDomain := config.GetS3Config()
	basePath := "uploads"

	// Create and register S3 provider using existing S3 client
	s3Provider := storage.NewS3Provider(bucket, region, basePath, cdnDomain)
	storageManager.RegisterProvider("s3", s3Provider)

	// Create base service with common dependencies
	baseService := service.NewBaseService(
		db,
		config.GoogleOauthConfig,
		config.S3Client,
		storageManager,
	)

	// Create insight service with all dependencies
	insightService := service.NewInsightService(
		baseService,
	)

	// Create controller (routing layer only)
	mainController := controller.NewController(insightService)

	// Define API routes
	internal.DefineAPIRoutes(r, mainController)

	// Get port from environment or use default
	port := os.Getenv("PORT")
	if port == "" {
		port = "81"
	}

	log.Printf("Server starting on port %s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}

// ConfigureCORS sets up CORS middleware for the application
func ConfigureCORS(r *gin.Engine) {
	config := cors.DefaultConfig()
	config.AllowAllOrigins = true
	config.AllowMethods = []string{"GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"}
	config.AllowHeaders = []string{"Origin", "Content-Length", "Content-Type", "Authorization", "X-Requested-With"}
	config.AllowCredentials = true

	r.Use(cors.New(config))
}
