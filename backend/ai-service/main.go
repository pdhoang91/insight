package main

import (
	"log"
	"os"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/pdhoang91/ai-service/handlers"
)

func main() {
	// Kiểm tra biến môi trường OPENAI_API_KEY
	// if os.Getenv("OPENAI_API_KEY") == "" {
	// 	log.Fatal("OPENAI_API_KEY environment variable is required")
	// }

	// Khởi tạo router Gin
	r := gin.Default()

	config := cors.Config{
		AllowOrigins:     []string{"http://202.92.6.77:3000", "http://localhost:3000", "https://insight.io.vn"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}

	r.Use(cors.New(config))

	// Định nghĩa các route
	r.POST("/ai/fetch-article", handlers.FetchArticle)
	r.POST("/ai/summarize", handlers.Summarize)

	// Lấy port từ môi trường (mặc định 86)
	port := os.Getenv("PORT")
	if port == "" {
		port = "86"
	}

	// Khởi động server
	log.Printf("Server starting on port %s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatal(err)
	}
}
