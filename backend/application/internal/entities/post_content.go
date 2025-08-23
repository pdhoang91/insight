package entities

import (
	"time"

	uuid "github.com/satori/go.uuid"
	"gorm.io/gorm"
)

// PostContent represents the content of a post entity in the domain
type PostContent struct {
	ID        uuid.UUID      `gorm:"type:uuid;primaryKey" json:"id"`
	PostID    uuid.UUID      `json:"post_id"`
	Content   string         `json:"content"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"` // Soft delete field
}

func (PostContent) TableName() string {
	return "post_contents"
}

// ==================== POST CONTENT REPOSITORY METHODS ====================

// Create creates a new post content in the database
func (pc *PostContent) Create(db *gorm.DB) error {
	if pc.ID == uuid.Nil {
		pc.ID = uuid.NewV4()
	}
	return db.Create(pc).Error
}

// Update updates the post content in the database
func (pc *PostContent) Update(db *gorm.DB) error {
	return db.Save(pc).Error
}

// FindByPostID finds post content by post ID
func (*PostContent) FindByPostID(db *gorm.DB, postID uuid.UUID) (*PostContent, error) {
	var postContent PostContent
	err := db.Where("post_id = ?", postID).First(&postContent).Error
	return &postContent, err
}

// DeleteByPostID deletes post content by post ID
func (*PostContent) DeleteByPostID(db *gorm.DB, postID uuid.UUID) error {
	return db.Where("post_id = ?", postID).Delete(&PostContent{}).Error
}
