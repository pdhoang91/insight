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
	db *gorm.DB

	cache             cache.Cache
	googleOauthConfig *oauth2.Config
	s3Client          *s3.Client
	storageManager    *storage.Manager

	userRepo        repository.UserRepository
	postRepo        repository.PostRepository
	commentRepo     repository.CommentRepository
	replyRepo       repository.ReplyRepository
	categoryRepo    repository.CategoryRepository
	tagRepo         repository.TagRepository
	postContentRepo repository.PostContentRepository
	imageRepo       repository.ImageRepository

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
			s.db.Exec("UPDATE posts SET views = views + ? WHERE id = ?", delta, postID)
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
	imageRepo repository.ImageRepository,
) *BaseService {
	return &BaseService{
		db:                db,
		cache:             appCache,
		googleOauthConfig: googleOauthConfig,
		s3Client:          s3Client,
		storageManager:    storageManager,
		userRepo:          userRepo,
		postRepo:          postRepo,
		commentRepo:       commentRepo,
		replyRepo:         replyRepo,
		categoryRepo:      categoryRepo,
		tagRepo:           tagRepo,
		postContentRepo:   postContentRepo,
		imageRepo:         imageRepo,
	}
}

// withTx executes fn within a database transaction.
// It automatically rolls back on error or panic, and commits on success.
func withTx(db *gorm.DB, fn func(tx *gorm.DB) error) error {
	tx := db.Begin()
	if tx.Error != nil {
		return tx.Error
	}
	defer tx.Rollback() //nolint:errcheck // no-op after commit
	if err := fn(tx); err != nil {
		return err
	}
	return tx.Commit().Error
}
