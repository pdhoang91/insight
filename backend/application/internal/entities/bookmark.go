package entities

import (
	"time"

	uuid "github.com/satori/go.uuid"
)

// Bookmark represents a bookmark entity in the domain
type Bookmark struct {
	ID           uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	PostID       uuid.UUID `json:"post_id" gorm:"type:uuid;not null;index;constraint:OnDelete:CASCADE;"`
	UserID       uuid.UUID `json:"user_id" gorm:"type:uuid;not null;constraint:OnDelete:CASCADE;"`
	IsBookmarked bool      `json:"is_bookmarked"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`

	// Relationships
	Post Post `gorm:"foreignKey:PostID" json:"post"`
	User User `gorm:"foreignKey:UserID" json:"user"`
}

func (Bookmark) TableName() string {
	return "bookmarks"
}
