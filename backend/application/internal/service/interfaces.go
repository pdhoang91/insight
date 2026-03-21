package service

import (
	"context"
	"mime/multipart"

	"github.com/pdhoang91/blog/internal/dto"
	"github.com/pdhoang91/blog/internal/entities"
	"github.com/pdhoang91/blog/internal/repository"
	"github.com/pdhoang91/blog/pkg/httpclient"
	"github.com/pdhoang91/blog/pkg/storage"
	uuid "github.com/satori/go.uuid"
)

// --- Domain-specific service interfaces (ISP-compliant) ---

type AuthService interface {
	Register(req *dto.CreateUserRequest) (*dto.LoginResponse, error)
	Login(req *dto.LoginRequest) (*dto.LoginResponse, error)
	GoogleLogin() (string, error)
	GoogleCallback(code string) (*dto.LoginResponse, error)
	Logout() error
	RefreshToken() error
}

type UserService interface {
	GetUser(id uuid.UUID) (*dto.UserResponse, error)
	GetUserByID(id uuid.UUID) (*entities.User, error)
	GetUserByUsername(username string) (*entities.User, error)
	GetProfile(userID uuid.UUID) (*dto.UserResponse, error)
	UpdateProfile(userID uuid.UUID, req *dto.UpdateUserRequest) (*dto.UserResponse, error)
	UpdateProfileWithAvatar(ctx context.Context, userID uuid.UUID, req *dto.UpdateUserRequest, avatarFile *multipart.FileHeader) (*dto.UserResponse, error)
	DeleteProfile(userID uuid.UUID) error
}

type PostService interface {
	CreatePost(userID uuid.UUID, req *dto.CreatePostRequest) (*dto.PostResponse, error)
	GetPost(id uuid.UUID) (*dto.PostResponse, error)
	GetPostEntity(id uuid.UUID) (*entities.Post, error)
	GetPostBySlug(slug string) (*dto.PostResponse, error)
	UpdatePost(userID uuid.UUID, id uuid.UUID, req *dto.UpdatePostRequest) (*dto.PostResponse, error)
	DeletePost(userID uuid.UUID, id uuid.UUID) error
	ListPosts(req *dto.PaginationRequest) ([]*dto.PostResponse, int64, error)
	GetUserPosts(userID uuid.UUID, req *dto.PaginationRequest) ([]*dto.PostResponse, int64, error)
	GetLatestPosts(limit int) ([]*dto.PostResponse, error)
	GetPopularPosts(limit int) ([]*dto.PostResponse, error)
	GetPostsByYearMonth(year, month int, req *dto.PaginationRequest) ([]*dto.PostResponse, int64, error)
	GetPostsByCategory(categoryName string, req *dto.PaginationRequest) ([]*dto.PostResponse, int64, error)
	GetPostsByTag(tagName string, req *dto.PaginationRequest) ([]*dto.PostResponse, int64, error)
	GetHomeData() (*dto.HomeResponse, error)
	GetArchiveSummary() ([]*repository.ArchiveSummaryItem, error)
}

type CommentService interface {
	GetPostComments(postID uuid.UUID, req *dto.PaginationRequest) ([]*dto.CommentResponse, int64, int64, error)
	CreateComment(userID uuid.UUID, req *dto.CreateCommentRequest) (*dto.CommentResponse, error)
	UpdateComment(userID uuid.UUID, commentID uuid.UUID, req *dto.UpdateCommentRequest) (*dto.CommentResponse, error)
	DeleteComment(userID uuid.UUID, commentID uuid.UUID) error
	CreateReply(userID uuid.UUID, req *dto.CreateReplyRequest) (*dto.ReplyResponse, error)
	DeleteReply(userID uuid.UUID, replyID uuid.UUID) error
	GetCommentReplies(commentID uuid.UUID, req *dto.PaginationRequest) ([]*dto.ReplyResponse, int64, error)
	GetPostIDFromComment(commentID uuid.UUID) (*uuid.UUID, error)
}

type EngagementService interface {
	ClapPost(userID, postID uuid.UUID) (bool, error)
	ClapComment(userID, commentID uuid.UUID) (bool, error)
	ClapReply(userID, replyID uuid.UUID) (bool, error)
	GetClapsCount(itemType string, itemID uuid.UUID) (int64, error)
	HasUserClappedPost(userID, postID uuid.UUID) (bool, error)
	HasUserClapped(userID uuid.UUID, itemType string, itemID uuid.UUID) (bool, error)
}

type BookmarkService interface {
	CreateBookmark(userID uuid.UUID, req *dto.CreateBookmarkRequest) (*dto.BookmarkResponse, error)
	Unbookmark(userID uuid.UUID, req *dto.CreateBookmarkRequest) error
	GetUserBookmarks(userID uuid.UUID, req *dto.PaginationRequest) ([]*dto.PostResponse, string, int64, error)
	CheckBookmarkStatus(userID uuid.UUID, postID uuid.UUID) (bool, error)
}

type CategoryService interface {
	ListCategories(req *dto.PaginationRequest) ([]*dto.CategoryResponse, int64, error)
	GetCategory(id uuid.UUID) (*dto.CategoryResponse, error)
	CreateCategory(req *dto.CreateCategoryRequest) (*dto.CategoryResponse, error)
	UpdateCategory(id uuid.UUID, req *dto.UpdateCategoryRequest) (*dto.CategoryResponse, error)
	DeleteCategory(id uuid.UUID) error
	GetTopCategories(req *dto.PaginationRequest) ([]*dto.CategoryResponse, int64, error)
	GetPopularCategories(req *dto.PaginationRequest) ([]dto.CategoryWithCount, int64, error)
}

type TagService interface {
	ListTags(req *dto.PaginationRequest) ([]*dto.TagResponse, int64, error)
	CreateTag(req *dto.CreateTagRequest) (*dto.TagResponse, error)
	UpdateTag(id uuid.UUID, req *dto.UpdateTagRequest) (*dto.TagResponse, error)
	DeleteTag(id uuid.UUID) error
	GetPopularTags(limit int) ([]*dto.TagResponse, error)
}

type ImageService interface {
	UploadImageV2(ctx context.Context, file *multipart.FileHeader, userID uuid.UUID, imageType string) (*storage.UploadResponse, error)
	GetImageByID(ctx context.Context, imageID string) (*entities.Image, error)
	DeleteImageV2(ctx context.Context, imageID string, userID uuid.UUID) error
	ListUserImages(ctx context.Context, userID uuid.UUID, imageType string, page, limit int) ([]entities.Image, int64, error)
	GetImageURL(imageID string) string
	GetImageRedirectURL(ctx context.Context, imageID string) (string, error)
}

type SearchService interface {
	GetSearchClient() *httpclient.SearchClient
}

// Service is the composite interface embedding all domain interfaces.
// Kept for backward compatibility during migration.
type Service interface {
	AuthService
	UserService
	PostService
	CommentService
	EngagementService
	BookmarkService
	CategoryService
	TagService
	ImageService
	SearchService
}

// compile-time check: InsightService implements Service
var _ Service = (*InsightService)(nil)
