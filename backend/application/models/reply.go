// models/reply.go
package models

import (
	"time"

	uuid "github.com/satori/go.uuid"
)

// Reply lưu trữ thông tin về phản hồi cho bình luận.
type Reply struct {
	ID        uuid.UUID `gorm:"type:uuid;default:uuid_generate_v4();" json:"id"` // ID của phản hồi
	CommentID uuid.UUID `json:"comment_id"`                                      // Khóa ngoại từ bảng Comment
	//UserID    uuid.UUID `json:"user_id"`                                         // ID của tác giả
	PostID    uuid.UUID `json:"post_id" gorm:"type:uuid;not null;index;constraint:OnDelete:CASCADE;"`
	UserID    uuid.UUID `json:"user_id" gorm:"type:uuid;not null;constraint:OnDelete:CASCADE;"`
	User      User      `gorm:"foreignKey:UserID" json:"user"` // Mối quan hệ với User
	Content   string    `json:"content"`                       // Nội dung phản hồi
	CreatedAt time.Time `json:"created_at"`                    // Thời gian tạo phản hồi
	ClapCount uint64    `json:"clap_count" gorm:"-"`           // Tổng số claps cho reply
}
