package repository

import (
	"github.com/pdhoang91/blog/internal/entities"
	uuid "github.com/satori/go.uuid"
	"gorm.io/gorm"
)

type postContentRepo struct{}

func NewPostContentRepository() PostContentRepository { return &postContentRepo{} }

func (r *postContentRepo) Create(db *gorm.DB, pc *entities.PostContent) error {
	if pc.ID == uuid.Nil {
		pc.ID = uuid.NewV4()
	}
	return db.Create(pc).Error
}

func (r *postContentRepo) Update(db *gorm.DB, pc *entities.PostContent) error {
	return db.Save(pc).Error
}

func (r *postContentRepo) FindByPostID(db *gorm.DB, postID uuid.UUID) (*entities.PostContent, error) {
	var pc entities.PostContent
	err := db.Where("post_id = ?", postID).First(&pc).Error
	return &pc, err
}

func (r *postContentRepo) DeleteByPostID(db *gorm.DB, postID uuid.UUID) error {
	return db.Where("post_id = ?", postID).Delete(&entities.PostContent{}).Error
}
