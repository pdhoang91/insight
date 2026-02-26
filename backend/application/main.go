package main

import (
	"fmt"
	"log"
	"os"

	"github.com/gin-contrib/cors"

	"github.com/gin-gonic/gin"
	"github.com/pdhoang91/blog/config"
	"github.com/pdhoang91/blog/internal"
	"github.com/pdhoang91/blog/internal/controller"
	"github.com/pdhoang91/blog/internal/repository"
	"github.com/pdhoang91/blog/internal/service"
	"github.com/pdhoang91/blog/pkg/storage"
)

func main() {
	cfg := config.NewConfig()

	db, err := config.InitDBConnection(cfg)
	if err != nil {
		fmt.Println("Failed to connect to the database:", err)
		return
	}
	defer config.CloseDBConnection(db)

	r := gin.New()
	r.Use(gin.Logger())
	r.Use(gin.Recovery())
	ConfigureCORS(r)

	storageManager := storage.NewManager("s3", db)
	bucket, region, cdnDomain := config.GetS3Config()
	basePath := "uploads"
	s3Provider := storage.NewS3Provider(config.S3Client, bucket, region, basePath, cdnDomain)
	storageManager.RegisterProvider("s3", s3Provider)

	// Repositories — DB injected via constructor
	userRepo := repository.NewUserRepository(db)
	postRepo := repository.NewPostRepository(db)
	commentRepo := repository.NewCommentRepository(db)
	replyRepo := repository.NewReplyRepository(db)
	categoryRepo := repository.NewCategoryRepository(db)
	tagRepo := repository.NewTagRepository(db)
	bookmarkRepo := repository.NewBookmarkRepository(db)
	postContentRepo := repository.NewPostContentRepository(db)
	userActivityRepo := repository.NewUserActivityRepository(db)
	imageRepo := repository.NewImageRepository(db)

	baseService := service.NewBaseService(
		db,
		config.GoogleOauthConfig,
		config.S3Client,
		storageManager,
		userRepo, postRepo, commentRepo, replyRepo,
		categoryRepo, tagRepo, bookmarkRepo,
		postContentRepo, userActivityRepo, imageRepo,
	)

	insightService := service.NewInsightService(baseService)
	mainController := controller.NewController(insightService)
	internal.DefineAPIRoutes(r, mainController)

	port := os.Getenv("PORT")
	if port == "" {
		port = "81"
	}

	log.Printf("Server starting on port %s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}

func ConfigureCORS(r *gin.Engine) {
	config := cors.DefaultConfig()
	config.AllowAllOrigins = true
	config.AllowMethods = []string{"GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"}
	config.AllowHeaders = []string{"Origin", "Content-Length", "Content-Type", "Authorization", "X-Requested-With"}
	config.AllowCredentials = true
	r.Use(cors.New(config))
}
