package router

import (
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"

	"github.com/pdhoang91/image-service/controllers"
)

func SetupRouter() *gin.Engine {
	r := gin.Default()

	config := cors.Config{
		//AllowOrigins:     []string{allowOrigins, "http://localhost:3000", "http://202.92.6.77:3000"}, // Thay đổi tùy vào frontend
		AllowOrigins:     []string{"http://202.92.6.77:3000", "http://localhost:3000", "https://insight.io.vn"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}

	r.Use(cors.New(config))

	// Serve the uploads directory
	r.Static("/images/uploads", "./images/uploads")

	// Routes for image upload
	//r.POST("/upload", controllers.UploadImage)
	r.POST("/images/upload/v2", controllers.UploadImageV2)

	// Optional: Route for getting images if cần
	// r.GET("/images/:imageName", controllers.GetImage)

	return r
}
