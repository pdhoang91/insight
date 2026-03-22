package entities

import (
	"time"

	uuid "github.com/satori/go.uuid"
	"gorm.io/gorm"
)

// Comment represents a comment entity in the domain
type Comment struct {
	ID           uuid.UUID      `gorm:"type:uuid;primaryKey" json:"id"`
	PostID       uuid.UUID      `json:"post_id" gorm:"type:uuid;not null;index;constraint:OnDelete:CASCADE;"`
	UserID       uuid.UUID      `json:"user_id" gorm:"type:uuid;not null;constraint:OnDelete:CASCADE;"`
	Content      string         `json:"content"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"` // Soft delete field
	RepliesCount uint64         `json:"replies_count" gorm:"-"`

	// Relationships
	User    User    `gorm:"foreignKey:UserID" json:"user"`
	Replies []Reply `gorm:"foreignKey:CommentID" json:"replies"`
}

func (Comment) TableName() string {
	return "comments"
}
