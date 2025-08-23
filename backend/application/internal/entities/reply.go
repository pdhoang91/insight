package entities

import (
	"time"

	uuid "github.com/satori/go.uuid"
	"gorm.io/gorm"
)

// Reply represents a reply entity in the domain
type Reply struct {
	ID         uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	CommentID  uuid.UUID `json:"comment_id"`
	PostID     uuid.UUID `json:"post_id" gorm:"type:uuid;not null;index;constraint:OnDelete:CASCADE;"`
	UserID     uuid.UUID `json:"user_id" gorm:"type:uuid;not null;constraint:OnDelete:CASCADE;"`
	Content    string    `json:"content"`
	CountReply uint64    `json:"count_reply" gorm:"default:0"`
	CreatedAt  time.Time `json:"created_at"`
	ClapCount  uint64    `json:"clap_count" gorm:"-"`

	// Relationships
	User User `gorm:"foreignKey:UserID" json:"user"`
}

func (Reply) TableName() string {
	return "replies"
}

// ==================== REPLY REPOSITORY METHODS ====================

// Create creates a new reply in the database
func (r *Reply) Create(db *gorm.DB) error {
	return db.Create(r).Error
}

// Update updates the reply in the database
func (r *Reply) Update(db *gorm.DB) error {
	return db.Save(r).Error
}

// Delete deletes the reply from the database
func (r *Reply) Delete(db *gorm.DB) error {
	return db.Delete(r).Error
}

// FindByID finds a reply by ID with preloaded user
func (*Reply) FindByID(db *gorm.DB, id uuid.UUID) (*Reply, error) {
	var reply Reply
	err := db.Preload("User").Where("id = ?", id).First(&reply).Error
	if err != nil {
		return nil, err
	}
	return &reply, nil
}

// FindByCommentID finds replies by comment ID with pagination
func (*Reply) FindByCommentID(db *gorm.DB, commentID uuid.UUID, limit, offset int) ([]*Reply, error) {
	var replies []*Reply
	err := db.Preload("User").Where("comment_id = ?", commentID).
		Limit(limit).Offset(offset).Find(&replies).Error
	return replies, err
}

// DeleteByID deletes a reply by ID
func (*Reply) DeleteByID(db *gorm.DB, id uuid.UUID) error {
	return db.Delete(&Reply{}, "id = ?", id).Error
}

// CountByCommentID counts replies by comment ID
func (*Reply) CountByCommentID(db *gorm.DB, commentID uuid.UUID) (int64, error) {
	var count int64
	err := db.Model(&Reply{}).Where("comment_id = ?", commentID).Count(&count).Error
	return count, err
}
