package repository

import (
	"github.com/pdhoang91/blog/internal/entities"
	uuid "github.com/satori/go.uuid"
	"gorm.io/gorm"
)

type replyRepo struct{ db *gorm.DB }

func NewReplyRepository(db *gorm.DB) ReplyRepository { return &replyRepo{db: db} }

func (r *replyRepo) WithTx(tx *gorm.DB) ReplyRepository { return &replyRepo{db: tx} }

func (r *replyRepo) Create(reply *entities.Reply) error {
	return r.db.Create(reply).Error
}

func (r *replyRepo) Update(reply *entities.Reply) error {
	return r.db.Save(reply).Error
}

func (r *replyRepo) Delete(reply *entities.Reply) error {
	return r.db.Delete(reply).Error
}

func (r *replyRepo) FindByID(id uuid.UUID) (*entities.Reply, error) {
	var reply entities.Reply
	err := r.db.Preload("User").Where("id = ?", id).First(&reply).Error
	return &reply, err
}

func (r *replyRepo) FindByCommentID(commentID uuid.UUID, limit, offset int) ([]*entities.Reply, error) {
	var replies []*entities.Reply
	err := r.db.Preload("User").Where("comment_id = ?", commentID).
		Order("created_at ASC").
		Limit(limit).Offset(offset).
		Find(&replies).Error
	return replies, err
}

func (r *replyRepo) CountByCommentID(commentID uuid.UUID) (int64, error) {
	var count int64
	err := r.db.Model(&entities.Reply{}).Where("comment_id = ?", commentID).Count(&count).Error
	return count, err
}

func (r *replyRepo) CountByPostID(postID uuid.UUID) (int64, error) {
	var count int64
	err := r.db.Model(&entities.Reply{}).Where("post_id = ?", postID).Count(&count).Error
	return count, err
}

func (r *replyRepo) DeleteByCommentID(commentID uuid.UUID) error {
	return r.db.Where("comment_id = ?", commentID).Delete(&entities.Reply{}).Error
}

func (r *replyRepo) DeleteByPostID(postID uuid.UUID) error {
	return r.db.Where("post_id = ?", postID).Delete(&entities.Reply{}).Error
}
