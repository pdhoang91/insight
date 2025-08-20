// package router
package router

import (
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"

	controllers "github.com/pdhoang91/blog/controller"
	"github.com/pdhoang91/blog/middleware"
)

func SetupRouter(ctrl *controllers.Controller) *gin.Engine {
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
	r.POST("/auth/login", ctrl.LoginHandler)
	r.POST("/auth/register", ctrl.RegisterHandler)
	r.GET("/auth/google", ctrl.GoogleLoginHandler)
	r.GET("/auth/google/callback", ctrl.GoogleCallbackHandler)

	// Routes cho Posts and Comments, Ratings
	r.GET("/posts", ctrl.GetPosts)
	r.GET("/posts/popular", ctrl.GetPopularPosts)
	r.GET("/posts/latest", ctrl.GetLatestPosts)
	r.GET("/p/:title_name", ctrl.GetPostByName)
	r.GET("/posts/:id/comments", ctrl.GetComments)
	r.GET("/posts/:id/ratings", ctrl.GetRatingForPost)

	// Routes cho Categories
	r.GET("/categories", ctrl.GetCategories)
	r.POST("/categories", ctrl.CreateCategory)
	r.GET("/categories/:category/posts", ctrl.GetPostsByCategory)
	r.GET("/categories_top", ctrl.GetTopCategories)
	r.GET("/categories/popular", ctrl.GetPopularCategories)

	// Routes cho Tags
	r.GET("/tags", ctrl.GetTags)
	r.GET("/tags/search", ctrl.SearchTags)
	r.GET("/tags/popular", ctrl.GetPopularTags)
	r.POST("/tags", ctrl.CreateTag)
	//r.DELETE("/tags/:id", controllers.DeleteTag)
	r.POST("/tag/:tag_id/posts/:post_id", ctrl.AddTagToPost)
	r.DELETE("/tag/:tag_id/posts/:post_id", ctrl.RemoveTagFromPost)

	// Routes cho UserActivity
	r.GET("/users/:user_id/activities", ctrl.GetUserActivities)

	// Utils
	r.GET("/claps", ctrl.GetClapsCount)
	r.GET("/topics/recommended", ctrl.GetRecommendedTopics)

	r.GET("/search/posts", ctrl.SearchPostsHandler)
	r.GET("/search/suggestions", ctrl.SearchSuggestionsHandler)
	r.GET("/search/popular", ctrl.PopularSearchesHandler)
	r.POST("/search/track", ctrl.TrackSearchHandler)

	r.GET("/search/people", ctrl.SearchUsers)

	r.GET("/tabs", ctrl.GetTabs)
	r.GET("/follow/writers", ctrl.GetTopWriters)
	r.GET("/follow/topics", ctrl.GetTopTopics)

	// Public User Profile routes (with optional auth for admin features)
	r.GET("/public/:username/profile", middleware.OptionalAuthMiddleware(), ctrl.GetPublicUserProfile)
	r.GET("/public/:username/posts", ctrl.GetPublicUserPosts)
	r.GET("/public/:username/bookmarks", ctrl.GetPublicUserBookmarks)
	r.GET("/public/:username/follow", ctrl.GetPublicUserFollow)

	// Public image routes (no auth required for viewing)
	r.GET("/images/proxy/:userID/:date/:type/:filename", ctrl.ProxyImage)
	r.GET("/images/info/:userID/:date/:type/:filename", ctrl.GetImageInfo)

	// New image system routes
	r.GET("/images/v2/:id", ctrl.ServeImageV2)        // Serve image by ID
	r.GET("/images/v2/:id/info", ctrl.GetImageInfoV2) // Get image metadata

	// Protected image routes
	protected := r.Group("/")
	protected.Use(middleware.AuthMiddleware())
	{
		protected.POST("/images/upload/v2/:type", ctrl.UploadImageV2) // Updated to use unified controller
		protected.DELETE("/images/v2/:id", ctrl.DeleteImageV2)        // Delete image
		protected.GET("/images/my", ctrl.ListUserImages)              // List user's images
	}

	// API routes
	api := r.Group("/api")
	api.Use(middleware.AuthMiddleware()) // Apply auth middleware to protect these routes
	{
		api.GET("/me", ctrl.GetUserProfile)
		api.PUT("/users/:id", ctrl.UpdateUser)
		api.GET("/users/:id/posts", ctrl.GetUserPosts)

		api.POST("/posts", ctrl.CreatePost)    // Updated to use unified controller
		api.PUT("/posts/:id", ctrl.UpdatePost) // Updated to use unified controller
		api.DELETE("/posts/:id", ctrl.DeletePost)

		// Optimized post endpoints (new design)
		api.POST("/posts/v2", ctrl.OptimizedCreatePost)    // Optimized version
		api.PUT("/posts/v2/:id", ctrl.OptimizedUpdatePost) // Optimized version
		api.POST("/posts/:id/comments", ctrl.CreateComment)
		api.POST("/posts/:id/ratings", ctrl.CreateRating)
		//api.DELETE("/posts/:id", controllers.DeletePost)

		api.GET("/bookmarks", ctrl.GetBookmarks)
		api.POST("/bookmarks", ctrl.CreateBookmark)
		api.POST("/bookmarks/unbookmark", ctrl.Unbookmark)
		api.GET("/bookmarks/isBookmarked/:post_id", ctrl.IsBookmarked)

		api.POST("/follow", ctrl.FollowUser)
		api.DELETE("/unfollow/:id", ctrl.UnfollowUser)
		api.GET("/following/posts", ctrl.GetFollowingPosts)
		api.GET("/follow/status/:id", ctrl.CheckFollowingStatus)
		api.GET("/follow/suggested-profiles", ctrl.GetSuggestedProfiles) // Route mới
		api.GET("/follow/people-you-may-know", ctrl.GetPeopleYouMayKnow) // Route mới

		// Notification routes
		api.GET("/notifications", ctrl.GetNotifications)
		api.PUT("/notifications/:id/read", ctrl.MarkNotificationAsRead)
		api.GET("/verify", ctrl.VerifyEmail)
		api.POST("/password-reset/request", ctrl.RequestPasswordReset)
		api.POST("/password-reset/confirm", ctrl.ConfirmPasswordReset)

		// Clap actions
		api.POST("/post/:id/clap", ctrl.HandleClapPost)
		api.POST("/post/:id/unclap", ctrl.HandleUnclapPost)
		api.POST("/comment/:id/clap", ctrl.HandleClapComment)
		api.POST("/comment/:id/unclap", ctrl.HandleUnclapComment)
		api.POST("/reply/:id/clap", ctrl.HandleClapReply)
		api.POST("/reply/:id/unclap", ctrl.HandleUnclapReply)

		// Comments replies
		api.POST("/comments/:comment_id/replies", ctrl.CreateReply)

		// Tab
		api.POST("/tabs/add", ctrl.AddFollowCategory)
		api.POST("/tabs/remove", ctrl.RemoveFollowCategory)
		//GetTabs
		//api.GET("/user-tabs", controllers.GetUserTabs)
		//api.GET("/tabs", controllers.GetTabs)
		api.GET("/tabs", ctrl.GetUserTabs)
	}

	// Admin routes
	admin := api.Group("/admin")
	admin.Use(middleware.RequireAdminRole())
	{
		admin.GET("/users", ctrl.AdminGetUsers)
		admin.DELETE("/users/:id", ctrl.AdminDeleteUser)

	}

	return r
}
