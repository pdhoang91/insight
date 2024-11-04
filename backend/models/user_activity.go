// models/UserActivity.go
package models

import (
	"time"

	uuid "github.com/satori/go.uuid"
)

// UserActivity lưu trữ thông tin về các hoạt động của người dùng.
type UserActivity struct {
	ID         uuid.UUID  `gorm:"type:uuid;default:uuid_generate_v4();" json:"id"` // ID của hoạt động
	UserID     uuid.UUID  `json:"user_id"`                                         // Khóa ngoại từ bảng User
	PostID     *uuid.UUID `json:"post_id,omitempty"`                               // Có thể null nếu là hành động cho Comment hoặc Reply
	CommentID  *uuid.UUID `json:"comment_id,omitempty"`                            // Có thể null nếu là hành động cho Post
	ReplyID    *uuid.UUID `json:"reply_id,omitempty"`                              // Có thể null nếu là hành động cho Post hoặc Comment
	ActionType string     `json:"action_type"`                                     // Loại hành động: clap, thả icon, v.v.
	CreatedAt  time.Time  `json:"created_at"`                                      // Thời gian tạo hoạt động
}
