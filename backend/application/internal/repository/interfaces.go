package repository

import (
	"github.com/pdhoang91/blog/internal/entities"
	uuid "github.com/satori/go.uuid"
	"gorm.io/gorm"
)

type UserRepository interface {
	Create(user *entities.User) error
	Update(user *entities.User) error
	Delete(id uuid.UUID) error
	FindByID(id uuid.UUID) (*entities.User, error)
	FindByEmail(email string) (*entities.User, error)
	FindByUsername(username string) (*entities.User, error)
	FindByGoogleID(googleID string) (*entities.User, error)
	List(limit, offset int) ([]*entities.User, error)
}

// ArchiveSummaryItem represents one month-bucket in the archive sidebar.
type ArchiveSummaryItem struct {
	Year  int   `json:"year"`
	Month int   `json:"month"`
	Count int64 `json:"count"`
}

type PostRepository interface {
	Create(post *entities.Post) error
	Update(post *entities.Post) error
	Delete(post *entities.Post) error
	FindByID(id uuid.UUID) (*entities.Post, error)
	FindBySlug(slug string) (*entities.Post, error)
	FindByUserID(userID uuid.UUID, limit, offset int) ([]*entities.Post, error)
	FindAll(limit, offset int) ([]*entities.Post, error)
	List(limit, offset int) ([]*entities.Post, error)
	Count() (int64, error)
	Search(query string, limit, offset int) ([]*entities.Post, error)
	GetPopular(limit int) ([]*entities.Post, error)
	FindByCategory(categoryID uuid.UUID, limit, offset int) ([]*entities.Post, error)
	CountByCategory(categoryID uuid.UUID) (int64, error)
	FindByTag(tagID uuid.UUID, limit, offset int) ([]*entities.Post, error)
	CountByTag(tagID uuid.UUID) (int64, error)
	FindByYearMonth(year, month int, limit, offset int) ([]*entities.Post, error)
	CountByYearMonth(year, month int) (int64, error)
	GetArchiveSummary() ([]*ArchiveSummaryItem, error)
	IncrementViews(post *entities.Post) error
	CalculateCounts(post *entities.Post) error
	CalculateCountsForPosts(posts []*entities.Post) error
	AppendCategories(post *entities.Post, categories []entities.Category) error
	ReplaceCategories(post *entities.Post, categories []entities.Category) error
	AppendTags(post *entities.Post, tags []entities.Tag) error
	ReplaceTags(post *entities.Post, tags []entities.Tag) error
	LoadRelationships(post *entities.Post) error
	ExistsBySlugExcluding(slug string, excludeID uuid.UUID) bool
	RecalculateAllEngagementScores() error
	WithTx(tx *gorm.DB) PostRepository
}

type CommentRepository interface {
	Create(comment *entities.Comment) error
	Update(comment *entities.Comment) error
	Delete(comment *entities.Comment) error
	FindByID(id uuid.UUID) (*entities.Comment, error)
	FindByPostID(postID uuid.UUID, limit, offset int) ([]*entities.Comment, error)
	CountByPostID(postID uuid.UUID) (int64, error)
	DeleteByPostID(postID uuid.UUID) error
}

type ReplyRepository interface {
	Create(reply *entities.Reply) error
	Update(reply *entities.Reply) error
	Delete(reply *entities.Reply) error
	FindByID(id uuid.UUID) (*entities.Reply, error)
	FindByCommentID(commentID uuid.UUID, limit, offset int) ([]*entities.Reply, error)
	CountByCommentID(commentID uuid.UUID) (int64, error)
	CountByPostID(postID uuid.UUID) (int64, error)
	DeleteByCommentID(commentID uuid.UUID) error
	DeleteByPostID(postID uuid.UUID) error
}

type CategoryPostCount struct {
	Category  *entities.Category
	PostCount int64
}

type CategoryRepository interface {
	Create(category *entities.Category) error
	Update(category *entities.Category) error
	Delete(id uuid.UUID) error
	FindByID(id uuid.UUID) (*entities.Category, error)
	FindByName(name string) (*entities.Category, error)
	FindAll(limit, offset int) ([]*entities.Category, error)
	Count() (int64, error)
	FindByNames(names []string, limit, offset int) ([]*entities.Category, error)
	CountByNames(names []string) (int64, error)
	FindPopularByPostCount(limit, offset int) ([]CategoryPostCount, int64, error)
	CountPostsByCategory(categoryID uuid.UUID) (int64, error)
	WithTx(tx *gorm.DB) CategoryRepository
}

type TagRepository interface {
	Create(tag *entities.Tag) error
	Update(tag *entities.Tag) error
	Delete(id uuid.UUID) error
	FindByID(id uuid.UUID) (*entities.Tag, error)
	FindByName(name string) (*entities.Tag, error)
	List(limit, offset int) ([]*entities.Tag, error)
	GetPopular(limit int) ([]*entities.Tag, error)
	Search(query string, limit int) ([]*entities.Tag, error)
	Count() (int64, error)
	CountPostsByTag(tagID uuid.UUID) (int64, error)
	WithTx(tx *gorm.DB) TagRepository
}

type BookmarkRepository interface {
	Create(bookmark *entities.Bookmark) error
	Delete(bookmark *entities.Bookmark) error
	FindByUserAndPost(userID, postID uuid.UUID) (*entities.Bookmark, error)
	FindByIDWithPost(id uuid.UUID) (*entities.Bookmark, error)
	FindByUserID(userID uuid.UUID, limit, offset int) ([]*entities.Bookmark, error)
	CheckIsBookmarked(userID, postID uuid.UUID) (bool, error)
	CountByUser(userID uuid.UUID) (int64, error)
	Save(bookmark *entities.Bookmark) error
}

type PostContentRepository interface {
	Create(pc *entities.PostContent) error
	Update(pc *entities.PostContent) error
	FindByPostID(postID uuid.UUID) (*entities.PostContent, error)
	DeleteByPostID(postID uuid.UUID) error
	// WithTx returns a new repository instance that uses the given transaction.
	WithTx(tx *gorm.DB) PostContentRepository
}

type UserActivityRepository interface {
	Create(activity *entities.UserActivity) error
	FindByUserAndPost(userID, postID uuid.UUID, actionType string) (*entities.UserActivity, error)
	FindByUserAndComment(userID, commentID uuid.UUID, actionType string) (*entities.UserActivity, error)
	FindByUserAndReply(userID, replyID uuid.UUID, actionType string) (*entities.UserActivity, error)
	IncrementCount(activity *entities.UserActivity) error
	GetClapCount(itemType string, itemID uuid.UUID) (int64, error)
	HasUserClapped(userID uuid.UUID, itemType string, itemID uuid.UUID) (bool, error)
	CalculateCommentsAndRepliesCounts(comments []*entities.Comment) error
}

type ImageRepository interface {
	FindByID(id uuid.UUID) (*entities.Image, error)
	FindByUserID(userID uuid.UUID, imageType string, limit, offset int) ([]entities.Image, int64, error)
	CreateReference(ref *entities.ImageReference) error
	FindReferencesByPostID(postID uuid.UUID) ([]entities.ImageReference, error)
	FindReference(imageID, postID uuid.UUID, refType string) (*entities.ImageReference, error)
}
