package repository

import (
	"github.com/pdhoang91/blog/internal/entities"
	uuid "github.com/satori/go.uuid"
	"gorm.io/gorm"
)

type commentRepo struct{}

func NewCommentRepository() CommentRepository { return &commentRepo{} }

func (r *commentRepo) Create(db *gorm.DB, comment *entities.Comment) error {
	return db.Create(comment).Error
}

func (r *commentRepo) Update(db *gorm.DB, comment *entities.Comment) error {
	return db.Save(comment).Error
}

func (r *commentRepo) Delete(db *gorm.DB, comment *entities.Comment) error {
	return db.Delete(comment).Error
}

func (r *commentRepo) FindByID(db *gorm.DB, id uuid.UUID) (*entities.Comment, error) {
	var comment entities.Comment
	err := db.Preload("User").Where("id = ?", id).First(&comment).Error
	return &comment, err
}

func (r *commentRepo) FindByPostID(db *gorm.DB, postID uuid.UUID, limit, offset int) ([]*entities.Comment, error) {
	var comments []*entities.Comment
	err := db.Preload("User").Preload("Replies.User").
		Where("post_id = ?", postID).
		Order("created_at DESC").
		Limit(limit).Offset(offset).
		Find(&comments).Error
	return comments, err
}

func (r *commentRepo) CountByPostID(db *gorm.DB, postID uuid.UUID) (int64, error) {
	var count int64
	err := db.Model(&entities.Comment{}).Where("post_id = ?", postID).Count(&count).Error
	return count, err
}

func (r *commentRepo) DeleteByPostID(db *gorm.DB, postID uuid.UUID) error {
	return db.Where("post_id = ?", postID).Delete(&entities.Comment{}).Error
}
