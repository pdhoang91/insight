package entities

import (
	"time"

	uuid "github.com/satori/go.uuid"
)

// Category represents a category entity in the domain
type Category struct {
	ID          uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	Name        string    `gorm:"size:100;unique;not null" json:"name"`
	Description string    `json:"description"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`

	// Relationships
	Posts []Post `gorm:"many2many:post_categories;" json:"posts"`
}

func (Category) TableName() string {
	return "categories"
}
