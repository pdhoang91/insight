// models/Tag.go
package models

import (
	"time"

	uuid "github.com/satori/go.uuid"
)

// Tag lưu trữ thông tin về thẻ (tag).
type Tag struct {
	ID        uuid.UUID `gorm:"type:uuid;default:uuid_generate_v4();" json:"id"` // ID của bài viết
	Name      string    `gorm:"size:100;unique;not null" json:"name"`
	Posts     []Post    `gorm:"many2many:post_tags;" json:"posts"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
