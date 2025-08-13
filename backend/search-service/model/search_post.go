// models/search_post.go
package models

import (
	"time"

	uuid "github.com/satori/go.uuid"
)

type SearchPost struct {
	//Post
	ID             uuid.UUID `json:"id"`
	Title          string    `json:"title"`
	TitleName      string    `json:"title_name"`
	PreviewContent string    `json:"preview_content"`
	Content        string    `json:"content"` // Nội dung từ PostContent
	Tags           []string  `json:"tags"`
	Categories     []string  `json:"categories"`
	UserID         uuid.UUID `json:"user_id"`
	User           User      `json:"user"`
	CreatedAt      time.Time `json:"created_at"`
	ClapCount      uint64    `json:"claps"`
	Views          uint64    `json:"views"`
	CommentsCount  uint64    `json:"comments_count"`
	AverageRating  float64   `json:"average_rating"`
}

type UserRole string

const (
	RoleUser      UserRole = "user"
	RoleAdmin     UserRole = "admin"
	RoleModerator UserRole = "moderator"
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
	Role                   UserRole  `json:"role" gorm:"default:user"`
	EmailVerified          bool      `json:"email_verified" gorm:"default:false"`
	VerificationToken      string    `json:"-"` // Token for email verification
	PasswordResetToken     string    `json:"-"`
	PasswordResetExpiresAt time.Time `json:"-"`
	CreatedAt              time.Time `json:"created_at"` // Thời gian tạo tài khoản
	UpdatedAt              time.Time `json:"updated_at"` // Thời gian cập nhật thông tin
}

// SearchSuggestion represents a search suggestion
type SearchSuggestion struct {
	Text  string  `json:"text"`
	Score float64 `json:"score"`
}

// PopularSearch represents a popular search query
type PopularSearch struct {
	Query string `json:"query"`
	Count int    `json:"count"`
}

// SearchAnalytics tracks search queries for analytics
type SearchAnalytics struct {
	ID           uuid.UUID `gorm:"type:uuid;default:uuid_generate_v4();" json:"id"`
	Query        string    `json:"query"`
	UserID       string    `json:"user_id"`
	ResultsCount int       `json:"results_count"`
	CreatedAt    time.Time `json:"created_at"`
}
