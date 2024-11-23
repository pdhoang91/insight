// models/models.go
package models

import (
	"time"
)

type New struct {
	ID           uint        `json:"id" gorm:"primaryKey"`
	Title        string      `json:"title"`
	Summary      string      `json:"summary"`
	Content      string      `json:"content"`
	SourceID     uint        `json:"source_id"`
	Source       NewSource   `json:"-"`
	CategoryID   uint        `json:"category_id"`
	Category     NewCategory `json:"-"`
	ImageURL     string      `json:"image_url"`
	AudioURL     *string     `json:"audio_url"`
	IsBookmarked bool        `json:"is_bookmarked" gorm:"default:false"`
	PublishedAt  time.Time   `json:"published_date"`
	CreatedAt    time.Time   `json:"created_at"`
	UpdatedAt    time.Time   `json:"updated_at"`
}

type NewSource struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	Name      string    `json:"name"`
	URL       string    `json:"url"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type NewCategory struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	Name      string    `json:"name"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
