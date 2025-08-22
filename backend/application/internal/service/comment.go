package service

import (
	"errors"
	"time"

	"github.com/pdhoang91/blog/internal/dto"
	"github.com/pdhoang91/blog/internal/entities"

	"github.com/pdhoang91/blog/pkg/notification"
	uuid "github.com/satori/go.uuid"
	"gorm.io/gorm"
)

// ==================== COMMENT METHODS ====================

// GetPostComments retrieves comments for a post with pagination
func (s *InsightService) GetPostComments(postID uuid.UUID, req *dto.PaginationRequest) ([]*dto.CommentResponse, int64, int64, error) {
	if req.Limit == 0 {
		req.Limit = 10
	}

	// Count total comments
	var totalComments int64
	if err := s.DB.Model(&entities.Comment{}).Where("post_id = ?", postID).Count(&totalComments).Error; err != nil {
		return nil, 0, 0, errors.New("internal server error")
	}

	// Get comments with pagination and preload replies with their users
	var comments []*entities.Comment
	if err := s.DB.Preload("User").Preload("Replies.User").
		Where("post_id = ?", postID).
		Order("created_at DESC").
		Limit(req.Limit).
		Offset(req.Offset).
		Find(&comments).Error; err != nil {
		return nil, 0, 0, errors.New("internal server error")
	}

	// Count total replies for all comments
	var totalReplies int64
	if err := s.DB.Model(&entities.Reply{}).Where("post_id = ?", postID).Count(&totalReplies).Error; err != nil {
		return nil, 0, 0, errors.New("internal server error")
	}

	// Optimize counts calculation with bulk queries to avoid N+1 problem
	if err := s.calculateCommentsAndRepliesCounts(comments); err != nil {
		// Log error but don't fail the request
		// TODO: Use proper logger
	}

	// Convert to response format
	var responses []*dto.CommentResponse
	for _, comment := range comments {
		responses = append(responses, dto.NewCommentResponse(comment))
	}

	return responses, totalComments, totalReplies, nil
}

// CreateComment creates a new comment
func (s *InsightService) CreateComment(userID uuid.UUID, req *dto.CreateCommentRequest) (*dto.CommentResponse, error) {
	// Parse post ID
	postID, err := uuid.FromString(req.PostID)
	if err != nil {
		return nil, errors.New("bad request")
	}

	// Verify post exists
	_, err = s.Post.FindByID(s.DB, postID)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, errors.New("not found")
		}
		return nil, errors.New("internal server error")
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
		return nil, errors.New("internal server error")
	}

	// Load user information
	if err := s.DB.Preload("User").First(comment, comment.ID).Error; err != nil {
		return nil, errors.New("internal server error")
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

	return dto.NewCommentResponse(comment), nil
}

// UpdateComment updates a comment by ID
func (s *InsightService) UpdateComment(userID uuid.UUID, commentID uuid.UUID, req *dto.UpdateCommentRequest) (*dto.CommentResponse, error) {
	// Find comment
	var comment entities.Comment
	if err := s.DB.Where("id = ?", commentID).First(&comment).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, errors.New("not found")
		}
		return nil, errors.New("internal server error")
	}

	// Check ownership
	if comment.UserID != userID {
		return nil, errors.New("forbidden")
	}

	// Update comment
	comment.Content = req.Content

	if err := s.DB.Save(&comment).Error; err != nil {
		return nil, errors.New("internal server error")
	}

	// Load user information
	if err := s.DB.Preload("User").First(&comment, comment.ID).Error; err != nil {
		return nil, errors.New("internal server error")
	}

	return dto.NewCommentResponse(&comment), nil
}

// DeleteComment deletes a comment by ID
func (s *InsightService) DeleteComment(userID uuid.UUID, commentID uuid.UUID) error {
	// Find comment
	var comment entities.Comment
	if err := s.DB.Where("id = ?", commentID).First(&comment).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return errors.New("not found")
		}
		return errors.New("internal server error")
	}

	// Check ownership
	if comment.UserID != userID {
		return errors.New("forbidden")
	}

	// Start transaction
	tx := s.DB.Begin()
	if tx.Error != nil {
		return errors.New("internal server error")
	}
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// Delete all replies to this comment
	if err := tx.Where("comment_id = ?", commentID).Delete(&entities.Reply{}).Error; err != nil {
		tx.Rollback()
		return errors.New("internal server error")
	}

	// Delete the comment
	if err := tx.Delete(&comment).Error; err != nil {
		tx.Rollback()
		return errors.New("internal server error")
	}

	// Commit transaction
	if err := tx.Commit().Error; err != nil {
		return errors.New("internal server error")
	}

	return nil
}

// CreateReply creates a new reply to a comment
func (s *InsightService) CreateReply(userID uuid.UUID, req *dto.CreateReplyRequest) (*dto.ReplyResponse, error) {
	// Parse IDs
	commentID, err := uuid.FromString(req.CommentID)
	if err != nil {
		return nil, errors.New("bad request")
	}

	postID, err := uuid.FromString(req.PostID)
	if err != nil {
		return nil, errors.New("bad request")
	}

	// Verify comment exists
	var comment entities.Comment
	if err := s.DB.Where("id = ?", commentID).First(&comment).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, errors.New("not found")
		}
		return nil, errors.New("internal server error")
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
		return nil, errors.New("internal server error")
	}

	// Load user information
	if err := s.DB.Preload("User").First(reply, reply.ID).Error; err != nil {
		return nil, errors.New("internal server error")
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

	return dto.NewReplyResponse(reply), nil
}

// UpdateReply updates a reply by ID
func (s *InsightService) UpdateReply(userID uuid.UUID, replyID uuid.UUID, req *dto.UpdateReplyRequest) (*dto.ReplyResponse, error) {
	// Find reply
	var reply entities.Reply
	if err := s.DB.Where("id = ?", replyID).First(&reply).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, errors.New("not found")
		}
		return nil, errors.New("internal server error")
	}

	// Check ownership
	if reply.UserID != userID {
		return nil, errors.New("forbidden")
	}

	// Update reply
	reply.Content = req.Content

	if err := s.DB.Save(&reply).Error; err != nil {
		return nil, errors.New("internal server error")
	}

	// Load user information
	if err := s.DB.Preload("User").First(&reply, reply.ID).Error; err != nil {
		return nil, errors.New("internal server error")
	}

	return dto.NewReplyResponse(&reply), nil
}

// DeleteReply deletes a reply by ID
func (s *InsightService) DeleteReply(userID uuid.UUID, replyID uuid.UUID) error {
	// Find reply
	var reply entities.Reply
	if err := s.DB.Where("id = ?", replyID).First(&reply).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return errors.New("not found")
		}
		return errors.New("internal server error")
	}

	// Check ownership
	if reply.UserID != userID {
		return errors.New("forbidden")
	}

	// Delete the reply
	if err := s.DB.Delete(&reply).Error; err != nil {
		return errors.New("internal server error")
	}

	return nil
}

// GetCommentReplies retrieves replies for a comment
func (s *InsightService) GetCommentReplies(commentID uuid.UUID, req *dto.PaginationRequest) ([]*dto.ReplyResponse, int64, error) {
	if req.Limit == 0 {
		req.Limit = 10
	}

	// Count total replies
	var total int64
	if err := s.DB.Model(&entities.Reply{}).Where("comment_id = ?", commentID).Count(&total).Error; err != nil {
		return nil, 0, errors.New("internal server error")
	}

	// Get replies with pagination
	var replies []*entities.Reply
	if err := s.DB.Preload("User").
		Where("comment_id = ?", commentID).
		Order("created_at ASC").
		Limit(req.Limit).
		Offset(req.Offset).
		Find(&replies).Error; err != nil {
		return nil, 0, errors.New("internal server error")
	}

	// Convert to response format
	var responses []*dto.ReplyResponse
	for _, reply := range replies {
		responses = append(responses, dto.NewReplyResponse(reply))
	}

	return responses, total, nil
}

// ==================== HELPER METHODS ====================

// calculateCommentsAndRepliesCounts calculates clap counts and reply counts efficiently
func (s *InsightService) calculateCommentsAndRepliesCounts(comments []*entities.Comment) error {
	if len(comments) == 0 {
		return nil
	}

	// Extract comment IDs and reply IDs
	commentIDs := make([]uuid.UUID, len(comments))
	var replyIDs []uuid.UUID

	for i, comment := range comments {
		commentIDs[i] = comment.ID
		for _, reply := range comment.Replies {
			replyIDs = append(replyIDs, reply.ID)
		}
	}

	// Bulk query for comment reply counts
	type ReplyCountResult struct {
		CommentID  uuid.UUID `json:"comment_id"`
		ReplyCount int64     `json:"reply_count"`
	}
	var replyCounts []ReplyCountResult
	if err := s.DB.Model(&entities.Reply{}).
		Select("comment_id, COUNT(*) as reply_count").
		Where("comment_id IN ?", commentIDs).
		Group("comment_id").
		Scan(&replyCounts).Error; err != nil {
		return err
	}

	// Bulk query for comment clap counts
	type ClapCountResult struct {
		CommentID uuid.UUID `json:"comment_id"`
		ClapCount int64     `json:"clap_count"`
	}
	var commentClaps []ClapCountResult
	if err := s.DB.Model(&entities.UserActivity{}).
		Select("comment_id, COALESCE(SUM(count), 0) as clap_count").
		Where("comment_id IN ? AND action_type = ?", commentIDs, "clap_comment").
		Group("comment_id").
		Scan(&commentClaps).Error; err != nil {
		return err
	}

	// Bulk query for reply clap counts (if there are replies)
	var replyClaps []struct {
		ReplyID   uuid.UUID `json:"reply_id"`
		ClapCount int64     `json:"clap_count"`
	}
	if len(replyIDs) > 0 {
		if err := s.DB.Model(&entities.UserActivity{}).
			Select("reply_id, COALESCE(SUM(count), 0) as clap_count").
			Where("reply_id IN ? AND action_type = ?", replyIDs, "clap_reply").
			Group("reply_id").
			Scan(&replyClaps).Error; err != nil {
			return err
		}
	}

	// Create maps for quick lookup
	replyCountMap := make(map[uuid.UUID]int64)
	for _, result := range replyCounts {
		replyCountMap[result.CommentID] = result.ReplyCount
	}

	commentClapMap := make(map[uuid.UUID]int64)
	for _, result := range commentClaps {
		commentClapMap[result.CommentID] = result.ClapCount
	}

	replyClapMap := make(map[uuid.UUID]int64)
	for _, result := range replyClaps {
		replyClapMap[result.ReplyID] = result.ClapCount
	}

	// Assign counts to comments and replies
	for _, comment := range comments {
		comment.RepliesCount = uint64(replyCountMap[comment.ID])
		comment.ClapCount = uint64(commentClapMap[comment.ID])

		// Assign clap counts to replies
		for i := range comment.Replies {
			comment.Replies[i].ClapCount = uint64(replyClapMap[comment.Replies[i].ID])
		}
	}

	return nil
}

// createUserActivity creates a user activity record
func (s *InsightService) createUserActivity(userID uuid.UUID, actionType string, postID uuid.UUID) {
	activity := &entities.UserActivity{
		ID:         uuid.NewV4(),
		UserID:     userID,
		PostID:     &postID,
		ActionType: actionType,
		Count:      1,
		CreatedAt:  time.Now(),
	}

	// TODO: Create UserActivityRepo and use it
	if err := s.DB.Create(activity).Error; err != nil {
		// Log error but don't fail the main operation
		// TODO: Use Logger to log this error
	}
}

// GetComment retrieves a comment by ID
func (s *InsightService) GetComment(id uuid.UUID) (*dto.CommentResponse, error) {
	comment, err := s.Comment.FindByID(s.DB, id)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, errors.New("not found")
		}
		return nil, errors.New("internal server error")
	}

	return dto.NewCommentResponse(comment), nil
}
