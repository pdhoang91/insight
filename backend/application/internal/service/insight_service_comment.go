package service

import (
	"fmt"
	"regexp"
	"time"

	"github.com/pdhoang91/blog/internal/entities"
	"github.com/pdhoang91/blog/internal/model"
	appError "github.com/pdhoang91/blog/pkg/error"
	uuid "github.com/satori/go.uuid"
	"gorm.io/gorm"
)

// ==================== COMMENT METHODS ====================

// GetPostComments retrieves comments for a post with replies and users
func (s *InsightService) GetPostComments(postID uuid.UUID, req *model.PaginationRequest) ([]*model.CommentResponse, int64, int64, error) {
	if req.Limit == 0 {
		req.Limit = 10
	}

	var comments []*entities.Comment
	var totalComments int64

	// Count total comments for the post
	if err := s.DBR2.Model(&entities.Comment{}).Where("post_id = ?", postID).Count(&totalComments).Error; err != nil {
		return nil, 0, 0, appError.InternalServerError("Failed to count comments", err)
	}

	// Get comments with preloaded replies and users
	offset := req.Offset
	if err := s.DBR2.Preload("Replies.User").Preload("User").
		Where("post_id = ?", postID).
		Order("created_at desc").
		Limit(req.Limit).
		Offset(offset).
		Find(&comments).Error; err != nil {
		return nil, 0, 0, appError.InternalServerError("Failed to fetch comments", err)
	}

	// Calculate total comment + reply count
	totalCommentReply := totalComments
	for _, comment := range comments {
		totalCommentReply += int64(len(comment.Replies))
	}

	var responses []*model.CommentResponse
	for _, comment := range comments {
		responses = append(responses, model.NewCommentResponse(comment))
	}

	return responses, totalComments, totalCommentReply, nil
}

// CreateComment creates a new comment for a post
func (s *InsightService) CreateComment(userID uuid.UUID, req *model.CreateCommentRequest) (*model.CommentResponse, error) {
	// Convert PostID from string to UUID
	postID, err := uuid.FromString(req.PostID)
	if err != nil {
		return nil, appError.BadRequest("Invalid post ID", err)
	}

	// Check if user exists
	user, err := s.User.FindByID(s.DB, userID)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, appError.BadRequest("Invalid user: User not found", err)
		}
		return nil, appError.InternalServerError("Failed to check user", err)
	}

	// Create comment
	comment := &entities.Comment{
		ID:        uuid.NewV4(),
		PostID:    postID,
		UserID:    userID,
		Content:   req.Content,
		CreatedAt: time.Now(),
	}

	if err := comment.Create(s.DB); err != nil {
		return nil, appError.InternalServerError("Failed to create comment", err)
	}

	// Record user activity
	userActivity := &entities.UserActivity{
		ID:         uuid.NewV4(),
		UserID:     userID,
		PostID:     &comment.PostID,
		CommentID:  &comment.ID,
		ActionType: "comment_created",
		CreatedAt:  time.Now(),
	}
	// TODO: Create UserActivityRepo and use it
	if err := s.DB.Create(userActivity).Error; err != nil {
		// Log error but don't fail the comment creation
		// TODO: Use Logger to log this error
	}

	// Parse mentions from content
	mentionedUserIDs, err := s.parseMentions(comment.Content)
	if err != nil {
		// Log error but don't fail the comment creation
		// TODO: Use Logger to log this error
	}

	// Create notifications for mentioned users
	for _, mentionedUserID := range mentionedUserIDs {
		message := fmt.Sprintf("You were mentioned in a comment by %s.", user.Name)
		s.createNotification(mentionedUserID, entities.NotificationTypeMention, message, comment.ID)
	}

	// Preload User and Replies after creation
	if err := s.DB.Preload("User").Preload("Replies").First(comment, comment.ID).Error; err != nil {
		return nil, appError.InternalServerError("Failed to load comment details", err)
	}

	return model.NewCommentResponse(comment), nil
}

// UpdateComment updates a comment
func (s *InsightService) UpdateComment(userID uuid.UUID, id uuid.UUID, req *model.UpdateCommentRequest) (*model.CommentResponse, error) {
	comment, err := s.Comment.FindByID(s.DB, id)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, appError.NotFound("Comment not found", err)
		}
		return nil, appError.InternalServerError("Failed to get comment", err)
	}

	// Check if user owns the comment
	if comment.UserID != userID {
		return nil, appError.Forbidden("You can only update your own comments", nil)
	}

	if req.Content != "" {
		comment.Content = req.Content
	}

	if err := comment.Update(s.DB); err != nil {
		return nil, appError.InternalServerError("Failed to update comment", err)
	}

	return model.NewCommentResponse(comment), nil
}

// DeleteComment deletes a comment
func (s *InsightService) DeleteComment(userID uuid.UUID, id uuid.UUID) error {
	comment, err := s.Comment.FindByID(s.DB, id)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return appError.NotFound("Comment not found", err)
		}
		return appError.InternalServerError("Failed to get comment", err)
	}

	// Check if user owns the comment
	if comment.UserID != userID {
		return appError.Forbidden("You can only delete your own comments", nil)
	}

	if err := s.Comment.DeleteByID(s.DB, id); err != nil {
		return appError.InternalServerError("Failed to delete comment", err)
	}

	return nil
}

// ==================== REPLY METHODS ====================

// CreateReply creates a new reply to a comment
func (s *InsightService) CreateReply(userID uuid.UUID, req *model.CreateReplyRequest) (*model.ReplyResponse, error) {
	// Convert CommentID from string to UUID
	commentID, err := uuid.FromString(req.CommentID)
	if err != nil {
		return nil, appError.BadRequest("Invalid comment ID", err)
	}

	// Check if user exists
	_, err = s.User.FindByID(s.DB, userID)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, appError.BadRequest("User not found", err)
		}
		return nil, appError.InternalServerError("Failed to check user", err)
	}

	// Check if comment exists
	comment, err := s.Comment.FindByID(s.DB, commentID)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, appError.BadRequest("Comment not found", err)
		}
		return nil, appError.InternalServerError("Failed to check comment", err)
	}

	// Create reply
	reply := &entities.Reply{
		ID:        uuid.NewV4(),
		CommentID: commentID,
		PostID:    comment.PostID, // Set PostID from comment
		UserID:    userID,
		Content:   req.Content,
		CreatedAt: time.Now(),
	}

	if err := reply.Create(s.DB); err != nil {
		return nil, appError.InternalServerError("Failed to create reply", err)
	}

	// Record user activity
	userActivity := &entities.UserActivity{
		ID:         uuid.NewV4(),
		UserID:     userID,
		CommentID:  &reply.CommentID,
		ReplyID:    &reply.ID,
		ActionType: "reply_created",
		CreatedAt:  time.Now(),
	}
	// TODO: Create UserActivityRepo and use it
	if err := s.DB.Create(userActivity).Error; err != nil {
		// Log error but don't fail the reply creation
		// TODO: Use Logger to log this error
	}

	return model.NewReplyResponse(reply), nil
}

// GetCommentReplies retrieves replies for a comment
func (s *InsightService) GetCommentReplies(commentID uuid.UUID, req *model.PaginationRequest) ([]*model.ReplyResponse, int64, error) {
	if req.Limit == 0 {
		req.Limit = 20
	}

	replies, err := s.Reply.FindByCommentID(s.DBR2, commentID, req.Limit, req.Offset)
	if err != nil {
		return nil, 0, appError.InternalServerError("Failed to get replies", err)
	}

	var responses []*model.ReplyResponse
	for _, reply := range replies {
		responses = append(responses, model.NewReplyResponse(reply))
	}

	return responses, int64(len(responses)), nil
}

// UpdateReply updates a reply
func (s *InsightService) UpdateReply(userID uuid.UUID, id uuid.UUID, req *model.UpdateReplyRequest) (*model.ReplyResponse, error) {
	reply, err := s.Reply.FindByID(s.DB, id)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, appError.NotFound("Reply not found", err)
		}
		return nil, appError.InternalServerError("Failed to get reply", err)
	}

	// Check if user owns the reply
	if reply.UserID != userID {
		return nil, appError.Forbidden("You can only update your own replies", nil)
	}

	if req.Content != "" {
		reply.Content = req.Content
	}

	if err := reply.Update(s.DB); err != nil {
		return nil, appError.InternalServerError("Failed to update reply", err)
	}

	return model.NewReplyResponse(reply), nil
}

// DeleteReply deletes a reply
func (s *InsightService) DeleteReply(userID uuid.UUID, id uuid.UUID) error {
	reply, err := s.Reply.FindByID(s.DB, id)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return appError.NotFound("Reply not found", err)
		}
		return appError.InternalServerError("Failed to get reply", err)
	}

	// Check if user owns the reply
	if reply.UserID != userID {
		return appError.Forbidden("You can only delete your own replies", nil)
	}

	if err := s.Reply.DeleteByID(s.DB, id); err != nil {
		return appError.InternalServerError("Failed to delete reply", err)
	}

	return nil
}

// ==================== HELPER METHODS ====================

// parseMentions parses mentions from content and returns mentioned user IDs
func (s *InsightService) parseMentions(content string) ([]uuid.UUID, error) {
	mentionRegex := regexp.MustCompile(`@(\w+)`)
	matches := mentionRegex.FindAllStringSubmatch(content, -1)

	var userIDs []uuid.UUID
	for _, match := range matches {
		username := match[1]
		user, err := s.User.FindByUsername(s.DB, username)
		if err != nil {
			if err == gorm.ErrRecordNotFound {
				// If user doesn't exist, skip
				continue
			}
			return nil, err
		}
		userIDs = append(userIDs, user.ID)
	}
	return userIDs, nil
}

// createNotification creates a notification for a user
func (s *InsightService) createNotification(userID uuid.UUID, notificationType entities.NotificationType, message string, relatedID uuid.UUID) {
	notification := &entities.Notification{
		ID:        uuid.NewV4(),
		UserID:    userID,
		Type:      notificationType,
		Message:   message,
		Read:      false,
		RelatedID: relatedID,
		CreatedAt: time.Now(),
	}

	// TODO: Create NotificationRepo and use it
	if err := s.DB.Create(notification).Error; err != nil {
		// Log error but don't fail the main operation
		// TODO: Use Logger to log this error
	}
}
