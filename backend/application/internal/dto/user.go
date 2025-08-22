package dto

import (
	"time"

	"github.com/pdhoang91/blog/internal/entities"
	uuid "github.com/satori/go.uuid"
)

type CreateUserRequest struct {
	Name     string `json:"name" validate:"required,min=2,max=100"`
	Email    string `json:"email" validate:"required,email"`
	Username string `json:"username" validate:"required,min=3,max=50"`
	Password string `json:"password" validate:"required,min=6"`
}

type UpdateUserRequest struct {
	Name      string `json:"name,omitempty" validate:"omitempty,min=2,max=100"`
	Username  string `json:"username,omitempty" validate:"omitempty,min=3,max=50"`
	Bio       string `json:"bio,omitempty"`
	Phone     string `json:"phone,omitempty"`
	Dob       string `json:"dob,omitempty"`
	AvatarURL string `json:"avatar_url,omitempty"`
}

type LoginRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
}

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
