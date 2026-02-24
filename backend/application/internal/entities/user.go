package entities

import (
	"time"

	"github.com/pdhoang91/blog/constants"
	uuid "github.com/satori/go.uuid"
)

// UserRole represents user role type
type UserRole = constants.UserRole

// User represents a user entity in the domain
type User struct {
	ID                     uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	Email                  string    `json:"email"`
	Name                   string    `json:"name"`
	Username               string    `json:"username"`
	Password               string    `json:"-"`
	GoogleID               string    `json:"google_id"`
	AvatarURL              string    `json:"avatar_url"`
	Bio                    string    `json:"bio"`
	Phone                  string    `json:"phone"`
	Dob                    string    `json:"dob"`
	Role                   UserRole  `json:"role" gorm:"default:'user'"`
	EmailVerified          bool      `json:"email_verified" gorm:"default:false"`
	VerificationToken      string    `json:"-"`
	PasswordResetToken     string    `json:"-"`
	PasswordResetExpiresAt time.Time `json:"-"`
	CreatedAt              time.Time `json:"created_at"`
	UpdatedAt              time.Time `json:"updated_at"`
}

func (User) TableName() string {
	return "users"
}
