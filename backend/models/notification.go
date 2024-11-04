// models/Notification.go
package models

import (
	"time"

	uuid "github.com/satori/go.uuid"
)

type NotificationType string

const (
	NotificationTypeComment NotificationType = "comment"
	NotificationTypeReply   NotificationType = "reply"
	NotificationTypeFollow  NotificationType = "follow"
	NotificationTypeMention NotificationType = "mention"
)

type Notification struct {
	ID        uuid.UUID        `gorm:"type:uuid;default:uuid_generate_v4();" json:"id"`
	UserID    uuid.UUID        `json:"user_id"` // Recipient
	Type      NotificationType `json:"type"`
	Message   string           `json:"message"`
	Read      bool             `json:"read"`
	RelatedID uuid.UUID        `json:"related_id"` // ID of related entity (e.g., PostID, CommentID)
	CreatedAt time.Time        `json:"created_at"`
}
