// router/router.go
package router

import (
	"fmt"
	"os"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"

	"github.com/pdhoang91/search-service/controller"
)

func SetupRouter() *gin.Engine {
	r := gin.Default()

	allowOrigins := os.Getenv("BASE_FE_URL")
	fmt.Println("allowOrigins", allowOrigins)
	config := cors.Config{
		AllowOrigins:     []string{"http://202.92.6.77:3000", "http://localhost:3000", "https://insight.io.vn"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}

	r.Use(cors.New(config))
	// Đăng ký LoggerMiddleware
	// r.Use(middleware.LoggerMiddleware())

	// Các route hiện tại
	r.GET("/search/posts", controller.SearchPostsHandler)

	// Thêm các route mới cho IndexPost và DeletePostFromIndex
	r.POST("/search/posts/index", controller.IndexPostHandler)
	r.DELETE("/search/posts/:id", controller.DeletePostHandler)

	return r
}
