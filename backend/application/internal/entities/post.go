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
