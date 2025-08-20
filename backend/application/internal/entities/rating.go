package entities

import (
	"time"

	uuid "github.com/satori/go.uuid"
	"gorm.io/gorm"
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

// ==================== RATING REPOSITORY METHODS ====================

// Create creates a new rating in the database
func (r *Rating) Create(db *gorm.DB) error {
	return db.Create(r).Error
}

// Update updates the rating in the database
func (r *Rating) Update(db *gorm.DB) error {
	return db.Save(r).Error
}

// Delete deletes the rating from the database
func (r *Rating) Delete(db *gorm.DB) error {
	return db.Delete(r).Error
}

// FindByUserAndPost finds a rating by user ID and post ID
func (*Rating) FindByUserAndPost(db *gorm.DB, userID, postID uuid.UUID) (*Rating, error) {
	var rating Rating
	err := db.Where("user_id = ? AND post_id = ?", userID, postID).First(&rating).Error
	if err != nil {
		return nil, err
	}
	return &rating, nil
}

// FindByPostID finds ratings by post ID with pagination
func (*Rating) FindByPostID(db *gorm.DB, postID uuid.UUID, limit, offset int) ([]*Rating, error) {
	var ratings []*Rating
	err := db.Where("post_id = ?", postID).
		Limit(limit).Offset(offset).
		Find(&ratings).Error
	return ratings, err
}

// GetAverageRating calculates average rating for a post
func (*Rating) GetAverageRating(db *gorm.DB, postID uuid.UUID) (float64, error) {
	var avg float64
	err := db.Model(&Rating{}).Where("post_id = ?", postID).
		Select("AVG(score)").Scan(&avg).Error
	return avg, err
}

// CountByPostID counts ratings by post ID
func (*Rating) CountByPostID(db *gorm.DB, postID uuid.UUID) (int64, error) {
	var count int64
	err := db.Model(&Rating{}).Where("post_id = ?", postID).Count(&count).Error
	return count, err
}

// DeleteByUserAndPost deletes a rating by user ID and post ID
func (*Rating) DeleteByUserAndPost(db *gorm.DB, userID, postID uuid.UUID) error {
	return db.Where("user_id = ? AND post_id = ?", userID, postID).Delete(&Rating{}).Error
}
