package dto

import (
	"time"

	"github.com/pdhoang91/blog/internal/entities"
	uuid "github.com/satori/go.uuid"
)

// RatingResponse represents a rating response
type RatingResponse struct {
	ID        uuid.UUID `json:"id"`
	PostID    uuid.UUID `json:"post_id"`
	UserID    uuid.UUID `json:"user_id"`
	Score     uint      `json:"score"`
	CreatedAt time.Time `json:"created_at"`
}

// PostRatingStats represents rating statistics for a post
type PostRatingStats struct {
	PostID        uuid.UUID `json:"post_id"`
	AverageRating float64   `json:"average_rating"`
	TotalRatings  int64     `json:"total_ratings"`
}

// NewRatingResponse creates a new rating response from entity
func NewRatingResponse(rating *entities.Rating) *RatingResponse {
	return &RatingResponse{
		ID:        rating.ID,
		PostID:    rating.PostID,
		UserID:    rating.UserID,
		Score:     rating.Score,
		CreatedAt: rating.CreatedAt,
	}
}
