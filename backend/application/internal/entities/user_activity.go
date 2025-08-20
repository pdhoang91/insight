package entities

import (
	"time"

	uuid "github.com/satori/go.uuid"
)

// UserActivity represents a user activity entity in the domain
type UserActivity struct {
	ID         uuid.UUID  `gorm:"type:uuid;primaryKey" json:"id"`
	UserID     uuid.UUID  `json:"user_id" gorm:"type:uuid;not null;constraint:OnDelete:CASCADE;"`
	PostID     *uuid.UUID `json:"post_id,omitempty" gorm:"type:uuid;constraint:OnDelete:CASCADE;"`
	CommentID  *uuid.UUID `json:"comment_id,omitempty" gorm:"type:uuid;constraint:OnDelete:CASCADE;"`
	ReplyID    *uuid.UUID `json:"reply_id,omitempty" gorm:"type:uuid;constraint:OnDelete:CASCADE;"`
	ActionType string     `json:"action_type"`
	CreatedAt  time.Time  `json:"created_at"`

	// Relationships
	User    User    `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE;" json:"user"`
	Post    Post    `gorm:"foreignKey:PostID;constraint:OnDelete:CASCADE;" json:"post,omitempty"`
	Comment Comment `gorm:"foreignKey:CommentID;constraint:OnDelete:CASCADE;" json:"comment,omitempty"`
	Reply   Reply   `gorm:"foreignKey:ReplyID;constraint:OnDelete:CASCADE;" json:"reply,omitempty"`
}

func (UserActivity) TableName() string {
	return "user_activities"
}
