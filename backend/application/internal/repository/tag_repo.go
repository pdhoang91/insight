package repository

import (
	"github.com/pdhoang91/blog/internal/entities"
	uuid "github.com/satori/go.uuid"
	"gorm.io/gorm"
)

type tagRepo struct{}

func NewTagRepository() TagRepository { return &tagRepo{} }

func (r *tagRepo) Create(db *gorm.DB, tag *entities.Tag) error {
	if tag.ID == uuid.Nil {
		tag.ID = uuid.NewV4()
	}
	return db.Create(tag).Error
}

func (r *tagRepo) Update(db *gorm.DB, tag *entities.Tag) error {
	return db.Save(tag).Error
}

func (r *tagRepo) Delete(db *gorm.DB, id uuid.UUID) error {
	return db.Where("id = ?", id).Delete(&entities.Tag{}).Error
}

func (r *tagRepo) FindByID(db *gorm.DB, id uuid.UUID) (*entities.Tag, error) {
	var tag entities.Tag
	err := db.Where("id = ?", id).First(&tag).Error
	return &tag, err
}

func (r *tagRepo) FindByName(db *gorm.DB, name string) (*entities.Tag, error) {
	var tag entities.Tag
	err := db.Where("name = ?", name).First(&tag).Error
	return &tag, err
}

func (r *tagRepo) List(db *gorm.DB, limit, offset int) ([]*entities.Tag, error) {
	var tags []*entities.Tag
	err := db.Limit(limit).Offset(offset).Order("created_at DESC").Find(&tags).Error
	return tags, err
}

func (r *tagRepo) GetPopular(db *gorm.DB, limit int) ([]*entities.Tag, error) {
	var tags []*entities.Tag
	err := db.Table("tags").
		Select("tags.*, COUNT(post_tags.post_id) as post_count").
		Joins("LEFT JOIN post_tags ON tags.id = post_tags.tag_id").
		Group("tags.id").
		Order("post_count DESC").
		Limit(limit).
		Find(&tags).Error
	return tags, err
}

func (r *tagRepo) Search(db *gorm.DB, query string, limit int) ([]*entities.Tag, error) {
	var tags []*entities.Tag
	err := db.Where("name ILIKE ?", "%"+query+"%").
		Order("name ASC").Limit(limit).Find(&tags).Error
	return tags, err
}

func (r *tagRepo) Count(db *gorm.DB) (int64, error) {
	var count int64
	err := db.Model(&entities.Tag{}).Count(&count).Error
	return count, err
}
