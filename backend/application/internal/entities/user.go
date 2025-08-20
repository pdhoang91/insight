package entities

import (
	"time"

	"github.com/pdhoang91/blog/constants"
	uuid "github.com/satori/go.uuid"
	"gorm.io/gorm"
)

// UserRole represents user role type
type UserRole = constants.UserRole

// User represents a user entity in the domain
type User struct {
	ID                     uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	Email                  string    `gorm:"uniqueIndex;not null" json:"email"`
	Name                   string    `json:"name"`
	Username               string    `gorm:"uniqueIndex;not null" json:"username"`
	Password               string    `json:"-"`
	GoogleID               string    `gorm:"index" json:"google_id"`
	AvatarURL              string    `json:"avatar_url"`
	Bio                    string    `json:"bio"`
	Phone                  string    `json:"phone"`
	Dob                    string    `json:"dob"`
	Role                   UserRole  `json:"role" gorm:"default:'user'"`
	EmailVerified          bool      `json:"email_verified" gorm:"default:false"`
	VerificationToken      string    `gorm:"index" json:"-"`
	PasswordResetToken     string    `gorm:"index" json:"-"`
	PasswordResetExpiresAt time.Time `json:"-"`
	CreatedAt              time.Time `gorm:"index" json:"created_at"`
	UpdatedAt              time.Time `json:"updated_at"`
}

func (User) TableName() string {
	return "users"
}

// ==================== REPOSITORY METHODS ====================

// Create creates a new user in the database
func (u *User) Create(db *gorm.DB) error {
	return db.Create(u).Error
}

// Update updates the user in the database
func (u *User) Update(db *gorm.DB) error {
	return db.Save(u).Error
}

// Delete deletes the user from the database
func (u *User) Delete(db *gorm.DB) error {
	return db.Delete(u).Error
}

// FindByID finds a user by ID
func (*User) FindByID(db *gorm.DB, id uuid.UUID) (*User, error) {
	var user User
	err := db.Where("id = ?", id).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

// FindByEmail finds a user by email
func (*User) FindByEmail(db *gorm.DB, email string) (*User, error) {
	var user User
	err := db.Where("email = ?", email).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

// FindByUsername finds a user by username
func (*User) FindByUsername(db *gorm.DB, username string) (*User, error) {
	var user User
	err := db.Where("username = ?", username).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

// FindByGoogleID finds a user by Google ID
func (*User) FindByGoogleID(db *gorm.DB, googleID string) (*User, error) {
	var user User
	err := db.Where("google_id = ?", googleID).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

// DeleteByID deletes a user by ID
func (*User) DeleteByID(db *gorm.DB, id uuid.UUID) error {
	return db.Delete(&User{}, "id = ?", id).Error
}

// List retrieves users with pagination
func (*User) List(db *gorm.DB, limit, offset int) ([]*User, error) {
	var users []*User
	err := db.Limit(limit).Offset(offset).Find(&users).Error
	return users, err
}

// FindByEmail finds a user by email
