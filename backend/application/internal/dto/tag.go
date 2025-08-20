package dto

import (
	"github.com/pdhoang91/blog/internal/entities"
	uuid "github.com/satori/go.uuid"
	"time"
)

// Tag requests
type CreateTagRequest struct {
	Name string `json:"name" validate:"required,min=2,max=50"`
}

type UpdateTagRequest struct {
	Name string `json:"name,omitempty" validate:"omitempty,min=2,max=50"`
}

// Tag responses
type TagResponse struct {
	ID        uuid.UUID `json:"id"`
	Name      string    `json:"name"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

func NewTagResponse(tag *entities.Tag) *TagResponse {
	return &TagResponse{
		ID:        tag.ID,
		Name:      tag.Name,
		CreatedAt: tag.CreatedAt,
		UpdatedAt: tag.UpdatedAt,
	}
}
