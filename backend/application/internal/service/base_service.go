package service

import (
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/pdhoang91/blog/internal/repository"
	"github.com/pdhoang91/blog/pkg/storage"
	"golang.org/x/oauth2"
	"gorm.io/gorm"
)

// BaseService contains common dependencies for all services
type BaseService struct {
	// Database connections
	DB   *gorm.DB // Main database connection
	DBR  *gorm.DB // Read replica for production sensitive queries
	DBR2 *gorm.DB // Read replica for general queries

	// OAuth and External Services
	GoogleOauthConfig *oauth2.Config
	S3Client          *s3.Client
	StorageManager    *storage.Manager

	// Repositories
	UserRepo         repository.UserRepository
	PostRepo         repository.PostRepository
	CommentRepo      repository.CommentRepository
	ReplyRepo        repository.ReplyRepository
	CategoryRepo     repository.CategoryRepository
	TagRepo          repository.TagRepository
	BookmarkRepo     repository.BookmarkRepository
	PostContentRepo  repository.PostContentRepository
	UserActivityRepo repository.UserActivityRepository
	ImageRepo        repository.ImageRepository
}

// NewBaseService creates a new base service with all dependencies
func NewBaseService(
	db *gorm.DB,
	googleOauthConfig *oauth2.Config,
	s3Client *s3.Client,
	storageManager *storage.Manager,
	userRepo repository.UserRepository,
	postRepo repository.PostRepository,
	commentRepo repository.CommentRepository,
	replyRepo repository.ReplyRepository,
	categoryRepo repository.CategoryRepository,
	tagRepo repository.TagRepository,
	bookmarkRepo repository.BookmarkRepository,
	postContentRepo repository.PostContentRepository,
	userActivityRepo repository.UserActivityRepository,
	imageRepo repository.ImageRepository,
) *BaseService {
	return &BaseService{
		DB:                db,
		DBR:               db, // For now, use same connection
		DBR2:              db, // For now, use same connection
		GoogleOauthConfig: googleOauthConfig,
		S3Client:          s3Client,
		StorageManager:    storageManager,
		UserRepo:          userRepo,
		PostRepo:          postRepo,
		CommentRepo:       commentRepo,
		ReplyRepo:         replyRepo,
		CategoryRepo:      categoryRepo,
		TagRepo:           tagRepo,
		BookmarkRepo:      bookmarkRepo,
		PostContentRepo:   postContentRepo,
		UserActivityRepo:  userActivityRepo,
		ImageRepo:         imageRepo,
	}
}
