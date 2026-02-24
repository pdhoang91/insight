package entities

import (
	"time"

	uuid "github.com/satori/go.uuid"
)

// Tag represents a tag entity in the domain
type Tag struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	Name      string    `gorm:"size:100;unique;not null" json:"name"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	// Relationships
	Posts []Post `gorm:"many2many:post_tags;" json:"posts"`
}

func (Tag) TableName() string {
	return "tags"
}
