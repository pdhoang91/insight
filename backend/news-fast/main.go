// main.go
package main

import (
	"log"
	"news-api/config"
	"news-api/models"
	"news-api/routes"

	"github.com/gin-gonic/gin"
)

func main() {
	// Connect to database
	db := config.ConnectDB()

	// Auto migrate models
	db.AutoMigrate(&models.New{}, &models.NewCategory{}, &models.NewSource{})

	// Initialize Gin router
	r := gin.Default()

	// CORS middleware
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	// Setup routes
	routes.SetupRoutes(r, db)

	// Start server
	if err := r.Run(":85"); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
