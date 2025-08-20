package entities

import (
	"time"

	uuid "github.com/satori/go.uuid"
	"gorm.io/gorm"
)

// Bookmark represents a bookmark entity in the domain
type Bookmark struct {
	ID           uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	PostID       uuid.UUID `json:"post_id" gorm:"type:uuid;not null;index;constraint:OnDelete:CASCADE;"`
	UserID       uuid.UUID `json:"user_id" gorm:"type:uuid;not null;index;constraint:OnDelete:CASCADE;"`
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

// ==================== BOOKMARK REPOSITORY METHODS ====================

// Create creates a new bookmark in the database
func (b *Bookmark) Create(db *gorm.DB) error {
	return db.Create(b).Error
}

// Delete deletes the bookmark from the database
func (b *Bookmark) Delete(db *gorm.DB) error {
	return db.Delete(b).Error
}

// DeleteByUserAndPost deletes a bookmark by user ID and post ID
func (*Bookmark) DeleteByUserAndPost(db *gorm.DB, userID, postID uuid.UUID) error {
	return db.Where("user_id = ? AND post_id = ?", userID, postID).Delete(&Bookmark{}).Error
}

// FindByUserID finds bookmarks by user ID with pagination
func (*Bookmark) FindByUserID(db *gorm.DB, userID uuid.UUID, limit, offset int) ([]*Bookmark, error) {
	var bookmarks []*Bookmark
	err := db.Preload("Post").Preload("User").
		Where("user_id = ?", userID).
		Limit(limit).Offset(offset).
		Find(&bookmarks).Error
	return bookmarks, err
}

// CheckIsBookmarked checks if a post is bookmarked by user
func (*Bookmark) CheckIsBookmarked(db *gorm.DB, userID, postID uuid.UUID) (bool, error) {
	var count int64
	err := db.Model(&Bookmark{}).
		Where("user_id = ? AND post_id = ?", userID, postID).
		Count(&count).Error
	return count > 0, err
}
