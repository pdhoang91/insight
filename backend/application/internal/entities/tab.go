package entities

import (
	"time"

	uuid "github.com/satori/go.uuid"
)

// Tab represents a tab entity in the domain (categories that users follow)
type Tab struct {
	ID         uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	UserID     uuid.UUID `gorm:"type:uuid;not null;uniqueIndex:idx_user_category" json:"user_id"`
	CategoryID uuid.UUID `gorm:"type:uuid;not null;uniqueIndex:idx_user_category" json:"category_id"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`

	// Relationships
	Category Category `gorm:"foreignKey:CategoryID" json:"category"`
}

func (Tab) TableName() string {
	return "tabs"
}
