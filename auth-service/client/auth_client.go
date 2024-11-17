// auth_client.go
package client

import (
	"context"
	"time"
)

// AuthClientInterface định nghĩa các phương thức của client.
type AuthClientInterface interface {
	Login(ctx context.Context, email, password string) (string, error)
	Register(ctx context.Context, email, password string) (string, error)
	GetUserProfile(ctx context.Context, token string) (*UserProfile, error)
	VerifyEmail(ctx context.Context, token string) error
	RequestPasswordReset(ctx context.Context, email string) error
	ConfirmPasswordReset(ctx context.Context, token, newPassword string) error
	AdminGetUsers(ctx context.Context, token string) ([]UserProfile, error)
	AdminDeleteUser(ctx context.Context, token string, userID string) error
}

// UserProfile định nghĩa cấu trúc dữ liệu trả về của profile người dùng.
type UserProfile struct {
	ID        string    `json:"id"`
	Username  string    `json:"username"`
	Email     string    `json:"email"`
	Name      string    `json:"name"`
	AvatarURL string    `json:"avatar_url"`
	Phone     string    `json:"phone"`
	Dob       string    `json:"dob"`
	Role      string    `json:"role"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
