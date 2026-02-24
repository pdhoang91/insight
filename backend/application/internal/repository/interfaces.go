package repository

import (
	"github.com/pdhoang91/blog/internal/entities"
	uuid "github.com/satori/go.uuid"
	"gorm.io/gorm"
)

type UserRepository interface {
	Create(db *gorm.DB, user *entities.User) error
	Update(db *gorm.DB, user *entities.User) error
	Delete(db *gorm.DB, id uuid.UUID) error
	FindByID(db *gorm.DB, id uuid.UUID) (*entities.User, error)
	FindByEmail(db *gorm.DB, email string) (*entities.User, error)
	FindByUsername(db *gorm.DB, username string) (*entities.User, error)
	FindByGoogleID(db *gorm.DB, googleID string) (*entities.User, error)
	List(db *gorm.DB, limit, offset int) ([]*entities.User, error)
}

type PostRepository interface {
	Create(db *gorm.DB, post *entities.Post) error
	Update(db *gorm.DB, post *entities.Post) error
	Delete(db *gorm.DB, post *entities.Post) error
	FindByID(db *gorm.DB, id uuid.UUID) (*entities.Post, error)
	FindByTitleName(db *gorm.DB, titleName string) (*entities.Post, error)
	FindByUserID(db *gorm.DB, userID uuid.UUID, limit, offset int) ([]*entities.Post, error)
	FindAll(db *gorm.DB, limit, offset int) ([]*entities.Post, error)
	List(db *gorm.DB, limit, offset int) ([]*entities.Post, error)
	Count(db *gorm.DB) (int64, error)
	Search(db *gorm.DB, query string, limit, offset int) ([]*entities.Post, error)
	GetPopular(db *gorm.DB, limit int) ([]*entities.Post, error)
	FindByCategory(db *gorm.DB, categoryID uuid.UUID, limit, offset int) ([]*entities.Post, error)
	CountByCategory(db *gorm.DB, categoryID uuid.UUID) (int64, error)
	FindByYearMonth(db *gorm.DB, year, month int, limit, offset int) ([]*entities.Post, error)
	CountByYearMonth(db *gorm.DB, year, month int) (int64, error)
	IncrementViews(db *gorm.DB, post *entities.Post) error
	CalculateCounts(db *gorm.DB, post *entities.Post) error
	CalculateCountsForPosts(db *gorm.DB, posts []*entities.Post) error
	AppendCategories(db *gorm.DB, post *entities.Post, categories []entities.Category) error
	ReplaceCategories(db *gorm.DB, post *entities.Post, categories []entities.Category) error
	AppendTags(db *gorm.DB, post *entities.Post, tags []entities.Tag) error
	ReplaceTags(db *gorm.DB, post *entities.Post, tags []entities.Tag) error
	LoadRelationships(db *gorm.DB, post *entities.Post) error
	ExistsByTitleNameExcluding(db *gorm.DB, titleName string, excludeID uuid.UUID) bool
}

type CommentRepository interface {
	Create(db *gorm.DB, comment *entities.Comment) error
	Update(db *gorm.DB, comment *entities.Comment) error
	Delete(db *gorm.DB, comment *entities.Comment) error
	FindByID(db *gorm.DB, id uuid.UUID) (*entities.Comment, error)
	FindByPostID(db *gorm.DB, postID uuid.UUID, limit, offset int) ([]*entities.Comment, error)
	CountByPostID(db *gorm.DB, postID uuid.UUID) (int64, error)
	DeleteByPostID(db *gorm.DB, postID uuid.UUID) error
}

type ReplyRepository interface {
	Create(db *gorm.DB, reply *entities.Reply) error
	Update(db *gorm.DB, reply *entities.Reply) error
	Delete(db *gorm.DB, reply *entities.Reply) error
	FindByID(db *gorm.DB, id uuid.UUID) (*entities.Reply, error)
	FindByCommentID(db *gorm.DB, commentID uuid.UUID, limit, offset int) ([]*entities.Reply, error)
	CountByCommentID(db *gorm.DB, commentID uuid.UUID) (int64, error)
	CountByPostID(db *gorm.DB, postID uuid.UUID) (int64, error)
	DeleteByCommentID(db *gorm.DB, commentID uuid.UUID) error
	DeleteByPostID(db *gorm.DB, postID uuid.UUID) error
}

// CategoryPostCount holds a category with its associated post count.
type CategoryPostCount struct {
	Category  *entities.Category
	PostCount int64
}

type CategoryRepository interface {
	Create(db *gorm.DB, category *entities.Category) error
	Update(db *gorm.DB, category *entities.Category) error
	Delete(db *gorm.DB, id uuid.UUID) error
	FindByID(db *gorm.DB, id uuid.UUID) (*entities.Category, error)
	FindByName(db *gorm.DB, name string) (*entities.Category, error)
	FindAll(db *gorm.DB, limit, offset int) ([]*entities.Category, error)
	Count(db *gorm.DB) (int64, error)
	FindByNames(db *gorm.DB, names []string, limit, offset int) ([]*entities.Category, error)
	CountByNames(db *gorm.DB, names []string) (int64, error)
	FindPopularByPostCount(db *gorm.DB, limit, offset int) ([]CategoryPostCount, int64, error)
	CountPostsByCategory(db *gorm.DB, categoryID uuid.UUID) (int64, error)
}

type TagRepository interface {
	Create(db *gorm.DB, tag *entities.Tag) error
	Update(db *gorm.DB, tag *entities.Tag) error
	Delete(db *gorm.DB, id uuid.UUID) error
	FindByID(db *gorm.DB, id uuid.UUID) (*entities.Tag, error)
	FindByName(db *gorm.DB, name string) (*entities.Tag, error)
	List(db *gorm.DB, limit, offset int) ([]*entities.Tag, error)
	GetPopular(db *gorm.DB, limit int) ([]*entities.Tag, error)
	Search(db *gorm.DB, query string, limit int) ([]*entities.Tag, error)
	Count(db *gorm.DB) (int64, error)
}

type BookmarkRepository interface {
	Create(db *gorm.DB, bookmark *entities.Bookmark) error
	Delete(db *gorm.DB, bookmark *entities.Bookmark) error
	FindByUserAndPost(db *gorm.DB, userID, postID uuid.UUID) (*entities.Bookmark, error)
	FindByIDWithPost(db *gorm.DB, id uuid.UUID) (*entities.Bookmark, error)
	FindByUserID(db *gorm.DB, userID uuid.UUID, limit, offset int) ([]*entities.Bookmark, error)
	CheckIsBookmarked(db *gorm.DB, userID, postID uuid.UUID) (bool, error)
	CountByUser(db *gorm.DB, userID uuid.UUID) (int64, error)
	Save(db *gorm.DB, bookmark *entities.Bookmark) error
}

type PostContentRepository interface {
	Create(db *gorm.DB, pc *entities.PostContent) error
	Update(db *gorm.DB, pc *entities.PostContent) error
	FindByPostID(db *gorm.DB, postID uuid.UUID) (*entities.PostContent, error)
	DeleteByPostID(db *gorm.DB, postID uuid.UUID) error
}

type UserActivityRepository interface {
	Create(db *gorm.DB, activity *entities.UserActivity) error
	FindByUserAndPost(db *gorm.DB, userID, postID uuid.UUID, actionType string) (*entities.UserActivity, error)
	FindByUserAndComment(db *gorm.DB, userID, commentID uuid.UUID, actionType string) (*entities.UserActivity, error)
	FindByUserAndReply(db *gorm.DB, userID, replyID uuid.UUID, actionType string) (*entities.UserActivity, error)
	IncrementCount(db *gorm.DB, activity *entities.UserActivity) error
	GetClapCount(db *gorm.DB, itemType string, itemID uuid.UUID) (int64, error)
	HasUserClapped(db *gorm.DB, userID uuid.UUID, itemType string, itemID uuid.UUID) (bool, error)
	CalculateCommentsAndRepliesCounts(db *gorm.DB, comments []*entities.Comment) error
}

type ImageRepository interface {
	FindByID(db *gorm.DB, id uuid.UUID) (*entities.Image, error)
	FindByUserID(db *gorm.DB, userID uuid.UUID, imageType string, limit, offset int) ([]entities.Image, int64, error)
	CreateReference(db *gorm.DB, ref *entities.ImageReference) error
	FindReferencesByPostID(db *gorm.DB, postID uuid.UUID) ([]entities.ImageReference, error)
	FindReference(db *gorm.DB, imageID, postID uuid.UUID, refType string) (*entities.ImageReference, error)
}
