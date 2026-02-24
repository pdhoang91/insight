package entities

import (
	"encoding/json"
	"time"

	uuid "github.com/satori/go.uuid"
	"gorm.io/gorm"
)

// PostContent stores the structured JSON document tree (TipTap/ProseMirror format) for a post
type PostContent struct {
	ID        uuid.UUID       `gorm:"type:uuid;primaryKey" json:"id"`
	PostID    uuid.UUID       `json:"post_id"`
	Content   json.RawMessage `gorm:"type:jsonb" json:"content"`
	CreatedAt time.Time       `json:"created_at"`
	UpdatedAt time.Time       `json:"updated_at"`
	DeletedAt gorm.DeletedAt  `gorm:"index" json:"deleted_at,omitempty"` // Soft delete field
}

func (PostContent) TableName() string {
	return "post_contents"
}
