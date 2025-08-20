package models

import (
	"time"

	uuid "github.com/satori/go.uuid"
)

type PostContent struct {
	ID        uuid.UUID `gorm:"type:uuid;default:uuid_generate_v4();" json:"id"` // ID của bài viết
	PostID    uuid.UUID `json:"post_id"`                                         // Khóa ngoại từ bảng Post
	Content   string    `json:"content"`                                         // Nội dung bài viết
	CreatedAt time.Time `json:"created_at"`                                      // Thời gian tạo bài viết
	UpdatedAt time.Time `json:"updated_at"`                                      // Thời gian cập nhật bài viết
}

// TableName specifies the table name for PostContent model
func (PostContent) TableName() string {
	return "post_content"
}
