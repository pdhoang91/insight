package router

import (
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/prometheus/client_golang/prometheus/promhttp"

	"github.com/pdhoang91/image-service/controllers"
	"github.com/pdhoang91/image-service/middleware"
	"github.com/pdhoang91/image-service/services"
)

func SetupRouter(s3Service *services.S3Service) *gin.Engine {
	r := gin.Default()
	// Đăng ký endpoint /metrics
	r.GET("/images/metrics", gin.WrapH(promhttp.Handler()))

	configCors := cors.Config{
		AllowOrigins:     []string{"http://202.92.6.77:3000", "http://localhost:3000", "https://insight.io.vn"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}

	// Serve the uploads directory
	r.Static("/images/uploads", "./images/uploads/.")

	r.Use(cors.New(configCors))
	// r.Use(middleware.LoggerMiddleware())
	r.Use(middleware.AuthMiddleware())

	// Routes for image upload
	// Sử dụng closure để truyền s3Service vào handler
	r.POST("/images/upload/v2/:type", func(c *gin.Context) {
		controllers.UploadImageV2(c, s3Service)
	})

	// Optional: Route for getting images if cần
	// r.GET("/images/:imageName", controllers.GetImage)

	return r
}
