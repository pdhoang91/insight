package repository

import (
	"github.com/pdhoang91/blog/internal/entities"
	uuid "github.com/satori/go.uuid"
	"gorm.io/gorm"
)

type bookmarkRepo struct{ db *gorm.DB }

func NewBookmarkRepository(db *gorm.DB) BookmarkRepository { return &bookmarkRepo{db: db} }

func (r *bookmarkRepo) Create(bookmark *entities.Bookmark) error {
	return r.db.Create(bookmark).Error
}

func (r *bookmarkRepo) Delete(bookmark *entities.Bookmark) error {
	return r.db.Delete(bookmark).Error
}

func (r *bookmarkRepo) Save(bookmark *entities.Bookmark) error {
	return r.db.Save(bookmark).Error
}

func (r *bookmarkRepo) FindByUserAndPost(userID, postID uuid.UUID) (*entities.Bookmark, error) {
	var bookmark entities.Bookmark
	err := r.db.Where("user_id = ? AND post_id = ?", userID, postID).First(&bookmark).Error
	return &bookmark, err
}

func (r *bookmarkRepo) FindByIDWithPost(id uuid.UUID) (*entities.Bookmark, error) {
	var bookmark entities.Bookmark
	err := r.db.Preload("Post.User").Where("id = ?", id).First(&bookmark).Error
	return &bookmark, err
}

func (r *bookmarkRepo) FindByUserID(userID uuid.UUID, limit, offset int) ([]*entities.Bookmark, error) {
	var bookmarks []*entities.Bookmark
	err := r.db.Preload("Post.User").
		Where("user_id = ? AND is_bookmarked = ?", userID, true).
		Limit(limit).Offset(offset).
		Find(&bookmarks).Error
	return bookmarks, err
}

func (r *bookmarkRepo) CheckIsBookmarked(userID, postID uuid.UUID) (bool, error) {
	var count int64
	err := r.db.Model(&entities.Bookmark{}).
		Where("user_id = ? AND post_id = ?", userID, postID).
		Count(&count).Error
	return count > 0, err
}

func (r *bookmarkRepo) CountByUser(userID uuid.UUID) (int64, error) {
	var count int64
	err := r.db.Model(&entities.Bookmark{}).
		Where("user_id = ? AND is_bookmarked = ?", userID, true).
		Count(&count).Error
	return count, err
}
