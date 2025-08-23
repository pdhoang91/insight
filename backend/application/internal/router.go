package internal

import (
	"github.com/gin-gonic/gin"
	"github.com/pdhoang91/blog/internal/controller"
	"github.com/pdhoang91/blog/internal/middleware"
)

// DefineAPIRoutes sets up all API routes using a single controller
func DefineAPIRoutes(r *gin.Engine, controller *controller.Controller) {
	// API version 1
	//v1 := r.Group("/api/v1")
	v1 := r.Group("")

	// Public routes (no authentication required)
	public := v1.Group("")
	{
		// Auth routes
		public.POST("/auth/register", controller.Register)
		public.POST("/auth/login", controller.Login)
		public.GET("/auth/google", controller.GoogleLogin)
		public.GET("/auth/google/callback", controller.GoogleCallback)
		public.POST("/auth/logout", controller.Logout)
		public.POST("/auth/refresh", controller.RefreshToken)

		// Debug route
		public.GET("/debug-jwt", controller.DebugJWT)

		// Public post routes
		public.GET("/posts", controller.ListPosts)
		public.GET("/posts/latest", controller.GetLatestPosts)
		public.GET("/posts/recent", controller.GetRecentPosts)
		public.GET("/posts/popular", controller.GetPopularPosts)
		public.GET("/posts/top", controller.GetTopPosts)
		public.GET("/posts/:id", controller.GetPost)
		public.GET("/posts/:id/comments", controller.GetPostComments) // Public comment reading
		public.GET("/p/:titleName", controller.GetPostByTitleName)    // Frontend compatibility

		// Search routes
		public.GET("/search/posts", controller.SearchPosts)
		public.GET("/search", controller.SearchAll)

		// Public category routes
		public.GET("/categories", controller.ListCategories)
		public.GET("/categories/top", controller.GetTopCategories)
		public.GET("/categories_top", controller.GetTopCategories) // Alias for frontend typo
		public.GET("/categories/popular", controller.GetPopularCategories)

		// Category by ID route (UUID pattern)
		public.GET("/categories/id/:id", controller.GetCategory) // Category by UUID - moved to /categories/id/:id

		// Category posts route - now safe from conflicts
		public.GET("/categories/:name/posts", controller.GetPostsByCategory) // Posts by category name

		// Public tag routes
		public.GET("/tags", controller.ListTags)
		public.GET("/tags/popular", controller.GetPopularTags)
		public.GET("/tags/:id", controller.GetTag)

		// Public user routes
		public.GET("/users/:id", controller.GetUser)
		public.GET("/users/:id/posts", controller.GetUserPosts)
		public.GET("/public/:username/posts", controller.GetUserPostsByUsername)     // Frontend compatibility
		public.GET("/public/:username/profile", controller.GetUserProfileByUsername) // Frontend compatibility

		// Test routes (for development)
		public.DELETE("/test/posts/:id", controller.TestDeletePost) // Test soft delete without auth

		// Public image routes (no auth required for viewing)
		public.GET("/images/proxy/:userID/:date/:type/:filename", controller.ProxyImage)
		public.GET("/images/info/:userID/:date/:type/:filename", controller.GetImageInfo)

		// New image system routes
		public.GET("/images/v2/:id", controller.ServeImageV2)        // Serve image by ID
		public.GET("/images/v2/:id/info", controller.GetImageInfoV2) // Get image metadata

		// Public claps count
		public.GET("/claps", controller.GetClapsCount)              // Get claps count
		public.GET("/claps/status", controller.CheckUserClapStatus) // Check user clap status (works with optional auth)
		public.GET("/claps/info", controller.GetClapInfo)           // Get both clap count and user status in one call
	}

	// Protected routes (authentication required)
	protected := v1.Group("/api")
	protected.Use(middleware.AuthMiddleware())
	{
		// User routes
		protected.GET("/profile", controller.GetProfile)
		protected.GET("/me", controller.GetProfile) // Alias for frontend compatibility
		protected.PUT("/users/:id", controller.UpdateProfile)
		protected.PUT("/profile", controller.UpdateProfile)
		protected.DELETE("/profile", controller.DeleteProfile)
		protected.GET("/users/:id/posts", controller.GetUserPosts) // Frontend compatibility

		// Post routes
		protected.POST("/posts", controller.CreatePost)
		protected.POST("/api/posts", controller.CreatePost) // Frontend compatibility
		protected.PUT("/posts/:id", controller.UpdatePost)
		protected.PUT("/api/posts/:id", controller.UpdatePost) // Frontend compatibility
		protected.DELETE("/posts/:id", controller.DeletePost)
		protected.DELETE("/api/posts/:id", controller.DeletePost) // Frontend compatibility
		protected.POST("/posts/:id/clap", controller.ClapPost)    // Clap/unclap post

		// Category routes (admin only for create/update/delete)
		protected.POST("/categories", controller.CreateCategory)
		protected.PUT("/categories/id/:id", controller.UpdateCategory)
		protected.DELETE("/categories/id/:id", controller.DeleteCategory)

		// Comment routes
		protected.POST("/comments", controller.CreateComment)
		protected.POST("/posts/:id/comments", controller.CreateCommentForPost) // Alternative endpoint for frontend
		protected.PUT("/comments/:id", controller.UpdateComment)
		protected.DELETE("/comments/:id", controller.DeleteComment)
		protected.GET("/posts/:id/comments", controller.GetPostComments)
		protected.POST("/comments/:id/clap", controller.ClapComment) // Clap comment

		// Tag routes
		protected.POST("/tags", controller.CreateTag)
		protected.PUT("/tags/:id", controller.UpdateTag)
		protected.DELETE("/tags/:id", controller.DeleteTag)

		// Reply routes
		protected.POST("/replies", controller.CreateReply)
		protected.POST("/comments/:id/replies", controller.CreateReplyForComment) // Alternative endpoint for frontend
		protected.PUT("/replies/:id", controller.UpdateReply)
		protected.DELETE("/replies/:id", controller.DeleteReply)
		protected.GET("/comments/:id/replies", controller.GetCommentReplies)
		protected.POST("/replies/:id/clap", controller.ClapReply) // Clap reply

		// Bookmark routes
		protected.POST("/bookmarks", controller.CreateBookmark)
		protected.POST("/bookmarks/remove", controller.Unbookmark)
		protected.GET("/bookmarks", controller.GetUserBookmarks)
		protected.GET("/bookmarks/status/:post_id", controller.CheckBookmarkStatus)

		protected.POST("/images/upload/v2/:type", controller.UploadImageV2) // Updated to use new system
		protected.DELETE("/images/v2/:id", controller.DeleteImageV2)        // Delete image
		protected.GET("/images/my", controller.ListUserImages)
	}

	// Admin routes (admin role required)
	admin := v1.Group("/admin")
	admin.Use(middleware.AuthMiddleware(), middleware.AdminMiddleware())
	{
		admin.GET("/users", controller.GetAllUsers)
		admin.DELETE("/users/:id", controller.DeleteUser)
		admin.GET("/posts", controller.GetAllPosts)
		admin.DELETE("/posts/:id", controller.DeletePost)

	}
}
