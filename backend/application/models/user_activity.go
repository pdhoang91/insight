// models/user_activity.go
package models

import (
	"time"

	uuid "github.com/satori/go.uuid"
)

// ActivityType represents the type of user activity
type ActivityType string

const (
	ActivityTypeClap    ActivityType = "clap"
	ActivityTypeView    ActivityType = "view"
	ActivityTypeComment ActivityType = "comment"
)

// UserActivity represents user interactions with posts, comments, and replies
type UserActivity struct {
	ID           uuid.UUID  `gorm:"type:uuid;default:uuid_generate_v4();primary_key" json:"id"`
	UserID       uuid.UUID  `gorm:"type:uuid;not null" json:"user_id"`
	PostID       *uuid.UUID `gorm:"type:uuid" json:"post_id,omitempty"`    // Optional for comment/reply claps
	CommentID    *uuid.UUID `gorm:"type:uuid" json:"comment_id,omitempty"` // For comment claps
	ReplyID      *uuid.UUID `gorm:"type:uuid" json:"reply_id,omitempty"`   // For reply claps
	ActivityType string     `gorm:"type:varchar(50);not null" json:"activity_type"`
	CreatedAt    time.Time  `json:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at"`

	// Relationships
	User    User     `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Post    *Post    `gorm:"foreignKey:PostID" json:"post,omitempty"`
	Comment *Comment `gorm:"foreignKey:CommentID" json:"comment,omitempty"`
	Reply   *Reply   `gorm:"foreignKey:ReplyID" json:"reply,omitempty"`
}

// TableName specifies the table name for UserActivity
func (UserActivity) TableName() string {
	return "user_activities"
}
