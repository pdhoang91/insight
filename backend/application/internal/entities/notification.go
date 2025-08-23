package entities

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

// Notification represents a notification entity in the domain
type Notification struct {
	ID        uuid.UUID        `gorm:"type:uuid;primaryKey" json:"id"`
	UserID    uuid.UUID        `json:"user_id"`
	Type      NotificationType `json:"type"`
	Message   string           `json:"message"`
	Read      bool             `json:"read"`
	RelatedID uuid.UUID        `json:"related_id"`
	CreatedAt time.Time        `json:"created_at"`
}

func (Notification) TableName() string {
	return "notifications"
}
