package repository

import (
	"github.com/pdhoang91/blog/internal/entities"
	uuid "github.com/satori/go.uuid"
	"gorm.io/gorm"
)

type bookmarkRepo struct{}

func NewBookmarkRepository() BookmarkRepository { return &bookmarkRepo{} }

func (r *bookmarkRepo) Create(db *gorm.DB, bookmark *entities.Bookmark) error {
	return db.Create(bookmark).Error
}

func (r *bookmarkRepo) Delete(db *gorm.DB, bookmark *entities.Bookmark) error {
	return db.Delete(bookmark).Error
}

func (r *bookmarkRepo) Save(db *gorm.DB, bookmark *entities.Bookmark) error {
	return db.Save(bookmark).Error
}

func (r *bookmarkRepo) FindByUserAndPost(db *gorm.DB, userID, postID uuid.UUID) (*entities.Bookmark, error) {
	var bookmark entities.Bookmark
	err := db.Where("user_id = ? AND post_id = ?", userID, postID).First(&bookmark).Error
	return &bookmark, err
}

func (r *bookmarkRepo) FindByIDWithPost(db *gorm.DB, id uuid.UUID) (*entities.Bookmark, error) {
	var bookmark entities.Bookmark
	err := db.Preload("Post.User").Where("id = ?", id).First(&bookmark).Error
	return &bookmark, err
}

func (r *bookmarkRepo) FindByUserID(db *gorm.DB, userID uuid.UUID, limit, offset int) ([]*entities.Bookmark, error) {
	var bookmarks []*entities.Bookmark
	err := db.Preload("Post.User").
		Where("user_id = ? AND is_bookmarked = ?", userID, true).
		Limit(limit).Offset(offset).
		Find(&bookmarks).Error
	return bookmarks, err
}

func (r *bookmarkRepo) CheckIsBookmarked(db *gorm.DB, userID, postID uuid.UUID) (bool, error) {
	var count int64
	err := db.Model(&entities.Bookmark{}).
		Where("user_id = ? AND post_id = ?", userID, postID).
		Count(&count).Error
	return count > 0, err
}

func (r *bookmarkRepo) CountByUser(db *gorm.DB, userID uuid.UUID) (int64, error) {
	var count int64
	err := db.Model(&entities.Bookmark{}).
		Where("user_id = ? AND is_bookmarked = ?", userID, true).
		Count(&count).Error
	return count, err
}
