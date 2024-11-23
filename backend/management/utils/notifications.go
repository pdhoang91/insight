// utils/notifications.go
package utils

import (
	uuid "github.com/satori/go.uuid"

	"github.com/pdhoang91/blog/database"
	"github.com/pdhoang91/blog/models"
)

func CreateNotification(userID uuid.UUID, notifType models.NotificationType, message string, relatedID uuid.UUID) error {
	notification := models.Notification{
		UserID:    userID,
		Type:      notifType,
		Message:   message,
		RelatedID: relatedID,
	}
	return database.DB.Create(&notification).Error
}
