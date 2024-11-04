// models/Post.go
package models

import (
	"time"

	uuid "github.com/satori/go.uuid"
)

// Post lưu trữ thông tin về bài viết.
type Post struct {
	ID             uuid.UUID   `gorm:"type:uuid;default:uuid_generate_v4();" json:"id"` // ID của bài viết
	Title          string      `json:"title"`                                           // Tiêu đề bài viết
	ImageTitle     string      `json:"image_title"`
	TitleName      string      `json:"title_name"`
	PreviewContent string      `json:"preview_content"`                             // Nội dung tóm tắt bài viết
	UserID         uuid.UUID   `json:"user_id"`                                     // ID của tác giả
	CreatedAt      time.Time   `json:"created_at"`                                  // Thời gian tạo bài viết
	UpdatedAt      time.Time   `json:"updated_at"`                                  // Thời gian cập nhật bài viết
	Views          uint64      `json:"views"`                                       // Số lượt xem
	Content        string      `gorm:"-" json:"content"`                            // Hình ảnh bài viết
	ClapCount      uint64      `gorm:"-" json:"clap_count"`                         // Tổng số claps cho bài viết
	CommentsCount  uint64      `gorm:"-" json:"comments_count"`                     // Tổng số bình luận cho bài viết
	AverageRating  float64     `gorm:"-" json:"average_rating"`                     // Điểm trung bình của rating
	User           User        `gorm:"foreignKey:UserID" json:"user"`               // Mối quan hệ với User
	Comments       []Comment   `gorm:"foreignKey:PostID" json:"comments"`           // Mối quan hệ với Comments
	Categories     []Category  `gorm:"many2many:post_categories" json:"categories"` // Mối quan hệ với Categories
	Tags           []Tag       `gorm:"many2many:post_tags" json:"tags"`             // Mối quan hệ với Tags
	PostContent    PostContent `gorm:"foreignKey:PostID" json:"post_content"`       // Mối quan hệ với PostContent
}

// PostCategory lưu trữ mối quan hệ nhiều-nhiều giữa bài viết và danh mục.
type PostCategory struct {
	PostID     uuid.UUID `gorm:"type:uuid;primaryKey"` // ID của bài viết
	CategoryID uuid.UUID `gorm:"type:uuid;primaryKey"` // ID của danh mục
}

// PostTag lưu trữ mối quan hệ nhiều-nhiều giữa Post và Tag.
type PostTag struct {
	PostID uuid.UUID `gorm:"type:uuid;primaryKey"` // ID của bài viết
	TagID  uuid.UUID `gorm:"type:uuid;primaryKey"` // ID của tag
}
