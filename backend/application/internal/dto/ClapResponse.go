package dto

import (
	"time"

	"github.com/pdhoang91/blog/internal/entities"
	uuid "github.com/satori/go.uuid"
)

// ClapResponse represents a clap response
type ClapResponse struct {
	ID        uuid.UUID    `json:"id"`
	PostID    uuid.UUID    `json:"post_id"`
	UserID    uuid.UUID    `json:"user_id"`
	Count     int          `json:"count"`
	CreatedAt time.Time    `json:"created_at"`
	UpdatedAt time.Time    `json:"updated_at"`
	User      *UserResponse `json:"user,omitempty"`
}

// PostClapStats represents clap statistics for a post
type PostClapStats struct {
	PostID         uuid.UUID `json:"post_id"`
	TotalClaps     int64     `json:"total_claps"`
	UniqueClappers int64     `json:"unique_clappers"`
}

// NewClapResponse creates a new clap response from entity
func NewClapResponse(clap *entities.Clap) *ClapResponse {
	response := &ClapResponse{
		ID:        clap.ID,
		PostID:    clap.PostID,
		UserID:    clap.UserID,
		Count:     clap.Count,
		CreatedAt: clap.CreatedAt,
		UpdatedAt: clap.UpdatedAt,
	}

	// Include user info if preloaded
	if clap.User.ID != uuid.Nil {
		response.User = NewUserResponse(&clap.User)
	}

	return response
}
