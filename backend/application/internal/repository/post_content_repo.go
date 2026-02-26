package repository

import (
	"github.com/pdhoang91/blog/internal/entities"
	uuid "github.com/satori/go.uuid"
	"gorm.io/gorm"
)

type postContentRepo struct{ db *gorm.DB }

func NewPostContentRepository(db *gorm.DB) PostContentRepository { return &postContentRepo{db: db} }

func (r *postContentRepo) WithTx(tx *gorm.DB) PostContentRepository { return &postContentRepo{db: tx} }

func (r *postContentRepo) Create(pc *entities.PostContent) error {
	if pc.ID == uuid.Nil {
		pc.ID = uuid.NewV4()
	}
	return r.db.Create(pc).Error
}

func (r *postContentRepo) Update(pc *entities.PostContent) error {
	return r.db.Save(pc).Error
}

func (r *postContentRepo) FindByPostID(postID uuid.UUID) (*entities.PostContent, error) {
	var pc entities.PostContent
	err := r.db.Where("post_id = ?", postID).First(&pc).Error
	return &pc, err
}

func (r *postContentRepo) DeleteByPostID(postID uuid.UUID) error {
	return r.db.Where("post_id = ?", postID).Delete(&entities.PostContent{}).Error
}
