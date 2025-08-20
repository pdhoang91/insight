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

		// Public post routes
		public.GET("/posts", controller.ListPosts)
		public.GET("/posts/latest", controller.GetLatestPosts)
		public.GET("/posts/recent", controller.GetRecentPosts)
		public.GET("/posts/popular", controller.GetPopularPosts)
		public.GET("/posts/top", controller.GetTopPosts)
		public.GET("/posts/:id", controller.GetPost)
		public.GET("/p/:titleName", controller.GetPostByTitleName) // Frontend compatibility

		// Search routes
		public.GET("/search/posts", controller.SearchPosts)
		public.GET("/search", controller.SearchAll)

		// Public category routes
		public.GET("/categories", controller.ListCategories)
		public.GET("/categories/top", controller.GetTopCategories)
		public.GET("/categories_top", controller.GetTopCategories) // Alias for frontend typo
		public.GET("/categories/popular", controller.GetPopularCategories)
		public.GET("/categories/:id", controller.GetCategory)

		// Public tag routes
		public.GET("/tags", controller.ListTags)
		public.GET("/tags/popular", controller.GetPopularTags)
		public.GET("/tags/:id", controller.GetTag)

		// Public user routes
		public.GET("/users/:id", controller.GetUser)
		public.GET("/users/:id/posts", controller.GetUserPosts)
		public.GET("/public/:username/posts", controller.GetUserPostsByUsername) // Frontend compatibility
	}

	// Protected routes (authentication required)
	protected := v1.Group("")
	protected.Use(middleware.AuthMiddleware())
	{
		// User routes
		protected.GET("/profile", controller.GetProfile)
		protected.GET("/api/me", controller.GetProfile) // Alias for frontend compatibility
		protected.PUT("/profile", controller.UpdateProfile)
		protected.DELETE("/profile", controller.DeleteProfile)
		protected.GET("/api/users/:id/posts", controller.GetUserPosts) // Frontend compatibility

		// Post routes
		protected.POST("/posts", controller.CreatePost)
		protected.POST("/api/posts", controller.CreatePost) // Frontend compatibility
		protected.PUT("/posts/:id", controller.UpdatePost)
		protected.DELETE("/posts/:id", controller.DeletePost)

		// Category routes (admin only for create/update/delete)
		protected.POST("/categories", controller.CreateCategory)
		protected.PUT("/categories/:id", controller.UpdateCategory)
		protected.DELETE("/categories/:id", controller.DeleteCategory)

		// Comment routes
		protected.POST("/comments", controller.CreateComment)
		protected.PUT("/comments/:id", controller.UpdateComment)
		protected.DELETE("/comments/:id", controller.DeleteComment)
		protected.GET("/posts/:id/comments", controller.GetPostComments)

		// Tag routes
		protected.POST("/tags", controller.CreateTag)
		protected.PUT("/tags/:id", controller.UpdateTag)
		protected.DELETE("/tags/:id", controller.DeleteTag)

		// Reply routes
		protected.POST("/replies", controller.CreateReply)
		protected.PUT("/replies/:id", controller.UpdateReply)
		protected.DELETE("/replies/:id", controller.DeleteReply)
		protected.GET("/comments/:id/replies", controller.GetCommentReplies)

		// Bookmark routes
		protected.POST("/bookmarks", controller.CreateBookmark)
		protected.POST("/bookmarks/remove", controller.Unbookmark)
		protected.GET("/bookmarks", controller.GetUserBookmarks)
		protected.GET("/bookmarks/status/:post_id", controller.CheckBookmarkStatus)
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
