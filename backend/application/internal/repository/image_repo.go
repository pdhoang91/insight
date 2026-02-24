package repository

import (
	"github.com/pdhoang91/blog/internal/entities"
	uuid "github.com/satori/go.uuid"
	"gorm.io/gorm"
)

type imageRepo struct{}

func NewImageRepository() ImageRepository { return &imageRepo{} }

func (r *imageRepo) FindByID(db *gorm.DB, id uuid.UUID) (*entities.Image, error) {
	var image entities.Image
	err := db.Where("id = ?", id).First(&image).Error
	return &image, err
}

func (r *imageRepo) FindByUserID(db *gorm.DB, userID uuid.UUID, imageType string, limit, offset int) ([]entities.Image, int64, error) {
	query := db.Where("user_id = ?", userID)
	if imageType != "" {
		query = query.Where("image_type = ?", imageType)
	}

	var total int64
	query.Model(&entities.Image{}).Count(&total)

	var images []entities.Image
	err := query.Order("created_at DESC").Limit(limit).Offset(offset).Find(&images).Error
	return images, total, err
}

func (r *imageRepo) CreateReference(db *gorm.DB, ref *entities.ImageReference) error {
	return db.Create(ref).Error
}

func (r *imageRepo) FindReferencesByPostID(db *gorm.DB, postID uuid.UUID) ([]entities.ImageReference, error) {
	var refs []entities.ImageReference
	err := db.Where("post_id = ?", postID).Find(&refs).Error
	return refs, err
}

func (r *imageRepo) FindReference(db *gorm.DB, imageID, postID uuid.UUID, refType string) (*entities.ImageReference, error) {
	var ref entities.ImageReference
	err := db.Where("image_id = ? AND post_id = ? AND ref_type = ?", imageID, postID, refType).First(&ref).Error
	return &ref, err
}
