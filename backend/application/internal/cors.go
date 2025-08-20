package internal

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

// ConfigureCORS sets up CORS middleware for the application
func ConfigureCORS(r *gin.Engine) {
	config := cors.DefaultConfig()
	config.AllowAllOrigins = true
	config.AllowMethods = []string{"GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"}
	config.AllowHeaders = []string{"Origin", "Content-Length", "Content-Type", "Authorization", "X-Requested-With"}
	config.AllowCredentials = true

	r.Use(cors.New(config))
}
