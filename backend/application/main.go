package main

import (
	"log"
	"os"

	"github.com/pdhoang91/blog/config"
	"github.com/pdhoang91/blog/controller"
	"github.com/pdhoang91/blog/database"
	"github.com/pdhoang91/blog/router"
)

func main() {
	// Initialize config first
	if err := config.Init(); err != nil {
		log.Fatal("Failed to initialize config:", err)
	}

	// Initialize database with migration
	database.DB = database.InitializeDatabase()

	// Initialize controllers
	controllers, err := controller.InitControllers()
	if err != nil {
		log.Fatal("Failed to initialize controllers: ", err)
	}

	log.Printf("Controllers initialized: Image, Post, Search, Comment, User, Auth, Category, Tag")

	// Setup router with injected controllers
	r := router.SetupRouter(controllers)

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
