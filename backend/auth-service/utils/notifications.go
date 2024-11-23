// utils/notifications.go
package utils

//import (
//	"github.com/pdhoang91/auth-service/database"
//	"github.com/pdhoang91/auth-service/models"
//	uuid "github.com/satori/go.uuid"
//)
//
//func CreateNotification(userID uuid.UUID, notifType models.NotificationType, message string, relatedID uuid.UUID) error {
//	notification := models.Notification{
//		UserID:    userID,
//		Type:      notifType,
//		Message:   message,
//		RelatedID: relatedID,
//	}
//	return database.DB.Create(&notification).Error
//}
