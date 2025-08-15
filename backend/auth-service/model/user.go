// models/User.go
package models

import (
	"time"

	uuid "github.com/satori/go.uuid"
)

// UserRole represents the type for user roles
type UserRole string

// Simple user role constants - only 2 roles
const (
	RoleUser  UserRole = "user"
	RoleAdmin UserRole = "admin"
)

// Simple helper functions

// CanWritePosts checks if a role can write posts (admin only)
func CanWritePosts(role UserRole) bool {
	return role == RoleAdmin
}

// IsAdmin checks if role is admin
func IsAdmin(role UserRole) bool {
	return role == RoleAdmin
}

// IsValidRole checks if a role is valid
func IsValidRole(role string) bool {
	switch UserRole(role) {
	case RoleUser, RoleAdmin:
		return true
	default:
		return false
	}
}

// GetDefaultRole returns the default role for new users
func GetDefaultRole() UserRole {
	return RoleUser
}

// User lưu trữ thông tin về người dùng.
type User struct {
	ID                     uuid.UUID `gorm:"type:uuid;default:uuid_generate_v4();" json:"id"` // ID của người dùng
	Email                  string    `json:"email"`                                           // Email của người dùng
	Name                   string    `json:"name"`                                            // Tên của người dùng
	Username               string    `json:"username"`                                        // Username Tên của người dùng
	Password               string    `json:"-"`                                               // Loại bỏ trường Password khỏi JSON
	GoogleID               string    `json:"google_id"`                                       // ID từ Google
	AvatarURL              string    `json:"avatar_url"`                                      // URL avatar của người dùng
	Bio                    string    `json:"bio"`                                             // Tiểu sử của người dùng
	Phone                  string    `json:"phone"`                                           // Số điện thoại
	Dob                    string    `json:"dob"`                                             // Ngày sinh
	Role                   UserRole  `json:"role" gorm:"default:'user'"`
	EmailVerified          bool      `json:"email_verified" gorm:"default:false"`
	VerificationToken      string    `json:"-"` // Token for email verification
	PasswordResetToken     string    `json:"-"`
	PasswordResetExpiresAt time.Time `json:"-"`
	CreatedAt              time.Time `json:"created_at"` // Thời gian tạo tài khoản
	UpdatedAt              time.Time `json:"updated_at"` // Thời gian cập nhật thông tin
}
