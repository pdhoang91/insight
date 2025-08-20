package main

import (
	"fmt"
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/pdhoang91/blog/config"
	"github.com/pdhoang91/blog/internal"
	"github.com/pdhoang91/blog/internal/controller"
	"github.com/pdhoang91/blog/internal/database"
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

	// Run database migrate
	if err := runAutoMigration(db); err != nil {
		panic("Failed to run database migrate: " + err.Error())
	}

	// Create optimized indexes
	log.Println("Creating optimized database indexes...")
	if err := database.CreateOptimizedIndexes(db); err != nil {
		log.Printf("Warning: Failed to create some indexes: %v", err)
	}
	if err := database.CreateCompositeIndexes(db); err != nil {
		log.Printf("Warning: Failed to create some composite indexes: %v", err)
	}
	log.Println("Database indexes created successfully")

	// Create a new Gin router
	r := gin.New()

	// Add middleware
	r.Use(gin.Logger())
	r.Use(gin.Recovery())

	// Enable CORS with custom settings
	internal.ConfigureCORS(r)

	// Create base service with common dependencies
	baseService := service.NewBaseService(
		db,
		config.GoogleOauthConfig,
		config.S3Client,
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
		&entities.PostView{},
		&entities.Clap{},
		&entities.Notification{},
		&entities.UserActivity{},
		&entities.Tab{},
	)
}
