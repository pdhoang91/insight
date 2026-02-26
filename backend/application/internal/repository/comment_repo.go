package repository

import (
	"github.com/pdhoang91/blog/internal/entities"
	uuid "github.com/satori/go.uuid"
	"gorm.io/gorm"
)

type commentRepo struct{ db *gorm.DB }

func NewCommentRepository(db *gorm.DB) CommentRepository { return &commentRepo{db: db} }

func (r *commentRepo) Create(comment *entities.Comment) error {
	return r.db.Create(comment).Error
}

func (r *commentRepo) Update(comment *entities.Comment) error {
	return r.db.Save(comment).Error
}

func (r *commentRepo) Delete(comment *entities.Comment) error {
	return r.db.Delete(comment).Error
}

func (r *commentRepo) FindByID(id uuid.UUID) (*entities.Comment, error) {
	var comment entities.Comment
	err := r.db.Preload("User").Where("id = ?", id).First(&comment).Error
	return &comment, err
}

func (r *commentRepo) FindByPostID(postID uuid.UUID, limit, offset int) ([]*entities.Comment, error) {
	var comments []*entities.Comment
	err := r.db.Preload("User").Preload("Replies.User").
		Where("post_id = ?", postID).
		Order("created_at DESC").
		Limit(limit).Offset(offset).
		Find(&comments).Error
	return comments, err
}

func (r *commentRepo) CountByPostID(postID uuid.UUID) (int64, error) {
	var count int64
	err := r.db.Model(&entities.Comment{}).Where("post_id = ?", postID).Count(&count).Error
	return count, err
}

func (r *commentRepo) DeleteByPostID(postID uuid.UUID) error {
	return r.db.Where("post_id = ?", postID).Delete(&entities.Comment{}).Error
}
