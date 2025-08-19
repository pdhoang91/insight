// models.Category
package models

import (
	"time"

	uuid "github.com/satori/go.uuid"
)

// Category lưu trữ thông tin về danh mục.
type Category struct {
	ID          uuid.UUID `gorm:"type:uuid;default:uuid_generate_v4();" json:"id"` // ID của bài viết
	Name        string    `gorm:"size:100;unique;not null" json:"name"`
	Description string    `json:"description"`
	Posts       []Post    `gorm:"many2many:post_categories;" json:"posts"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}
