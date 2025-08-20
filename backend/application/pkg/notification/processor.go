package notification

import (
	"fmt"
	"time"

	"github.com/pdhoang91/blog/internal/entities"
	uuid "github.com/satori/go.uuid"
	"gorm.io/gorm"
)

// EventType represents different types of events that can trigger notifications
type EventType string

const (
	EventTypePostCreated  EventType = "post_created"
	EventTypePostUpdated  EventType = "post_updated"
	EventTypePostDeleted  EventType = "post_deleted"
	EventTypeCommentAdded EventType = "comment_added"
	EventTypeReplyAdded   EventType = "reply_added"
	EventTypeUserFollowed EventType = "user_followed"
)

// Event represents an event that can trigger notifications
type Event struct {
	Type      EventType
	UserID    uuid.UUID
	TargetID  uuid.UUID // ID of the target (post, comment, user, etc.)
	RelatedID uuid.UUID // ID of the related entity (comment ID for reply, etc.)
	Message   string
	Data      map[string]interface{}
}

// EventProcessor handles event processing and notification creation
type EventProcessor struct {
	db *gorm.DB
}

// NewEventProcessor creates a new event processor
func NewEventProcessor(db *gorm.DB) *EventProcessor {
	return &EventProcessor{
		db: db,
	}
}

// ProcessEvent processes an event and creates appropriate notifications
func (p *EventProcessor) ProcessEvent(event Event) error {
	switch event.Type {
	case EventTypePostCreated:
		return p.processPostCreatedEvent(event)
	case EventTypePostUpdated:
		return p.processPostUpdatedEvent(event)
	case EventTypePostDeleted:
		return p.processPostDeletedEvent(event)
	case EventTypeCommentAdded:
		return p.processCommentAddedEvent(event)
	case EventTypeReplyAdded:
		return p.processReplyAddedEvent(event)
	case EventTypeUserFollowed:
		return p.processUserFollowedEvent(event)
	default:
		return fmt.Errorf("unknown event type: %s", event.Type)
	}
}

// processPostCreatedEvent processes post creation events
func (p *EventProcessor) processPostCreatedEvent(event Event) error {
	// Get followers of the user who created the post
	var followers []entities.Follow
	if err := p.db.Where("following_id = ?", event.UserID).Find(&followers).Error; err != nil {
		return fmt.Errorf("failed to get followers: %w", err)
	}

	// Create notifications for all followers
	for _, follower := range followers {
		notification := &entities.Notification{
			ID:        uuid.NewV4(),
			UserID:    follower.FollowerID,
			Type:      entities.NotificationTypeFollow,
			Message:   event.Message,
			Read:      false,
			RelatedID: event.TargetID,
			CreatedAt: time.Now(),
		}

		if err := p.db.Create(notification).Error; err != nil {
			// Log error but continue processing other notifications
			// TODO: Use proper logger
			continue
		}
	}

	return nil
}

// processPostUpdatedEvent processes post update events
func (p *EventProcessor) processPostUpdatedEvent(event Event) error {
	// For post updates, we might want to notify users who have commented or bookmarked
	// This is a simplified implementation
	return nil
}

// processPostDeletedEvent processes post deletion events
func (p *EventProcessor) processPostDeletedEvent(event Event) error {
	// Clean up notifications related to the deleted post
	if err := p.db.Where("related_id = ?", event.TargetID).Delete(&entities.Notification{}).Error; err != nil {
		return fmt.Errorf("failed to clean up notifications: %w", err)
	}
	return nil
}

// processCommentAddedEvent processes comment addition events
func (p *EventProcessor) processCommentAddedEvent(event Event) error {
	// Get the post to find the author
	var post entities.Post
	if err := p.db.First(&post, "id = ?", event.TargetID).Error; err != nil {
		return fmt.Errorf("failed to get post: %w", err)
	}

	// Don't notify if the commenter is the post author
	if post.UserID == event.UserID {
		return nil
	}

	// Create notification for post author
	notification := &entities.Notification{
		ID:        uuid.NewV4(),
		UserID:    post.UserID,
		Type:      entities.NotificationTypeComment,
		Message:   event.Message,
		Read:      false,
		RelatedID: event.RelatedID, // Comment ID
		CreatedAt: time.Now(),
	}

	return p.db.Create(notification).Error
}

// processReplyAddedEvent processes reply addition events
func (p *EventProcessor) processReplyAddedEvent(event Event) error {
	// Get the comment to find the author
	var comment entities.Comment
	if err := p.db.First(&comment, "id = ?", event.TargetID).Error; err != nil {
		return fmt.Errorf("failed to get comment: %w", err)
	}

	// Don't notify if the replier is the comment author
	if comment.UserID == event.UserID {
		return nil
	}

	// Create notification for comment author
	notification := &entities.Notification{
		ID:        uuid.NewV4(),
		UserID:    comment.UserID,
		Type:      entities.NotificationTypeReply,
		Message:   event.Message,
		Read:      false,
		RelatedID: event.RelatedID, // Reply ID
		CreatedAt: time.Now(),
	}

	return p.db.Create(notification).Error
}

// processUserFollowedEvent processes user follow events
func (p *EventProcessor) processUserFollowedEvent(event Event) error {
	// Create notification for the followed user
	notification := &entities.Notification{
		ID:        uuid.NewV4(),
		UserID:    event.TargetID, // The user being followed
		Type:      entities.NotificationTypeFollow,
		Message:   event.Message,
		Read:      false,
		RelatedID: event.UserID, // The user who followed
		CreatedAt: time.Now(),
	}

	return p.db.Create(notification).Error
}

// SendPostNotification sends a notification for post-related events
func (p *EventProcessor) SendPostNotification(eventType EventType, userID, postID uuid.UUID, message string) error {
	event := Event{
		Type:     eventType,
		UserID:   userID,
		TargetID: postID,
		Message:  message,
	}
	return p.ProcessEvent(event)
}

// SendCommentNotification sends a notification for comment-related events
func (p *EventProcessor) SendCommentNotification(userID, postID, commentID uuid.UUID, message string) error {
	event := Event{
		Type:      EventTypeCommentAdded,
		UserID:    userID,
		TargetID:  postID,
		RelatedID: commentID,
		Message:   message,
	}
	return p.ProcessEvent(event)
}

// SendReplyNotification sends a notification for reply-related events
func (p *EventProcessor) SendReplyNotification(userID, commentID, replyID uuid.UUID, message string) error {
	event := Event{
		Type:      EventTypeReplyAdded,
		UserID:    userID,
		TargetID:  commentID,
		RelatedID: replyID,
		Message:   message,
	}
	return p.ProcessEvent(event)
}

// GetDefaultProcessor returns a default event processor instance
func GetDefaultProcessor(db *gorm.DB) *EventProcessor {
	return NewEventProcessor(db)
}
