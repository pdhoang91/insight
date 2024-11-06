package router

import (
	"github.com/pdhoang91/image-service/controllers"

	"github.com/gin-gonic/gin"
)

func SetupRouter() *gin.Engine {
	r := gin.Default()

	// Serve the uploads directory
	r.Static("/uploads", "./uploads")

	// Routes for image upload
	//r.POST("/upload", controllers.UploadImage)
	r.POST("/upload/v2", controllers.UploadImageV2)

	// Optional: Route for getting images if cần
	// r.GET("/images/:imageName", controllers.GetImage)

	return r
}
