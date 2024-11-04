package models

import (
	"time"

	uuid "github.com/satori/go.uuid"
)

// Tab lưu trữ thông tin về các tab mà người dùng theo dõi (writer hoặc topic).
// Tab lưu trữ thông tin về các categories mà người dùng theo dõi.
type Tab struct {
	ID         uuid.UUID `gorm:"type:uuid;default:uuid_generate_v4();primaryKey" json:"id"`
	UserID     uuid.UUID `gorm:"type:uuid;not null;uniqueIndex:idx_user_category" json:"user_id"`     // ID của người dùng
	CategoryID uuid.UUID `gorm:"type:uuid;not null;uniqueIndex:idx_user_category" json:"category_id"` // ID của category
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`

	// Associations
	Category Category `gorm:"foreignKey:CategoryID" json:"category"`
}
