// models/Comment.go
package models

import (
	"time"

	uuid "github.com/satori/go.uuid"
)

// Comment lưu trữ thông tin về bình luận của người dùng.
type Comment struct {
	ID           uuid.UUID `gorm:"type:uuid;default:uuid_generate_v4();" json:"id"` // ID của bình luận
	PostID       uuid.UUID `json:"post_id"`                                         // Khóa ngoại từ bảng Post
	UserID       uuid.UUID `json:"user_id"`                                         // ID của tác giả từ bảng users
	User         User      `gorm:"foreignKey:UserID" json:"user"`                   // Mối quan hệ với User
	Content      string    `json:"content"`                                         // Nội dung bình luận
	CreatedAt    time.Time `json:"created_at"`                                      // Thời gian tạo bình luận
	ClapCount    uint64    `json:"clap_count" gorm:"-"`                             // Tổng số claps cho comment
	RepliesCount uint64    `json:"replies_count" gorm:"-"`                          // Số lượng phản hồi
	Replies      []Reply   `gorm:"foreignKey:CommentID" json:"replies"`             // Mối quan hệ với Replies
}
