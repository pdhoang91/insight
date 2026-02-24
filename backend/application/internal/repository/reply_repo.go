package repository

import (
	"github.com/pdhoang91/blog/internal/entities"
	uuid "github.com/satori/go.uuid"
	"gorm.io/gorm"
)

type replyRepo struct{}

func NewReplyRepository() ReplyRepository { return &replyRepo{} }

func (r *replyRepo) Create(db *gorm.DB, reply *entities.Reply) error {
	return db.Create(reply).Error
}

func (r *replyRepo) Update(db *gorm.DB, reply *entities.Reply) error {
	return db.Save(reply).Error
}

func (r *replyRepo) Delete(db *gorm.DB, reply *entities.Reply) error {
	return db.Delete(reply).Error
}

func (r *replyRepo) FindByID(db *gorm.DB, id uuid.UUID) (*entities.Reply, error) {
	var reply entities.Reply
	err := db.Preload("User").Where("id = ?", id).First(&reply).Error
	return &reply, err
}

func (r *replyRepo) FindByCommentID(db *gorm.DB, commentID uuid.UUID, limit, offset int) ([]*entities.Reply, error) {
	var replies []*entities.Reply
	err := db.Preload("User").Where("comment_id = ?", commentID).
		Order("created_at ASC").
		Limit(limit).Offset(offset).
		Find(&replies).Error
	return replies, err
}

func (r *replyRepo) CountByCommentID(db *gorm.DB, commentID uuid.UUID) (int64, error) {
	var count int64
	err := db.Model(&entities.Reply{}).Where("comment_id = ?", commentID).Count(&count).Error
	return count, err
}

func (r *replyRepo) CountByPostID(db *gorm.DB, postID uuid.UUID) (int64, error) {
	var count int64
	err := db.Model(&entities.Reply{}).Where("post_id = ?", postID).Count(&count).Error
	return count, err
}

func (r *replyRepo) DeleteByCommentID(db *gorm.DB, commentID uuid.UUID) error {
	return db.Where("comment_id = ?", commentID).Delete(&entities.Reply{}).Error
}

func (r *replyRepo) DeleteByPostID(db *gorm.DB, postID uuid.UUID) error {
	return db.Where("post_id = ?", postID).Delete(&entities.Reply{}).Error
}
