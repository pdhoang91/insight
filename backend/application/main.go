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
	"github.com/pdhoang91/blog/internal/entities"
	"github.com/pdhoang91/blog/internal/service"
	"gorm.io/gorm"
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

	// Ensure UUID extension is enabled
	if err := ensureUUIDExtension(db); err != nil {
		log.Printf("Warning: Failed to enable UUID extension: %v", err)
	}

	// Run database migrate
	if err := runAutoMigration(db); err != nil {
		panic("Failed to run database migrate: " + err.Error())
	}

	// Create a new Gin router
	r := gin.New()

	// Add middleware
	r.Use(gin.Logger())
	r.Use(gin.Recovery())

	// Enable CORS with custom settings
	ConfigureCORS(r)

	// Create base service with common dependencies
	baseService := service.NewBaseService(
		db,
		config.GoogleOauthConfig,
		config.S3Client,
	)

	// Initialize storage manager
	service.InitStorageManager(db)

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

// ensureUUIDExtension ensures the uuid-ossp extension is enabled
func ensureUUIDExtension(db *gorm.DB) error {
	return db.Exec(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`).Error
}

// runAutoMigration runs database auto-migration for all entities
func runAutoMigration(db *gorm.DB) error {
	return db.AutoMigrate(
		&entities.User{},
		&entities.Post{},
		&entities.PostContent{},
		&entities.Category{},
		&entities.Comment{},
		&entities.Reply{},
		&entities.Tag{},
		&entities.PostCategory{},
		&entities.PostTag{},
		&entities.Bookmark{},
		&entities.Follow{},
		&entities.Rating{},
		&entities.Notification{},
		&entities.UserActivity{},
		&entities.Tab{},
		&entities.Image{},
		&entities.ImageReference{},
	)
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
