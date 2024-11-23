// router/router.go
package router

import (
	"fmt"
	"os"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"

	controllers "github.com/pdhoang91/auth-service/controller"
	"github.com/pdhoang91/auth-service/middleware"
)

func SetupRouter() *gin.Engine {
	r := gin.Default()

	r.Static("/uploads", "./uploads") // Serve the uploads directory
	allowOrigins := os.Getenv("BASE_FE_URL")
	fmt.Println("allowOrigins", allowOrigins)
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
	// Đăng ký LoggerMiddleware
	r.Use(middleware.LoggerMiddleware())

	// Auth routes
	r.POST("/auth/login", controllers.LoginHandler)
	r.POST("/auth/register", controllers.RegisterHandler)
	r.GET("/auth/google", controllers.GoogleLoginHandler)
	r.GET("/auth/google/callback", controllers.GoogleCallbackHandler)

	// API routes
	api := r.Group("/api")
	api.Use(middleware.AuthMiddleware()) // Apply auth middleware to protect these routes
	{
		api.GET("/me", controllers.GetUserProfile)
		api.PUT("/users/:id", controllers.UpdateUser)

		api.GET("/verify", controllers.VerifyEmail)
		api.POST("/password-reset/request", controllers.RequestPasswordReset)
		api.POST("/password-reset/confirm", controllers.ConfirmPasswordReset)
	}

	// Admin routes
	admin := api.Group("/admin")
	admin.Use(middleware.RequireRole("admin"))
	{
		admin.GET("/users", controllers.AdminGetUsers)
		admin.DELETE("/users/:id", controllers.AdminDeleteUser)
	}

	return r
}
