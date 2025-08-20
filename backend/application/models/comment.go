// models/Comment.go
package models

import (
	"time"

	uuid "github.com/satori/go.uuid"
)

// Comment lưu trữ thông tin về bình luận của người dùng.
type Comment struct {
	ID           uuid.UUID  `gorm:"type:uuid;default:uuid_generate_v4();" json:"id"` // ID của bình luận
	PostID       uuid.UUID  `json:"post_id" gorm:"type:uuid;not null;index;constraint:OnDelete:CASCADE;"`
	UserID       uuid.UUID  `json:"user_id" gorm:"type:uuid;not null;constraint:OnDelete:CASCADE;"`
	Content      string     `json:"content"`                             // Nội dung bình luận
	Status       string     `json:"status" gorm:"default:'active'"`      // Trạng thái comment
	CreatedAt    time.Time  `json:"created_at"`                          // Thời gian tạo bình luận
	UpdatedAt    time.Time  `json:"updated_at"`                          // Thời gian cập nhật
	EditedAt     *time.Time `json:"edited_at,omitempty"`                 // Thời gian chỉnh sửa
	RepliesCount uint64     `json:"replies_count" gorm:"default:0"`      // Số phản hồi (denormalized)
	ClapsCount   uint64     `json:"claps_count" gorm:"default:0"`        // Số claps (denormalized)
	ClapCount    uint64     `json:"clap_count" gorm:"-"`                 // Legacy field for backward compatibility
	User         User       `gorm:"foreignKey:UserID" json:"user"`       // Mối quan hệ với User
	Replies      []Reply    `gorm:"foreignKey:CommentID" json:"replies"` // Mối quan hệ với Replies
}
