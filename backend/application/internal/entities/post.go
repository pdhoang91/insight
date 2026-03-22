package entities

import (
	"encoding/json"
	"time"

	uuid "github.com/satori/go.uuid"
	"gorm.io/gorm"
)

// Post represents a blog post entity in the domain
type Post struct {
	ID              uuid.UUID       `gorm:"type:uuid;primaryKey" json:"id"`
	Title           string          `json:"title"`
	Slug            string          `json:"slug"`
	Excerpt         string          `json:"excerpt"`
	CoverImage      string          `json:"cover_image"`
	UserID          uuid.UUID       `json:"user_id"`
	CreatedAt       time.Time       `json:"created_at"`
	UpdatedAt       time.Time       `json:"updated_at"`
	DeletedAt       gorm.DeletedAt  `gorm:"index" json:"deleted_at,omitempty"` // Soft delete field
	Views           uint64          `json:"views"`
	EngagementScore float64         `gorm:"default:0" json:"-"`
	Content         json.RawMessage `gorm:"-" json:"content,omitempty"`
	ClapCount     uint64 `gorm:"column:clap_count;default:0" json:"clap_count"`
	CommentsCount uint64 `gorm:"column:comment_count;default:0" json:"comments_count"`

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
