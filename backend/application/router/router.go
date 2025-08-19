// package router
package router

import (
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"

	controllers "github.com/pdhoang91/blog/controller"
	"github.com/pdhoang91/blog/middleware"
)

func SetupRouter(controllers *controllers.Controllers) *gin.Engine {
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

	// Use the main controller
	mainCtrl := controllers.Main

	// Auth routes
	r.POST("/auth/login", mainCtrl.LoginHandler)
	r.POST("/auth/register", mainCtrl.RegisterHandler)
	r.GET("/auth/google", mainCtrl.GoogleLoginHandler)
	r.GET("/auth/google/callback", mainCtrl.GoogleCallbackHandler)
	r.GET("/auth/callback", mainCtrl.GoogleCallbackHandler) // Alternative route for frontend

	// Routes cho Posts and Comments
	r.GET("/posts", mainCtrl.GetPosts)
	r.GET("/posts/popular", mainCtrl.GetPopularPosts)
	r.GET("/posts/latest", mainCtrl.GetLatestPosts)
	r.GET("/p/:title_name", mainCtrl.GetPostByName)
	r.GET("/posts/:id/comments", mainCtrl.GetComments)

	// Routes cho Categories
	r.GET("/categories", mainCtrl.GetCategories)
	r.GET("/categories/:name/posts", mainCtrl.GetPostsByCategory)
	r.GET("/categories_top", mainCtrl.GetTopCategories)
	r.GET("/categories/popular", mainCtrl.GetPopularCategories)

	// Routes cho Tags
	r.GET("/tags", mainCtrl.GetTags)
	r.GET("/tags/search", mainCtrl.SearchTags)
	r.GET("/tags/popular", mainCtrl.GetPopularTags)
	r.POST("/tags", mainCtrl.CreateTag)
	//r.DELETE("/tags/:id", mainCtrl.DeleteTag)
	r.POST("/tag/:tag_id/posts/:post_id", mainCtrl.AddTagToPost)
	r.DELETE("/tag/:tag_id/posts/:post_id", mainCtrl.RemoveTagFromPost)

	r.GET("/search/posts", mainCtrl.SearchPostsHandler)
	r.POST("/search/track", mainCtrl.TrackSearchHandler)

	// Public User Profile routes (with optional auth for admin features)
	r.GET("/public/:username/profile", middleware.OptionalAuthMiddleware(), mainCtrl.GetPublicUserProfile)
	r.GET("/public/:username/posts", mainCtrl.GetPublicUserPosts)
	r.GET("/public/:username/follow", mainCtrl.GetPublicUserFollow)

	// Public image routes
	imageRoutes := r.Group("/images")
	{
		// Public image info (no auth required for viewing)
		imageRoutes.GET("/:id/info", mainCtrl.GetImageInfo)
	}

	// Public clap routes (can be viewed without auth, but auth required for clapping)
	r.GET("/claps", mainCtrl.GetClaps)

	// Protected image routes
	protectedImages := r.Group("/images")
	protectedImages.Use(middleware.AuthMiddleware())
	{
		// Upload images
		protectedImages.POST("/upload/v2/:type", mainCtrl.UploadImage)

		// Delete images
		protectedImages.DELETE("/:id", mainCtrl.DeleteImage)

		// List user's images
		protectedImages.GET("/my", mainCtrl.GetUserImages)

		// Link image to post
		protectedImages.POST("/link", mainCtrl.LinkImageToPost)
	}

	// API routes
	api := r.Group("/api")
	api.Use(middleware.AuthMiddleware()) // Apply auth middleware to protect these routes
	{
		api.GET("/me", mainCtrl.GetUserProfile)
		api.PUT("/users/:id", mainCtrl.UpdateUser)

		api.POST("/posts", mainCtrl.CreatePost)
		api.PUT("/posts/:id", mainCtrl.UpdatePost)
		api.DELETE("/posts/:id", mainCtrl.DeletePost)
		api.POST("/posts/:id/comments", mainCtrl.CreateComment)
		api.POST("/post/:id/clap", mainCtrl.ClapPost)
		api.POST("/comment/:id/clap", mainCtrl.ClapComment)
		api.POST("/reply/:id/clap", mainCtrl.ClapReply)

		// Comments replies
		api.POST("/comments/:comment_id/replies", mainCtrl.CreateReply)
	}

	return r
}
