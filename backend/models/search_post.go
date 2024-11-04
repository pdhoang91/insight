// models/search_post.go
package models

import (
	"time"

	uuid "github.com/satori/go.uuid"
)

type SearchPost struct {
	ID            uuid.UUID `json:"id"`
	Title         string    `json:"title"`
	Content       string    `json:"content"`
	Tags          []string  `json:"tags"`
	Categories    []string  `json:"categories"`
	UserID        uuid.UUID `json:"user_id"`
	CreatedAt     time.Time `json:"created_at"`
	ClapCount     uint64    `json:"claps"`
	Views         uint64    `json:"views"`
	CommentsCount uint64    `json:"comments_count"`
	AverageRating float64   `json:"average_rating"`
}
