// package router
package router

import (
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"

	controllers "github.com/pdhoang91/blog/controller"
	"github.com/pdhoang91/blog/middleware"
)

func SetupRouter() *gin.Engine {
	r := gin.Default()

	// CORS Configuration
	config := cors.Config{
		AllowOrigins:     []string{"http://202.92.6.77:3000", "http://localhost:3000", "https://insight.io.vn", "https://www.insight.io.vn"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}
	r.Use(cors.New(config))

	// Auth routes
	r.POST("/auth/login", controllers.LoginHandler)
	r.POST("/auth/register", controllers.RegisterHandler)
	r.GET("/auth/google", controllers.GoogleLoginHandler)
	r.GET("/auth/google/callback", controllers.GoogleCallbackHandler)

	// Routes cho Posts and Comments
	r.GET("/posts", controllers.GetPosts)
	r.GET("/posts/popular", controllers.GetPopularPosts)
	r.GET("/posts/latest", controllers.GetLatestPosts)
	r.GET("/p/:title_name", controllers.GetPostByName)
	r.GET("/posts/:id/comments", controllers.GetComments)

	// Routes cho Categories
	r.GET("/categories", controllers.GetCategories)
	r.GET("/categories/:category/posts", controllers.GetPostsByCategory)
	r.GET("/categories_top", controllers.GetTopCategories)
	r.GET("/categories/popular", controllers.GetPopularCategories)

	// Routes cho Tags
	r.GET("/tags", controllers.GetTags)
	r.GET("/tags/search", controllers.SearchTags)
	r.GET("/tags/popular", controllers.GetPopularTags)
	r.POST("/tags", controllers.CreateTag)
	//r.DELETE("/tags/:id", controllers.DeleteTag)
	r.POST("/tag/:tag_id/posts/:post_id", controllers.AddTagToPost)
	r.DELETE("/tag/:tag_id/posts/:post_id", controllers.RemoveTagFromPost)

	r.GET("/search/posts", controllers.SearchPostsHandler)
	r.POST("/search/track", controllers.TrackSearchHandler)

	// Public User Profile routes (with optional auth for admin features)
	r.GET("/public/:username/profile", middleware.OptionalAuthMiddleware(), controllers.GetPublicUserProfile)
	r.GET("/public/:username/posts", controllers.GetPublicUserPosts)
	r.GET("/public/:username/follow", controllers.GetPublicUserFollow)

	// Static file serving for uploaded images
	r.Static("/uploads", "./uploads")

	// Protected image upload routes
	protected := r.Group("/images")
	protected.Use(middleware.AuthMiddleware())
	{
		protected.POST("/upload/v2/:type", controllers.UploadImage)
	}

	// API routes
	api := r.Group("/api")
	api.Use(middleware.AuthMiddleware()) // Apply auth middleware to protect these routes
	{
		api.GET("/me", controllers.GetUserProfile)
		api.PUT("/users/:id", controllers.UpdateUser)

		api.POST("/posts", controllers.CreatePost)
		api.PUT("/posts/:id", controllers.UpdatePost)
		api.DELETE("/posts/:id", controllers.DeletePost)
		api.POST("/posts/:id/comments", controllers.CreateComment)

		// Comments replies
		api.POST("/comments/:comment_id/replies", controllers.CreateReply)
	}

	return r
}
