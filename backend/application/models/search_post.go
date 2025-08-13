// models/search_post.go
package models

import (
	"time"

	uuid "github.com/satori/go.uuid"
)

type SearchPost struct {
	//Post
	ID             uuid.UUID `json:"id"`
	Title          string    `json:"title"`
	TitleName      string    `json:"title_name"`
	PreviewContent string    `json:"preview_content"`
	Content        string    `json:"content"` // Nội dung từ PostContent
	Tags           []string  `json:"tags"`
	Categories     []string  `json:"categories"`
	UserID         uuid.UUID `json:"user_id"`
	User           User      `json:"user"`
	CreatedAt      time.Time `json:"created_at"`
	ClapCount      uint64    `json:"claps"`
	Views          uint64    `json:"views"`
	CommentsCount  uint64    `json:"comments_count"`
	AverageRating  float64   `json:"average_rating"`
}

// SearchSuggestion represents a search suggestion
type SearchSuggestion struct {
	Text  string  `json:"text"`
	Score float64 `json:"score"`
}

// PopularSearch represents a popular search query
type PopularSearch struct {
	Query string `json:"query"`
	Count int    `json:"count"`
}
