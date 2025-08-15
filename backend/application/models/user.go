// models/User.go
package models

import (
	"time"

	"github.com/pdhoang91/blog/constants"
	uuid "github.com/satori/go.uuid"
)

// Use constants from the constants package
type UserRole = constants.UserRole

// Re-export constants for backward compatibility
const (
	RoleUser  = constants.RoleUser
	RoleAdmin = constants.RoleAdmin
)

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
