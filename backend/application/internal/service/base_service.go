package service

import (
	"github.com/aws/aws-sdk-go-v2/service/s3"
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

	// External clients (to be added later)
	// HttpClient      http.IHttpClient
	// Logger          logger.ILogger
	// TokenMaker      token.IMaker
	// EventProcessor  event.IEventProcessor
}

// NewBaseService creates a new base service with all dependencies
func NewBaseService(
	db *gorm.DB,
	googleOauthConfig *oauth2.Config,
	s3Client *s3.Client,
	storageManager *storage.Manager,
) *BaseService {
	return &BaseService{
		DB:                db,
		DBR:               db, // For now, use same connection
		DBR2:              db, // For now, use same connection
		GoogleOauthConfig: googleOauthConfig,
		S3Client:          s3Client,
		StorageManager:    storageManager,
	}
}
