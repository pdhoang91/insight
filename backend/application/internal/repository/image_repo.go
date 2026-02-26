package repository

import (
	"github.com/pdhoang91/blog/internal/entities"
	uuid "github.com/satori/go.uuid"
	"gorm.io/gorm"
)

type imageRepo struct{ db *gorm.DB }

func NewImageRepository(db *gorm.DB) ImageRepository { return &imageRepo{db: db} }

func (r *imageRepo) FindByID(id uuid.UUID) (*entities.Image, error) {
	var image entities.Image
	err := r.db.Where("id = ?", id).First(&image).Error
	return &image, err
}

func (r *imageRepo) FindByUserID(userID uuid.UUID, imageType string, limit, offset int) ([]entities.Image, int64, error) {
	query := r.db.Where("user_id = ?", userID)
	if imageType != "" {
		query = query.Where("image_type = ?", imageType)
	}

	var total int64
	query.Model(&entities.Image{}).Count(&total)

	var images []entities.Image
	err := query.Order("created_at DESC").Limit(limit).Offset(offset).Find(&images).Error
	return images, total, err
}

func (r *imageRepo) CreateReference(ref *entities.ImageReference) error {
	return r.db.Create(ref).Error
}

func (r *imageRepo) FindReferencesByPostID(postID uuid.UUID) ([]entities.ImageReference, error) {
	var refs []entities.ImageReference
	err := r.db.Where("post_id = ?", postID).Find(&refs).Error
	return refs, err
}

func (r *imageRepo) FindReference(imageID, postID uuid.UUID, refType string) (*entities.ImageReference, error) {
	var ref entities.ImageReference
	err := r.db.Where("image_id = ? AND post_id = ? AND ref_type = ?", imageID, postID, refType).First(&ref).Error
	return &ref, err
}
