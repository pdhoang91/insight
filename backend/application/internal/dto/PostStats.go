package dto

import uuid "github.com/satori/go.uuid"

// PostStats represents comprehensive post statistics
type PostStats struct {
	PostID        uuid.UUID `json:"post_id"`
	TotalClaps    int64     `json:"total_claps"`
	ClapCount     int64     `json:"clap_count"`
	CommentCount  int64     `json:"comment_count"`
	AverageRating float64   `json:"average_rating"`
	RatingCount   int64     `json:"rating_count"`
	ViewCount     int64     `json:"view_count"`
}
