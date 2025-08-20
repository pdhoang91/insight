package entities

import (
	"time"

	uuid "github.com/satori/go.uuid"
)

// PostContent represents the content of a post entity in the domain
type PostContent struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	PostID    uuid.UUID `json:"post_id"`
	Content   string    `json:"content"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

func (PostContent) TableName() string {
	return "post_contents"
}
