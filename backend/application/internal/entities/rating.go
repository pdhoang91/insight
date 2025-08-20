package entities

import (
	"time"

	uuid "github.com/satori/go.uuid"
)

// Rating represents a rating entity in the domain
type Rating struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	PostID    uuid.UUID `json:"post_id"`
	UserID    uuid.UUID `json:"user_id"`
	Score     uint      `json:"score"`
	CreatedAt time.Time `json:"created_at"`
}

func (Rating) TableName() string {
	return "ratings"
}
