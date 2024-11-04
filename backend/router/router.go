// package router
package router

import (
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"

	"github.com/pdhoang91/blog/controllers"
	"github.com/pdhoang91/blog/middleware"
)

func SetupRouter() *gin.Engine {
	r := gin.Default()

	r.Static("/uploads", "./uploads") // Serve the uploads directory
	config := cors.Config{
		//AllowOrigins:     []string{"http://localhost:3000"}, // Thay đổi tùy vào frontend
		AllowOrigins:     []string{"http://202.92.6.77:3000"}, // Thay đổi tùy vào frontend
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

	// Routes cho Posts and Comments, Ratings
	r.GET("/posts", controllers.GetPosts)
	//r.GET("/posts/:id", controllers.GetPostByID)
	r.GET("/p/:title_name", controllers.GetPostByName)
	r.GET("/posts/:id/comments", controllers.GetComments)
	//r.POST("/posts/:id/comments", controllers.CreateComment)
	r.GET("/posts/:id/ratings", controllers.GetRatingForPost)

	// Routes cho Categories
	r.GET("/categories", controllers.GetCategories)
	r.POST("/categories", controllers.CreateCategory)
	r.GET("/categories/:category/posts", controllers.GetPostsByCategory)
	r.GET("/categories_top", controllers.GetTopCategories)

	// Routes cho Tags
	r.GET("/tags", controllers.GetTags)
	r.POST("/tags", controllers.CreateTag)
	//r.DELETE("/tags/:id", controllers.DeleteTag)
	r.POST("/tag/:tag_id/posts/:post_id", controllers.AddTagToPost)
	r.DELETE("/tag/:tag_id/posts/:post_id", controllers.RemoveTagFromPost)

	// Routes cho UserActivity
	r.GET("/users/:user_id/activities", controllers.GetUserActivities)

	// Utils
	r.GET("/claps", controllers.GetClapsCount)
	r.GET("/topics/recommended", controllers.GetRecommendedTopics)
	r.GET("/search/v2/posts", controllers.SearchPostsHandler)
	r.GET("/search/posts", controllers.SearchPostsBasic)
	r.GET("/search/people", controllers.SearchUsers)
	r.GET("/search/categories", controllers.SearchPostsBasic)
	r.GET("/search/tags", controllers.SearchPostsBasic)
	r.GET("/autocomplete/posts", controllers.AutocompleteHandler)

	r.GET("/tabs", controllers.GetTabs)
	r.GET("/follow/writers", controllers.GetTopWriters)
	r.GET("/follow/topics", controllers.GetTopTopics)

	// Public User Profile routes
	r.GET("/public/:username/profile", controllers.GetPublicUserProfile)
	r.GET("/public/:username/posts", controllers.GetPublicUserPosts)
	r.GET("/public/:username/bookmarks", controllers.GetPublicUserBookmarks)

	// Images
	r.POST("/images/upload", controllers.UploadImage)

	// API routes
	api := r.Group("/api")
	api.Use(middleware.AuthMiddleware()) // Apply auth middleware to protect these routes
	{
		api.GET("/me", controllers.GetUserProfile)
		api.PUT("/users/:id", controllers.UpdateUser)
		api.GET("/users/:id/posts", controllers.GetUserPosts)

		api.POST("/posts", controllers.CreatePost)
		api.PUT("/posts/:id", controllers.UpdatePost)
		api.POST("/posts/:id/comments", controllers.CreateComment)
		api.POST("/posts/:id/ratings", controllers.CreateRating)
		//api.DELETE("/posts/:id", controllers.DeletePost)

		api.GET("/bookmarks", controllers.GetBookmarks)
		api.POST("/bookmarks", controllers.CreateBookmark)
		api.POST("/bookmarks/unbookmark", controllers.Unbookmark)
		api.GET("/bookmarks/isBookmarked/:post_id", controllers.IsBookmarked)

		api.POST("/follow", controllers.FollowUser)
		api.DELETE("/unfollow/:id", controllers.UnfollowUser)
		api.GET("/following/posts", controllers.GetFollowingPosts)
		api.GET("/follow/status/:id", controllers.CheckFollowingStatus)
		api.GET("/follow/suggested-profiles", controllers.GetSuggestedProfiles) // Route mới
		api.GET("/follow/people-you-may-know", controllers.GetPeopleYouMayKnow) // Route mới

		// Notification routes
		api.GET("/notifications", controllers.GetNotifications)
		api.PUT("/notifications/:id/read", controllers.MarkNotificationAsRead)
		api.GET("/verify", controllers.VerifyEmail)
		api.POST("/password-reset/request", controllers.RequestPasswordReset)
		api.POST("/password-reset/confirm", controllers.ConfirmPasswordReset)

		// Clap actions
		api.POST("/post/:id/clap", controllers.HandleClapPost)
		api.POST("/post/:id/unclap", controllers.HandleUnclapPost)
		api.POST("/comment/:id/clap", controllers.HandleClapComment)
		api.POST("/reply/:id/clap", controllers.HandleClapReply)

		// Comments replies
		api.POST("/comments/:comment_id/replies", controllers.CreateReply)

		// Tab
		api.POST("/tabs/add", controllers.AddFollowCategory)
		api.POST("/tabs/remove", controllers.RemoveFollowCategory)
		//GetTabs
		//api.GET("/user-tabs", controllers.GetUserTabs)
		//api.GET("/tabs", controllers.GetTabs)
		api.GET("/tabs", controllers.GetUserTabs)
	}

	// Admin routes
	admin := api.Group("/admin")
	admin.Use(middleware.RequireRole("admin"))
	{
		admin.GET("/users", controllers.AdminGetUsers)
		admin.DELETE("/users/:id", controllers.AdminDeleteUser)
		admin.POST("/bulk_index", controllers.BulkIndexHandler)
	}

	return r
}
