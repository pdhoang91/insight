package entities

import (
	"time"

	uuid "github.com/satori/go.uuid"
	"gorm.io/gorm"
)

// PostView represents a post view tracking entity
type PostView struct {
	ID        uuid.UUID  `gorm:"type:uuid;primaryKey" json:"id"`
	PostID    uuid.UUID  `json:"post_id" gorm:"type:uuid;not null;index;constraint:OnDelete:CASCADE;"`
	UserID    *uuid.UUID `json:"user_id,omitempty" gorm:"type:uuid;index;constraint:OnDelete:CASCADE;"` // Nullable for anonymous views
	IPAddress string     `json:"ip_address" gorm:"index"`
	UserAgent string     `json:"user_agent"`
	CreatedAt time.Time  `json:"created_at"`

	// Relationships
	Post Post  `gorm:"foreignKey:PostID" json:"post"`
	User *User `gorm:"foreignKey:UserID" json:"user,omitempty"`
}

func (PostView) TableName() string {
	return "post_views"
}

// ==================== POST VIEW REPOSITORY METHODS ====================

// Create creates a new post view in the database
func (pv *PostView) Create(db *gorm.DB) error {
	return db.Create(pv).Error
}

// FindRecentView finds a recent view by post ID and user/IP within time window
func (*PostView) FindRecentView(db *gorm.DB, postID uuid.UUID, userID *uuid.UUID, ipAddress string, within time.Duration) (*PostView, error) {
	var view PostView
	query := db.Where("post_id = ? AND created_at > ?", postID, time.Now().Add(-within))
	
	if userID != nil {
		query = query.Where("user_id = ?", *userID)
	} else {
		query = query.Where("ip_address = ? AND user_id IS NULL", ipAddress)
	}
	
	err := query.First(&view).Error
	if err != nil {
		return nil, err
	}
	return &view, nil
}

// CountByPostID counts total views for a post
func (*PostView) CountByPostID(db *gorm.DB, postID uuid.UUID) (int64, error) {
	var count int64
	err := db.Model(&PostView{}).Where("post_id = ?", postID).Count(&count).Error
	return count, err
}

// CountUniqueViewsByPostID counts unique views for a post (by user or IP)
func (*PostView) CountUniqueViewsByPostID(db *gorm.DB, postID uuid.UUID) (int64, error) {
	var count int64
	err := db.Model(&PostView{}).
		Select("COUNT(DISTINCT COALESCE(user_id::text, ip_address))").
		Where("post_id = ?", postID).
		Count(&count).Error
	return count, err
}

// GetTopViewedPosts gets posts ordered by view count
func (*PostView) GetTopViewedPosts(db *gorm.DB, limit, offset int) ([]*Post, error) {
	var posts []*Post
	err := db.Table("posts").
		Select("posts.*, COUNT(post_views.id) as view_count").
		Joins("LEFT JOIN post_views ON posts.id = post_views.post_id").
		Group("posts.id").
		Order("view_count DESC").
		Limit(limit).Offset(offset).
		Find(&posts).Error
	return posts, err
}

// GetViewsByDateRange gets view statistics by date range
func (*PostView) GetViewsByDateRange(db *gorm.DB, postID uuid.UUID, startDate, endDate time.Time) (int64, error) {
	var count int64
	err := db.Model(&PostView{}).
		Where("post_id = ? AND created_at BETWEEN ? AND ?", postID, startDate, endDate).
		Count(&count).Error
	return count, err
}
