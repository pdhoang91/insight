package dto

import uuid "github.com/satori/go.uuid"

// RatePostRequest represents a request to rate a post
type RatePostRequest struct {
	PostID uuid.UUID `json:"post_id" binding:"required"`
	Score  uint      `json:"score" binding:"required,min=1,max=5"`
}
