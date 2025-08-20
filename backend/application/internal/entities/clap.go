package entities

import (
	"time"

	uuid "github.com/satori/go.uuid"
	"gorm.io/gorm"
)

// Clap represents a clap/like entity in the domain
type Clap struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	PostID    uuid.UUID `json:"post_id" gorm:"type:uuid;not null;index;constraint:OnDelete:CASCADE;"`
	UserID    uuid.UUID `json:"user_id" gorm:"type:uuid;not null;index;constraint:OnDelete:CASCADE;"`
	Count     int       `json:"count" gorm:"default:1"` // Number of claps (Medium-style)
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	// Relationships
	Post Post `gorm:"foreignKey:PostID" json:"post"`
	User User `gorm:"foreignKey:UserID" json:"user"`
}

func (Clap) TableName() string {
	return "claps"
}

// ==================== CLAP REPOSITORY METHODS ====================

// Create creates a new clap in the database
func (c *Clap) Create(db *gorm.DB) error {
	return db.Create(c).Error
}

// Update updates the clap in the database
func (c *Clap) Update(db *gorm.DB) error {
	return db.Save(c).Error
}

// Delete deletes the clap from the database
func (c *Clap) Delete(db *gorm.DB) error {
	return db.Delete(c).Error
}

// FindByUserAndPost finds a clap by user ID and post ID
func (*Clap) FindByUserAndPost(db *gorm.DB, userID, postID uuid.UUID) (*Clap, error) {
	var clap Clap
	err := db.Where("user_id = ? AND post_id = ?", userID, postID).First(&clap).Error
	if err != nil {
		return nil, err
	}
	return &clap, nil
}

// FindByPostID finds claps by post ID with pagination
func (*Clap) FindByPostID(db *gorm.DB, postID uuid.UUID, limit, offset int) ([]*Clap, error) {
	var claps []*Clap
	err := db.Preload("User").Where("post_id = ?", postID).
		Order("count DESC, created_at DESC").
		Limit(limit).Offset(offset).
		Find(&claps).Error
	return claps, err
}

// CountByPostID counts total claps for a post
func (*Clap) CountByPostID(db *gorm.DB, postID uuid.UUID) (int64, error) {
	var count int64
	err := db.Model(&Clap{}).Where("post_id = ?", postID).Count(&count).Error
	return count, err
}

// SumClapsByPostID sums total clap count for a post
func (*Clap) SumClapsByPostID(db *gorm.DB, postID uuid.UUID) (int64, error) {
	var sum int64
	err := db.Model(&Clap{}).Where("post_id = ?", postID).
		Select("COALESCE(SUM(count), 0)").Scan(&sum).Error
	return sum, err
}

// GetTopClappedPosts gets posts ordered by clap count
func (*Clap) GetTopClappedPosts(db *gorm.DB, limit, offset int) ([]*Post, error) {
	var posts []*Post
	err := db.Table("posts").
		Select("posts.*, COALESCE(SUM(claps.count), 0) as clap_count").
		Joins("LEFT JOIN claps ON posts.id = claps.post_id").
		Group("posts.id").
		Order("clap_count DESC").
		Limit(limit).Offset(offset).
		Find(&posts).Error
	return posts, err
}

// DeleteByUserAndPost deletes a clap by user ID and post ID
func (*Clap) DeleteByUserAndPost(db *gorm.DB, userID, postID uuid.UUID) error {
	return db.Where("user_id = ? AND post_id = ?", userID, postID).Delete(&Clap{}).Error
}

// GetUserClaps gets claps by user ID with pagination
func (*Clap) GetUserClaps(db *gorm.DB, userID uuid.UUID, limit, offset int) ([]*Clap, error) {
	var claps []*Clap
	err := db.Preload("Post").Preload("Post.User").Where("user_id = ?", userID).
		Order("updated_at DESC").
		Limit(limit).Offset(offset).
		Find(&claps).Error
	return claps, err
}
