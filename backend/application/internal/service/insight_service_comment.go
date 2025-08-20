package service

import (
	"time"

	"github.com/pdhoang91/blog/internal/entities"
	"github.com/pdhoang91/blog/internal/model"
	appError "github.com/pdhoang91/blog/pkg/error"
	"github.com/pdhoang91/blog/pkg/notification"
	uuid "github.com/satori/go.uuid"
	"gorm.io/gorm"
)

// ==================== COMMENT METHODS ====================

// GetPostComments retrieves comments for a post with pagination
func (s *InsightService) GetPostComments(postID uuid.UUID, req *model.PaginationRequest) ([]*model.CommentResponse, int64, int64, error) {
	if req.Limit == 0 {
		req.Limit = 10
	}

	// Count total comments
	var totalComments int64
	if err := s.DBR2.Model(&entities.Comment{}).Where("post_id = ?", postID).Count(&totalComments).Error; err != nil {
		return nil, 0, 0, appError.InternalServerError("Failed to count comments", err)
	}

	// Get comments with pagination
	var comments []*entities.Comment
	if err := s.DBR2.Preload("User").
		Where("post_id = ?", postID).
		Order("created_at DESC").
		Limit(req.Limit).
		Offset(req.Offset).
		Find(&comments).Error; err != nil {
		return nil, 0, 0, appError.InternalServerError("Failed to get comments", err)
	}

	// Count total replies for all comments
	var totalReplies int64
	if err := s.DBR2.Model(&entities.Reply{}).Where("post_id = ?", postID).Count(&totalReplies).Error; err != nil {
		return nil, 0, 0, appError.InternalServerError("Failed to count replies", err)
	}

	// Convert to response format
	var responses []*model.CommentResponse
	for _, comment := range comments {
		// Count replies for this comment
		var repliesCount int64
		if err := s.DBR2.Model(&entities.Reply{}).Where("comment_id = ?", comment.ID).Count(&repliesCount).Error; err == nil {
			comment.RepliesCount = uint64(repliesCount)
		}

		responses = append(responses, model.NewCommentResponse(comment))
	}

	return responses, totalComments, totalReplies, nil
}

// CreateComment creates a new comment
func (s *InsightService) CreateComment(userID uuid.UUID, req *model.CreateCommentRequest) (*model.CommentResponse, error) {
	// Parse post ID
	postID, err := uuid.FromString(req.PostID)
	if err != nil {
		return nil, appError.BadRequest("Invalid post ID format", err)
	}

	// Verify post exists
	_, err = s.Post.FindByID(s.DB, postID)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, appError.NotFound("Post not found", err)
		}
		return nil, appError.InternalServerError("Failed to verify post", err)
	}

	// Create comment
	comment := &entities.Comment{
		ID:        uuid.NewV4(),
		PostID:    postID,
		UserID:    userID,
		Content:   req.Content,
		CreatedAt: time.Now(),
	}

	if err := s.DB.Create(comment).Error; err != nil {
		return nil, appError.InternalServerError("Failed to create comment", err)
	}

	// Load user information
	if err := s.DB.Preload("User").First(comment, comment.ID).Error; err != nil {
		return nil, appError.InternalServerError("Failed to load comment with user", err)
	}

	// TODO: Create UserActivityRepo and use it
	s.createUserActivity(userID, "comment", postID)
	if err != nil {
		// TODO: Use Logger to log this error
	}

	// Send notification to post author using EventProcessor
	eventProcessor := notification.GetDefaultProcessor(s.DB)
	err = eventProcessor.SendCommentNotification(userID, postID, comment.ID, "New comment on your post")
	if err != nil {
		// Log error but don't fail the operation
		// TODO: Use proper logger
	}

	return model.NewCommentResponse(comment), nil
}

// UpdateComment updates a comment by ID
func (s *InsightService) UpdateComment(userID uuid.UUID, commentID uuid.UUID, req *model.UpdateCommentRequest) (*model.CommentResponse, error) {
	// Find comment
	var comment entities.Comment
	if err := s.DB.Where("id = ?", commentID).First(&comment).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, appError.NotFound("Comment not found", err)
		}
		return nil, appError.InternalServerError("Failed to find comment", err)
	}

	// Check ownership
	if comment.UserID != userID {
		return nil, appError.Forbidden("You can only update your own comments", nil)
	}

	// Update comment
	comment.Content = req.Content

	if err := s.DB.Save(&comment).Error; err != nil {
		return nil, appError.InternalServerError("Failed to update comment", err)
	}

	// Load user information
	if err := s.DB.Preload("User").First(&comment, comment.ID).Error; err != nil {
		return nil, appError.InternalServerError("Failed to load comment with user", err)
	}

	return model.NewCommentResponse(&comment), nil
}

// DeleteComment deletes a comment by ID
func (s *InsightService) DeleteComment(userID uuid.UUID, commentID uuid.UUID) error {
	// Find comment
	var comment entities.Comment
	if err := s.DB.Where("id = ?", commentID).First(&comment).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return appError.NotFound("Comment not found", err)
		}
		return appError.InternalServerError("Failed to find comment", err)
	}

	// Check ownership
	if comment.UserID != userID {
		return appError.Forbidden("You can only delete your own comments", nil)
	}

	// Start transaction
	tx := s.DB.Begin()
	if tx.Error != nil {
		return appError.InternalServerError("Failed to start transaction", tx.Error)
	}
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// Delete all replies to this comment
	if err := tx.Where("comment_id = ?", commentID).Delete(&entities.Reply{}).Error; err != nil {
		tx.Rollback()
		return appError.InternalServerError("Failed to delete comment replies", err)
	}

	// Delete the comment
	if err := tx.Delete(&comment).Error; err != nil {
		tx.Rollback()
		return appError.InternalServerError("Failed to delete comment", err)
	}

	// Commit transaction
	if err := tx.Commit().Error; err != nil {
		return appError.InternalServerError("Failed to commit transaction", err)
	}

	return nil
}

// CreateReply creates a new reply to a comment
func (s *InsightService) CreateReply(userID uuid.UUID, req *model.CreateReplyRequest) (*model.ReplyResponse, error) {
	// Parse IDs
	commentID, err := uuid.FromString(req.CommentID)
	if err != nil {
		return nil, appError.BadRequest("Invalid comment ID format", err)
	}

	postID, err := uuid.FromString(req.PostID)
	if err != nil {
		return nil, appError.BadRequest("Invalid post ID format", err)
	}

	// Verify comment exists
	var comment entities.Comment
	if err := s.DB.Where("id = ?", commentID).First(&comment).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, appError.NotFound("Comment not found", err)
		}
		return nil, appError.InternalServerError("Failed to verify comment", err)
	}

	// Create reply
	reply := &entities.Reply{
		ID:        uuid.NewV4(),
		CommentID: commentID,
		PostID:    postID,
		UserID:    userID,
		Content:   req.Content,
		CreatedAt: time.Now(),
	}

	if err := s.DB.Create(reply).Error; err != nil {
		return nil, appError.InternalServerError("Failed to create reply", err)
	}

	// Load user information
	if err := s.DB.Preload("User").First(reply, reply.ID).Error; err != nil {
		return nil, appError.InternalServerError("Failed to load reply with user", err)
	}

	// TODO: Create UserActivityRepo and use it
	s.createUserActivity(userID, "reply", postID)
	if err != nil {
		// TODO: Use Logger to log this error
	}

	// Send notification to comment author using EventProcessor
	eventProcessor := notification.GetDefaultProcessor(s.DB)
	err = eventProcessor.SendReplyNotification(userID, commentID, reply.ID, "New reply to your comment")
	if err != nil {
		// Log error but don't fail the operation
		// TODO: Use proper logger
	}

	return model.NewReplyResponse(reply), nil
}

// UpdateReply updates a reply by ID
func (s *InsightService) UpdateReply(userID uuid.UUID, replyID uuid.UUID, req *model.UpdateReplyRequest) (*model.ReplyResponse, error) {
	// Find reply
	var reply entities.Reply
	if err := s.DB.Where("id = ?", replyID).First(&reply).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, appError.NotFound("Reply not found", err)
		}
		return nil, appError.InternalServerError("Failed to find reply", err)
	}

	// Check ownership
	if reply.UserID != userID {
		return nil, appError.Forbidden("You can only update your own replies", nil)
	}

	// Update reply
	reply.Content = req.Content

	if err := s.DB.Save(&reply).Error; err != nil {
		return nil, appError.InternalServerError("Failed to update reply", err)
	}

	// Load user information
	if err := s.DB.Preload("User").First(&reply, reply.ID).Error; err != nil {
		return nil, appError.InternalServerError("Failed to load reply with user", err)
	}

	return model.NewReplyResponse(&reply), nil
}

// DeleteReply deletes a reply by ID
func (s *InsightService) DeleteReply(userID uuid.UUID, replyID uuid.UUID) error {
	// Find reply
	var reply entities.Reply
	if err := s.DB.Where("id = ?", replyID).First(&reply).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return appError.NotFound("Reply not found", err)
		}
		return appError.InternalServerError("Failed to find reply", err)
	}

	// Check ownership
	if reply.UserID != userID {
		return appError.Forbidden("You can only delete your own replies", nil)
	}

	// Delete the reply
	if err := s.DB.Delete(&reply).Error; err != nil {
		return appError.InternalServerError("Failed to delete reply", err)
	}

	return nil
}

// GetCommentReplies retrieves replies for a comment
func (s *InsightService) GetCommentReplies(commentID uuid.UUID, req *model.PaginationRequest) ([]*model.ReplyResponse, int64, error) {
	if req.Limit == 0 {
		req.Limit = 10
	}

	// Count total replies
	var total int64
	if err := s.DBR2.Model(&entities.Reply{}).Where("comment_id = ?", commentID).Count(&total).Error; err != nil {
		return nil, 0, appError.InternalServerError("Failed to count replies", err)
	}

	// Get replies with pagination
	var replies []*entities.Reply
	if err := s.DBR2.Preload("User").
		Where("comment_id = ?", commentID).
		Order("created_at ASC").
		Limit(req.Limit).
		Offset(req.Offset).
		Find(&replies).Error; err != nil {
		return nil, 0, appError.InternalServerError("Failed to get replies", err)
	}

	// Convert to response format
	var responses []*model.ReplyResponse
	for _, reply := range replies {
		responses = append(responses, model.NewReplyResponse(reply))
	}

	return responses, total, nil
}

// ==================== HELPER METHODS ====================

// createUserActivity creates a user activity record
func (s *InsightService) createUserActivity(userID uuid.UUID, actionType string, postID uuid.UUID) {
	activity := &entities.UserActivity{
		ID:         uuid.NewV4(),
		UserID:     userID,
		PostID:     &postID,
		ActionType: actionType,
		CreatedAt:  time.Now(),
	}

	// TODO: Create UserActivityRepo and use it
	if err := s.DB.Create(activity).Error; err != nil {
		// Log error but don't fail the main operation
		// TODO: Use Logger to log this error
	}
}
