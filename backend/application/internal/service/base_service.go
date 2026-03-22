package service

import (
	"sync"
	"sync/atomic"

	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/pdhoang91/blog/internal/repository"
	"github.com/pdhoang91/blog/pkg/cache"
	"github.com/pdhoang91/blog/pkg/storage"
	uuid "github.com/satori/go.uuid"
	"golang.org/x/oauth2"
	"gorm.io/gorm"
)

type BaseService struct {
	DB *gorm.DB

	Cache             cache.Cache
	GoogleOauthConfig *oauth2.Config
	S3Client          *s3.Client
	StorageManager    *storage.Manager

	UserRepo         repository.UserRepository
	PostRepo         repository.PostRepository
	CommentRepo      repository.CommentRepository
	ReplyRepo        repository.ReplyRepository
	CategoryRepo     repository.CategoryRepository
	TagRepo          repository.TagRepository
	PostContentRepo  repository.PostContentRepository
	UserActivityRepo repository.UserActivityRepository
	ImageRepo        repository.ImageRepository

	viewBuffer sync.Map // map[uuid.UUID]*int64
}

// BufferViewIncrement increments the in-memory view counter for a post.
func (s *BaseService) BufferViewIncrement(postID uuid.UUID) {
	val, _ := s.viewBuffer.LoadOrStore(postID, new(int64))
	atomic.AddInt64(val.(*int64), 1)
}

// FlushViewCounts writes buffered view counts to the database.
func (s *BaseService) FlushViewCounts() {
	s.viewBuffer.Range(func(k, v interface{}) bool {
		postID := k.(uuid.UUID)
		ptr := v.(*int64)
		delta := atomic.SwapInt64(ptr, 0)
		if delta > 0 {
			s.DB.Exec("UPDATE posts SET views = views + ? WHERE id = ?", delta, postID)
		}
		s.viewBuffer.Delete(postID)
		return true
	})
}

func NewBaseService(
	db *gorm.DB,
	appCache cache.Cache,
	googleOauthConfig *oauth2.Config,
	s3Client *s3.Client,
	storageManager *storage.Manager,
	userRepo repository.UserRepository,
	postRepo repository.PostRepository,
	commentRepo repository.CommentRepository,
	replyRepo repository.ReplyRepository,
	categoryRepo repository.CategoryRepository,
	tagRepo repository.TagRepository,
	postContentRepo repository.PostContentRepository,
	userActivityRepo repository.UserActivityRepository,
	imageRepo repository.ImageRepository,
) *BaseService {
	return &BaseService{
		DB:                db,
		Cache:             appCache,
		GoogleOauthConfig: googleOauthConfig,
		S3Client:          s3Client,
		StorageManager:    storageManager,
		UserRepo:          userRepo,
		PostRepo:          postRepo,
		CommentRepo:       commentRepo,
		ReplyRepo:         replyRepo,
		CategoryRepo:      categoryRepo,
		TagRepo:           tagRepo,
		PostContentRepo:   postContentRepo,
		UserActivityRepo:  userActivityRepo,
		ImageRepo:         imageRepo,
	}
}
