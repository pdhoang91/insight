package repository

import (
	"github.com/pdhoang91/blog/internal/entities"
	uuid "github.com/satori/go.uuid"
	"gorm.io/gorm"
)

type tagRepo struct{ db *gorm.DB }

func NewTagRepository(db *gorm.DB) TagRepository { return &tagRepo{db: db} }

func (r *tagRepo) WithTx(tx *gorm.DB) TagRepository { return &tagRepo{db: tx} }

func (r *tagRepo) Create(tag *entities.Tag) error {
	if tag.ID == uuid.Nil {
		tag.ID = uuid.NewV4()
	}
	return r.db.Create(tag).Error
}

func (r *tagRepo) Update(tag *entities.Tag) error {
	return r.db.Save(tag).Error
}

func (r *tagRepo) Delete(id uuid.UUID) error {
	return r.db.Where("id = ?", id).Delete(&entities.Tag{}).Error
}

func (r *tagRepo) FindByID(id uuid.UUID) (*entities.Tag, error) {
	var tag entities.Tag
	err := r.db.Where("id = ?", id).First(&tag).Error
	if err != nil {
		return nil, err
	}
	return &tag, nil
}

func (r *tagRepo) FindByName(name string) (*entities.Tag, error) {
	var tag entities.Tag
	err := r.db.Where("name = ?", name).First(&tag).Error
	if err != nil {
		return nil, err
	}
	return &tag, nil
}

func (r *tagRepo) List(limit, offset int) ([]*entities.Tag, error) {
	var tags []*entities.Tag
	err := r.db.Limit(limit).Offset(offset).Order("created_at DESC").Find(&tags).Error
	return tags, err
}

func (r *tagRepo) GetPopular(limit int) ([]*entities.Tag, error) {
	var tags []*entities.Tag
	err := r.db.Table("tags").
		Select("tags.*, COUNT(post_tags.post_id) as post_count").
		Joins("LEFT JOIN post_tags ON tags.id = post_tags.tag_id").
		Group("tags.id").
		Order("post_count DESC").
		Limit(limit).
		Find(&tags).Error
	return tags, err
}

func (r *tagRepo) Search(query string, limit int) ([]*entities.Tag, error) {
	var tags []*entities.Tag
	err := r.db.Where("name ILIKE ?", "%"+query+"%").
		Order("name ASC").Limit(limit).Find(&tags).Error
	return tags, err
}

func (r *tagRepo) Count() (int64, error) {
	var count int64
	err := r.db.Model(&entities.Tag{}).Count(&count).Error
	return count, err
}

func (r *tagRepo) CountPostsByTag(tagID uuid.UUID) (int64, error) {
	var count int64
	err := r.db.Model(&entities.PostTag{}).Where("tag_id = ?", tagID).Count(&count).Error
	return count, err
}
