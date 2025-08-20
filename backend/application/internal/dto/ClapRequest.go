package dto

import uuid "github.com/satori/go.uuid"

// ClapPostRequest represents a request to clap a post
type ClapPostRequest struct {
	PostID uuid.UUID `json:"post_id" binding:"required"`
	Count  int       `json:"count" binding:"required,min=1,max=50"`
}
