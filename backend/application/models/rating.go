// models/rating.go
package models

import (
	"time"

	uuid "github.com/satori/go.uuid"
)

// Rating lưu trữ thông tin về đánh giá của bài viết.
type Rating struct {
	ID        uuid.UUID `gorm:"type:uuid;default:uuid_generate_v4();" json:"id"` // ID của đánh giá
	PostID    uuid.UUID `json:"post_id"`                                         // Khóa ngoại từ bảng Post
	UserID    uuid.UUID `json:"user_id"`                                         // ID của người dùng đánh giá
	Score     uint      `json:"score"`                                           // Giá trị đánh giá từ 1 đến 5
	CreatedAt time.Time `json:"created_at"`                                      // Thời gian tạo đánh giá
}
