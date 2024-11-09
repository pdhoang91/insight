// models/Bookmark.go
package models

import (
	"time"

	uuid "github.com/satori/go.uuid"
)

// Bookmark lưu trữ thông tin người dùng đánh dấu bài viết yêu thích.
type Bookmark struct {
	ID uuid.UUID `gorm:"type:uuid;default:uuid_generate_v4();" json:"id"` // ID của bài viết
	//UserID       uuid.UUID `json:"user_id"`                                         // ID của người dùng
	//PostID       uuid.UUID `json:"post_id"`                                         // ID của bài viết được đánh dấu
	PostID       uuid.UUID `json:"post_id" gorm:"type:uuid;not null;index;constraint:OnDelete:CASCADE;"`
	UserID       uuid.UUID `json:"user_id" gorm:"type:uuid;not null;constraint:OnDelete:CASCADE;"`
	Post         Post      `gorm:"foreignKey:PostID" json:"post"` // Mối quan hệ với Post
	User         User      `gorm:"foreignKey:UserID" json:"user"` // Mối quan hệ với User
	IsBookmarked bool      `json:"is_bookmarked"`                 // Trạng thái bookmark
	CreatedAt    time.Time `json:"created_at"`                    // Thời gian tạo bookmark
	UpdatedAt    time.Time `json:"updated_at"`                    // Thời gian cập nhật
}
