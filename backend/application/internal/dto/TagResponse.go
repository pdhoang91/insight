package dto

import (
	"time"

	"github.com/pdhoang91/blog/internal/entities"
	uuid "github.com/satori/go.uuid"
)

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
