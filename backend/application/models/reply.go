// models/reply.go
package models

import (
	"time"

	uuid "github.com/satori/go.uuid"
)

// Reply lưu trữ thông tin về phản hồi cho bình luận.
type Reply struct {
	ID         uuid.UUID  `gorm:"type:uuid;default:uuid_generate_v4();" json:"id"` // ID của phản hồi
	CommentID  uuid.UUID  `json:"comment_id"`                                      // Khóa ngoại từ bảng Comment
	PostID     uuid.UUID  `json:"post_id" gorm:"type:uuid;not null;index;constraint:OnDelete:CASCADE;"`
	UserID     uuid.UUID  `json:"user_id" gorm:"type:uuid;not null;constraint:OnDelete:CASCADE;"`
	Content    string     `json:"content"`                        // Nội dung phản hồi
	Status     string     `json:"status" gorm:"default:'active'"` // Trạng thái reply
	CreatedAt  time.Time  `json:"created_at"`                     // Thời gian tạo phản hồi
	UpdatedAt  time.Time  `json:"updated_at"`                     // Thời gian cập nhật
	EditedAt   *time.Time `json:"edited_at,omitempty"`            // Thời gian chỉnh sửa
	ClapsCount uint64     `json:"claps_count" gorm:"default:0"`   // Số claps (denormalized)
	ClapCount  uint64     `json:"clap_count" gorm:"-"`            // Legacy field for backward compatibility
	User       User       `gorm:"foreignKey:UserID" json:"user"`  // Mối quan hệ với User
}
