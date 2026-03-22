package entities

import (
	"time"

	uuid "github.com/satori/go.uuid"
	"gorm.io/gorm"
)

// Reply represents a reply entity in the domain
type Reply struct {
	ID         uuid.UUID      `gorm:"type:uuid;primaryKey" json:"id"`
	CommentID  uuid.UUID      `json:"comment_id"`
	PostID     uuid.UUID      `json:"post_id" gorm:"type:uuid;not null;index;constraint:OnDelete:CASCADE;"`
	UserID     uuid.UUID      `json:"user_id" gorm:"type:uuid;not null;constraint:OnDelete:CASCADE;"`
	Content   string         `json:"content"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt  time.Time      `json:"updated_at"`
	DeletedAt  gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"` // Soft delete field
	// Relationships
	User User `gorm:"foreignKey:UserID" json:"user"`
}

func (Reply) TableName() string {
	return "replies"
}
