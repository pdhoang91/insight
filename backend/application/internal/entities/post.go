package entities

import (
	"time"

	uuid "github.com/satori/go.uuid"
	"gorm.io/gorm"
)

// Post represents a blog post entity in the domain
type Post struct {
	ID             uuid.UUID      `gorm:"type:uuid;primaryKey" json:"id"`
	Title          string         `json:"title"`
	ImageTitle     string         `json:"image_title"`
	TitleName      string         `json:"title_name"`
	PreviewContent string         `json:"preview_content"`
	UserID         uuid.UUID      `json:"user_id"`
	CreatedAt      time.Time      `json:"created_at"`
	UpdatedAt      time.Time      `json:"updated_at"`
	DeletedAt      gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"` // Soft delete field
	Views          uint64         `json:"views"`
	Content        string         `gorm:"-" json:"content"`
	ClapCount      uint64         `gorm:"-" json:"clap_count"`
	CommentsCount  uint64         `gorm:"-" json:"comments_count"`
	AverageRating  float64        `gorm:"-" json:"average_rating"`

	// Relationships
	User        User        `gorm:"foreignKey:UserID" json:"user"`
	Comments    []Comment   `gorm:"foreignKey:PostID" json:"comments"`
	Categories  []Category  `gorm:"many2many:post_categories" json:"categories"`
	Tags        []Tag       `gorm:"many2many:post_tags" json:"tags"`
	PostContent PostContent `gorm:"foreignKey:PostID" json:"post_content"`
}

func (Post) TableName() string {
	return "posts"
}

// PostCategory represents the many-to-many relationship between posts and categories
type PostCategory struct {
	PostID     uuid.UUID `gorm:"type:uuid;primaryKey"`
	CategoryID uuid.UUID `gorm:"type:uuid;primaryKey"`
}

func (PostCategory) TableName() string {
	return "post_categories"
}

// PostTag represents the many-to-many relationship between posts and tags
type PostTag struct {
	PostID uuid.UUID `gorm:"type:uuid;primaryKey"`
	TagID  uuid.UUID `gorm:"type:uuid;primaryKey"`
}

func (PostTag) TableName() string {
	return "post_tags"
}

// ==================== POST REPOSITORY METHODS ====================

// Create creates a new post in the database
func (p *Post) Create(db *gorm.DB) error {
	return db.Create(p).Error
}

// Update updates the post in the database
func (p *Post) Update(db *gorm.DB) error {
	return db.Save(p).Error
}

// Delete deletes the post from the database
func (p *Post) Delete(db *gorm.DB) error {
	return db.Delete(p).Error
}

// FindByID finds a post by ID with preloaded relationships
func (*Post) FindByID(db *gorm.DB, id uuid.UUID) (*Post, error) {
	var post Post
	err := db.Preload("User").Preload("Categories").Preload("Tags").Where("id = ?", id).First(&post).Error
	if err != nil {
		return nil, err
	}
	return &post, nil
}

// FindByTitleName finds a post by title name
func (*Post) FindByTitleName(db *gorm.DB, titleName string) (*Post, error) {
	var post Post
	err := db.Where("title_name = ?", titleName).First(&post).Error
	if err != nil {
		return nil, err
	}
	return &post, nil
}

// FindByUserID finds posts by user ID with pagination
func (*Post) FindByUserID(db *gorm.DB, userID uuid.UUID, limit, offset int) ([]*Post, error) {
	var posts []*Post
	err := db.Preload("User").Preload("Categories").Preload("Tags").
		Where("user_id = ?", userID).
		Limit(limit).Offset(offset).
		Find(&posts).Error
	return posts, err
}

// DeleteByID deletes a post by ID
func (*Post) DeleteByID(db *gorm.DB, id uuid.UUID) error {
	return db.Delete(&Post{}, "id = ?", id).Error
}

// FindAll finds all posts with pagination
func (*Post) FindAll(db *gorm.DB, limit, offset int) ([]*Post, error) {
	var posts []*Post
	err := db.Preload("User").Preload("Categories").Preload("Tags").
		Order("created_at DESC").
		Limit(limit).Offset(offset).
		Find(&posts).Error
	return posts, err
}

// Count returns total number of posts
func (*Post) Count(db *gorm.DB) (int64, error) {
	var count int64
	err := db.Model(&Post{}).Count(&count).Error
	return count, err
}

// List retrieves posts with pagination and preloaded relationships
func (*Post) List(db *gorm.DB, limit, offset int) ([]*Post, error) {
	var posts []*Post
	err := db.Preload("User").Preload("Categories").Preload("Tags").
		Limit(limit).Offset(offset).
		Find(&posts).Error
	return posts, err
}

// Search searches posts by title or content
func (*Post) Search(db *gorm.DB, query string, limit, offset int) ([]*Post, error) {
	var posts []*Post
	err := db.Preload("User").Preload("Categories").Preload("Tags").
		Where("title ILIKE ? OR preview_content ILIKE ?", "%"+query+"%", "%"+query+"%").
		Limit(limit).Offset(offset).
		Find(&posts).Error
	return posts, err
}

// IncrementViews increments the view count for a post
func (p *Post) IncrementViews(db *gorm.DB) error {
	return db.Model(p).Update("views", gorm.Expr("views + ?", 1)).Error
}

// GetPopular retrieves popular posts based on views and comments
func (*Post) GetPopular(db *gorm.DB, limit int) ([]*Post, error) {
	var posts []*Post
	// Use subquery to calculate comments count and order by views + comments
	err := db.Preload("User").Preload("Categories").Preload("Tags").
		Select("posts.*, COALESCE((SELECT COUNT(*) FROM comments WHERE comments.post_id = posts.id), 0) as comments_count").
		Order("(posts.views * 0.7 + COALESCE((SELECT COUNT(*) FROM comments WHERE comments.post_id = posts.id), 0) * 0.3) DESC").
		Limit(limit).
		Find(&posts).Error
	return posts, err
}

// FindByCategory finds posts by category ID
func (*Post) FindByCategory(db *gorm.DB, categoryID uuid.UUID, limit, offset int) ([]*Post, error) {
	var posts []*Post
	err := db.Preload("User").Preload("Categories").Preload("Tags").
		Joins("JOIN post_categories ON posts.id = post_categories.post_id").
		Where("post_categories.category_id = ?", categoryID).
		Order("posts.created_at DESC").
		Limit(limit).Offset(offset).
		Find(&posts).Error
	return posts, err
}

// CountByCategory counts posts by category ID
func (*Post) CountByCategory(db *gorm.DB, categoryID uuid.UUID) (int64, error) {
	var count int64
	err := db.Model(&Post{}).
		Joins("JOIN post_categories ON posts.id = post_categories.post_id").
		Where("post_categories.category_id = ?", categoryID).
		Count(&count).Error
	return count, err
}

// CalculateCounts calculates and sets clap_count and comments_count for the post
func (p *Post) CalculateCounts(db *gorm.DB) error {
	// Calculate clap count using SUM(count)
	var clapCount int64
	if err := db.Model(&UserActivity{}).
		Where("post_id = ? AND action_type = ?", p.ID, "clap_post").
		Select("COALESCE(SUM(count), 0)").Row().Scan(&clapCount); err != nil {
		return err
	}
	p.ClapCount = uint64(clapCount)

	// Calculate comments count
	var commentCount int64
	if err := db.Model(&Comment{}).
		Where("post_id = ?", p.ID).
		Count(&commentCount).Error; err != nil {
		return err
	}
	p.CommentsCount = uint64(commentCount)

	return nil
}

// CalculateCountsForPosts calculates counts for multiple posts efficiently
func CalculateCountsForPosts(db *gorm.DB, posts []*Post) error {
	if len(posts) == 0 {
		return nil
	}

	// Extract post IDs
	postIDs := make([]uuid.UUID, len(posts))
	for i, post := range posts {
		postIDs[i] = post.ID
	}

	// Bulk query for clap counts using SUM(count)
	type ClapCountResult struct {
		PostID    uuid.UUID `json:"post_id"`
		ClapCount int64     `json:"clap_count"`
	}
	var clapCounts []ClapCountResult
	if err := db.Model(&UserActivity{}).
		Select("post_id, COALESCE(SUM(count), 0) as clap_count").
		Where("post_id IN ? AND action_type = ?", postIDs, "clap_post").
		Group("post_id").
		Scan(&clapCounts).Error; err != nil {
		return err
	}

	// Bulk query for comment counts
	type CommentCountResult struct {
		PostID       uuid.UUID `json:"post_id"`
		CommentCount int64     `json:"comment_count"`
	}
	var commentCounts []CommentCountResult
	if err := db.Model(&Comment{}).
		Select("post_id, COUNT(*) as comment_count").
		Where("post_id IN ?", postIDs).
		Group("post_id").
		Scan(&commentCounts).Error; err != nil {
		return err
	}

	// Create maps for quick lookup
	clapCountMap := make(map[uuid.UUID]int64)
	for _, result := range clapCounts {
		clapCountMap[result.PostID] = result.ClapCount
	}

	commentCountMap := make(map[uuid.UUID]int64)
	for _, result := range commentCounts {
		commentCountMap[result.PostID] = result.CommentCount
	}

	// Assign counts to posts
	for _, post := range posts {
		post.ClapCount = uint64(clapCountMap[post.ID])
		post.CommentsCount = uint64(commentCountMap[post.ID])
	}

	return nil
}
