package internal

import (
	"github.com/gin-gonic/gin"
	"github.com/pdhoang91/blog/internal/controller"
	"github.com/pdhoang91/blog/internal/middleware"
)

// DefineAPIRoutes sets up all API routes using domain-specific controllers.
func DefineAPIRoutes(r *gin.Engine, ctrl *controller.Controller) {
	v1 := r.Group("")

	// --- Public routes (no authentication required) ---
	public := v1.Group("")
	{
		// Auth
		public.POST("/auth/register", ctrl.Auth.Register)
		public.POST("/auth/login", ctrl.Auth.Login)
		public.GET("/auth/google", ctrl.Auth.GoogleLogin)
		public.GET("/auth/google/callback", ctrl.Auth.GoogleCallback)
		public.POST("/auth/logout", ctrl.Auth.Logout)
		public.POST("/auth/refresh", ctrl.Auth.RefreshToken)

		// Debug
		public.GET("/debug-jwt", ctrl.User.DebugJWT)

		public.GET("/home", ctrl.Home.GetHomeData)

		// Posts
		public.GET("/posts", ctrl.Post.ListPosts)
		public.GET("/posts/popular", ctrl.Post.GetPopularPosts)
		public.GET("/posts/:id", ctrl.Post.GetPost)
		public.GET("/posts/:id/comments", ctrl.Comment.GetPostComments)
		public.GET("/p/:titleName", ctrl.Post.GetPostByTitleName)

		// Archive
		public.GET("/archive/:year/:month", ctrl.Post.GetPostsByYearMonth)

		// Search
		public.GET("/search/posts", ctrl.Search.SearchPosts)

		// Categories
		public.GET("/categories", ctrl.Category.ListCategories)
		public.GET("/categories/top", ctrl.Category.GetTopCategories)
		public.GET("/categories/popular", ctrl.Category.GetPopularCategories)
		public.GET("/categories/id/:id", ctrl.Category.GetCategory)
		public.GET("/categories/:name/posts", ctrl.Post.GetPostsByCategory)

		// Tags
		public.GET("/tags", ctrl.Tag.ListTags)
		public.GET("/tags/popular", ctrl.Tag.GetPopularTags)

		// Users
		public.GET("/users/:id", ctrl.User.GetUser)
		public.GET("/users/:id/posts", ctrl.Post.GetUserPosts)
		public.GET("/public/:username/posts", ctrl.Post.GetUserPostsByUsername)
		public.GET("/public/:username/profile", ctrl.User.GetUserProfileByUsername)

		// Images (public viewing)
		public.GET("/images/proxy/:userID/:date/:type/:filename", ctrl.Image.ProxyImage)
		public.GET("/images/info/:userID/:date/:type/:filename", ctrl.Image.GetImageInfo)
		public.GET("/images/v2/:id", ctrl.Image.ServeImageV2)
		public.GET("/images/v2/:id/info", ctrl.Image.GetImageInfoV2)

		// Claps (public read)
		public.GET("/claps", ctrl.Engagement.GetClapsCount)
		public.GET("/claps/status", ctrl.Engagement.CheckUserClapStatus)
		public.GET("/claps/info", ctrl.Engagement.GetClapInfo)
	}

	// --- Protected routes (authentication required) ---
	protected := v1.Group("/api")
	protected.Use(middleware.AuthMiddleware())
	{
		// Users
		protected.GET("/profile", ctrl.User.GetProfile)
		protected.GET("/me", ctrl.User.GetProfile)
		protected.PUT("/users/:id", ctrl.User.UpdateProfile)
		protected.PUT("/profile", ctrl.User.UpdateProfile)
		protected.DELETE("/profile", ctrl.User.DeleteProfile)
		protected.GET("/users/:id/posts", ctrl.Post.GetUserPosts)

		// Posts
		protected.POST("/posts", ctrl.Post.CreatePost)
		protected.PUT("/posts/:id", ctrl.Post.UpdatePost)
		protected.DELETE("/posts/:id", ctrl.Post.DeletePost)
		protected.POST("/posts/:id/clap", ctrl.Engagement.ClapPost)

		// Categories
		protected.POST("/categories", ctrl.Category.CreateCategory)
		protected.PUT("/categories/id/:id", ctrl.Category.UpdateCategory)
		protected.DELETE("/categories/id/:id", ctrl.Category.DeleteCategory)

		// Comments
		protected.POST("/comments", ctrl.Comment.CreateComment)
		protected.POST("/posts/:id/comments", ctrl.Comment.CreateCommentForPost)
		protected.PUT("/comments/:id", ctrl.Comment.UpdateComment)
		protected.DELETE("/comments/:id", ctrl.Comment.DeleteComment)
		protected.GET("/posts/:id/comments", ctrl.Comment.GetPostComments)
		protected.POST("/comments/:id/clap", ctrl.Engagement.ClapComment)

		// Tags
		protected.POST("/tags", ctrl.Tag.CreateTag)
		protected.PUT("/tags/:id", ctrl.Tag.UpdateTag)
		protected.DELETE("/tags/:id", ctrl.Tag.DeleteTag)

		// Replies
		protected.POST("/replies", ctrl.Comment.CreateReply)
		protected.POST("/comments/:id/replies", ctrl.Engagement.CreateReplyForComment)
		protected.DELETE("/replies/:id", ctrl.Comment.DeleteReply)
		protected.GET("/comments/:id/replies", ctrl.Comment.GetCommentReplies)
		protected.POST("/replies/:id/clap", ctrl.Engagement.ClapReply)

		// Bookmarks
		protected.POST("/bookmarks", ctrl.Bookmark.CreateBookmark)
		protected.POST("/bookmarks/remove", ctrl.Bookmark.Unbookmark)
		protected.GET("/bookmarks", ctrl.Bookmark.GetUserBookmarks)
		protected.GET("/bookmarks/status/:post_id", ctrl.Bookmark.CheckBookmarkStatus)

		// Images
		protected.POST("/images/upload/v2/:type", ctrl.Image.UploadImageV2)
		protected.DELETE("/images/v2/:id", ctrl.Image.DeleteImageV2)
		protected.GET("/images/my", ctrl.Image.ListUserImages)
	}

	// --- Admin routes ---
	admin := v1.Group("/admin")
	admin.Use(middleware.AuthMiddleware(), middleware.AdminMiddleware())
	{
		admin.DELETE("/posts/:id", ctrl.Post.DeletePost)
	}
}
