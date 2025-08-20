package dto

import (
	"time"

	"github.com/pdhoang91/blog/internal/entities"
	uuid "github.com/satori/go.uuid"
)

// User responses
type UserResponse struct {
	ID            uuid.UUID `json:"id"`
	Email         string    `json:"email"`
	Name          string    `json:"name"`
	Username      string    `json:"username"`
	AvatarURL     string    `json:"avatar_url"`
	Bio           string    `json:"bio"`
	Phone         string    `json:"phone"`
	Dob           string    `json:"dob"`
	Role          string    `json:"role"`
	EmailVerified bool      `json:"email_verified"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

func NewUserResponse(user *entities.User) *UserResponse {
	return &UserResponse{
		ID:            user.ID,
		Email:         user.Email,
		Name:          user.Name,
		Username:      user.Username,
		AvatarURL:     user.AvatarURL,
		Bio:           user.Bio,
		Phone:         user.Phone,
		Dob:           user.Dob,
		Role:          string(user.Role),
		EmailVerified: user.EmailVerified,
		CreatedAt:     user.CreatedAt,
		UpdatedAt:     user.UpdatedAt,
	}
}

// Auth responses
type LoginResponse struct {
	Token string        `json:"token"`
	User  *UserResponse `json:"user"`
}
