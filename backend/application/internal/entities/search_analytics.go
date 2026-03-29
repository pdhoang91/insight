package entities

import (
	"time"

	uuid "github.com/satori/go.uuid"
)

// SearchAnalytics tracks every search query for analytics purposes.
type SearchAnalytics struct {
	ID           uuid.UUID `gorm:"type:uuid;default:uuid_generate_v4();" json:"id"`
	Query        string    `json:"query"`
	UserID       string    `json:"user_id"`
	ResultsCount int       `json:"results_count"`
	CreatedAt    time.Time `json:"created_at"`
}

func (SearchAnalytics) TableName() string {
	return "search_analytics"
}
