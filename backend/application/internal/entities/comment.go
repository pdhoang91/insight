package entities

import (
	"time"

	uuid "github.com/satori/go.uuid"
	"gorm.io/gorm"
)

// Comment represents a comment entity in the domain
type Comment struct {
	ID           uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	PostID       uuid.UUID `json:"post_id" gorm:"type:uuid;not null;index;constraint:OnDelete:CASCADE;"`
	UserID       uuid.UUID `json:"user_id" gorm:"type:uuid;not null;constraint:OnDelete:CASCADE;"`
	Content      string    `json:"content"`
	CreatedAt    time.Time `json:"created_at"`
	ClapCount    uint64    `json:"clap_count" gorm:"-"`
	RepliesCount uint64    `json:"replies_count" gorm:"-"`

	// Relationships
	User    User    `gorm:"foreignKey:UserID" json:"user"`
	Replies []Reply `gorm:"foreignKey:CommentID" json:"replies"`
}

func (Comment) TableName() string {
	return "comments"
}

// ==================== COMMENT REPOSITORY METHODS ====================

// Create creates a new comment in the database
func (c *Comment) Create(db *gorm.DB) error {
	return db.Create(c).Error
}

// Update updates the comment in the database
func (c *Comment) Update(db *gorm.DB) error {
	return db.Save(c).Error
}

// Delete deletes the comment from the database
func (c *Comment) Delete(db *gorm.DB) error {
	return db.Delete(c).Error
}

// FindByID finds a comment by ID with preloaded user
func (*Comment) FindByID(db *gorm.DB, id uuid.UUID) (*Comment, error) {
	var comment Comment
	err := db.Preload("User").Where("id = ?", id).First(&comment).Error
	if err != nil {
		return nil, err
	}
	return &comment, nil
}

// FindByPostID finds comments by post ID with pagination
func (*Comment) FindByPostID(db *gorm.DB, postID uuid.UUID, limit, offset int) ([]*Comment, error) {
	var comments []*Comment
	err := db.Preload("User").Where("post_id = ?", postID).
		Limit(limit).Offset(offset).Find(&comments).Error
	return comments, err
}

// DeleteByID deletes a comment by ID
func (*Comment) DeleteByID(db *gorm.DB, id uuid.UUID) error {
	return db.Delete(&Comment{}, "id = ?", id).Error
}

// CountByPostID counts comments by post ID
func (*Comment) CountByPostID(db *gorm.DB, postID uuid.UUID) (int64, error) {
	var count int64
	err := db.Model(&Comment{}).Where("post_id = ?", postID).Count(&count).Error
	return count, err
}
