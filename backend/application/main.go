package main

import (
	"encoding/gob"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/gin-contrib/cors"

	"github.com/gin-gonic/gin"
	"github.com/pdhoang91/blog/config"
	"github.com/pdhoang91/blog/internal"
	"github.com/pdhoang91/blog/internal/controller"
	"github.com/pdhoang91/blog/internal/dto"
	"github.com/pdhoang91/blog/internal/repository"
	"github.com/pdhoang91/blog/internal/service"
	"github.com/pdhoang91/blog/pkg/cache"
	"github.com/pdhoang91/blog/pkg/storage"
)

func init() {
	// Register all types that may be stored in the Redis cache via gob encoding.
	gob.Register([]*dto.PostResponse{})
	gob.Register(&dto.PostResponse{})
	gob.Register(&dto.HomeResponse{})
	gob.Register([]*repository.ArchiveSummaryItem{})
	gob.Register(int64(0))
	gob.Register("")
}

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
	s3Provider := storage.NewS3Provider(config.S3Client, bucket, region, "uploads", cdnDomain)
	storageManager.RegisterProvider("s3", s3Provider)

	memCache := cache.New()
	var appCache cache.Cache = memCache
	if redisURL := os.Getenv("REDIS_URL"); redisURL != "" {
		redisCache := cache.NewRedisCache(redisURL, "insight")
		if err := redisCache.Ping(); err != nil {
			log.Printf("Redis unavailable (%v) — falling back to in-memory cache", err)
		} else {
			log.Printf("Redis connected at %s — using two-tier cache", redisURL)
			appCache = cache.NewTwoTierCache(memCache, redisCache)
		}
	}

	userRepo := repository.NewUserRepository(db)
	postRepo := repository.NewPostRepository(db)
	commentRepo := repository.NewCommentRepository(db)
	replyRepo := repository.NewReplyRepository(db)
	categoryRepo := repository.NewCategoryRepository(db)
	tagRepo := repository.NewTagRepository(db)
	postContentRepo := repository.NewPostContentRepository(db)
	userActivityRepo := repository.NewUserActivityRepository(db)
	imageRepo := repository.NewImageRepository(db)

	baseService := service.NewBaseService(
		db,
		appCache,
		config.GoogleOauthConfig,
		config.S3Client,
		storageManager,
		userRepo, postRepo, commentRepo, replyRepo,
		categoryRepo, tagRepo,
		postContentRepo, userActivityRepo, imageRepo,
	)

	insightService := service.NewInsightService(baseService)

	go func() {
		ticker := time.NewTicker(5 * time.Minute)
		defer ticker.Stop()
		for range ticker.C {
			insightService.RecalculateEngagementScores()
		}
	}()

	go func() {
		ticker := time.NewTicker(30 * time.Second)
		defer ticker.Stop()
		for range ticker.C {
			insightService.FlushViewCounts()
		}
	}()

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
