package service

import (
	"errors"
	"time"

	"github.com/pdhoang91/blog/internal/apperror"
	"github.com/pdhoang91/blog/internal/dto"
	"github.com/pdhoang91/blog/internal/entities"
	uuid "github.com/satori/go.uuid"
	"gorm.io/gorm"
)

// GetPostComments retrieves comments for a post with pagination
func (s *InsightService) GetPostComments(postID uuid.UUID, req *dto.PaginationRequest) ([]*dto.CommentResponse, int64, int64, error) {
	if req.Limit == 0 {
		req.Limit = 10
	}

	totalComments, err := s.CommentRepo.CountByPostID(postID)
	if err != nil {
		return nil, 0, 0, apperror.NewInternal("failed to count comments", err)
	}

	comments, err := s.CommentRepo.FindByPostID(postID, req.Limit, req.Offset)
	if err != nil {
		return nil, 0, 0, apperror.NewInternal("failed to get comments", err)
	}

	totalReplies, err := s.ReplyRepo.CountByPostID(postID)
	if err != nil {
		return nil, 0, 0, apperror.NewInternal("failed to count replies", err)
	}

	_ = s.UserActivityRepo.CalculateCommentsAndRepliesCounts(comments)

	responses := make([]*dto.CommentResponse, 0, len(comments))
	for _, comment := range comments {
		responses = append(responses, dto.NewCommentResponse(comment))
	}
	return responses, totalComments, totalReplies, nil
}

// CreateComment creates a new comment
func (s *InsightService) CreateComment(userID uuid.UUID, req *dto.CreateCommentRequest) (*dto.CommentResponse, error) {
	postID, err := uuid.FromString(req.PostID)
	if err != nil {
		return nil, apperror.NewBadRequest("invalid post ID")
	}

	if _, err := s.PostRepo.FindByID(postID); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apperror.NewNotFound("post not found")
		}
		return nil, apperror.NewInternal("failed to verify post", err)
	}

	comment := &entities.Comment{
		ID: uuid.NewV4(), PostID: postID, UserID: userID,
		Content: req.Content, CreatedAt: time.Now(),
	}

	if err := s.CommentRepo.Create(comment); err != nil {
		return nil, apperror.NewInternal("failed to create comment", err)
	}

	comment, err = s.CommentRepo.FindByID(comment.ID)
	if err != nil {
		return nil, apperror.NewInternal("failed to load comment user", err)
	}

	s.createUserActivity(userID, "comment", postID)
	// Increment denormalized count (best-effort)
	_ = s.PostRepo.IncrementCommentCount(postID)

	return dto.NewCommentResponse(comment), nil
}

// UpdateComment updates a comment by ID
func (s *InsightService) UpdateComment(userID uuid.UUID, commentID uuid.UUID, req *dto.UpdateCommentRequest) (*dto.CommentResponse, error) {
	comment, err := s.CommentRepo.FindByID(commentID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apperror.NewNotFound("comment not found")
		}
		return nil, apperror.NewInternal("failed to find comment", err)
	}

	if comment.UserID != userID {
		return nil, apperror.NewForbidden("you do not own this comment")
	}

	comment.Content = req.Content
	if err := s.CommentRepo.Update(comment); err != nil {
		return nil, apperror.NewInternal("failed to update comment", err)
	}

	comment, err = s.CommentRepo.FindByID(comment.ID)
	if err != nil {
		return nil, apperror.NewInternal("failed to load comment user", err)
	}

	return dto.NewCommentResponse(comment), nil
}

// DeleteComment deletes a comment by ID
func (s *InsightService) DeleteComment(userID uuid.UUID, commentID uuid.UUID) error {
	comment, err := s.CommentRepo.FindByID(commentID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return apperror.NewNotFound("comment not found")
		}
		return apperror.NewInternal("failed to find comment", err)
	}

	if comment.UserID != userID {
		return apperror.NewForbidden("you do not own this comment")
	}

	if err := s.ReplyRepo.DeleteByCommentID(commentID); err != nil {
		return apperror.NewInternal("failed to delete replies", err)
	}

	if err := s.CommentRepo.Delete(comment); err != nil {
		return apperror.NewInternal("failed to delete comment", err)
	}

	// Decrement denormalized count (best-effort)
	_ = s.PostRepo.DecrementCommentCount(comment.PostID)

	return nil
}

// CreateReply creates a new reply to a comment
func (s *InsightService) CreateReply(userID uuid.UUID, req *dto.CreateReplyRequest) (*dto.ReplyResponse, error) {
	commentID, err := uuid.FromString(req.CommentID)
	if err != nil {
		return nil, apperror.NewBadRequest("invalid comment ID")
	}

	postID, err := uuid.FromString(req.PostID)
	if err != nil {
		return nil, apperror.NewBadRequest("invalid post ID")
	}

	if _, err := s.CommentRepo.FindByID(commentID); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apperror.NewNotFound("comment not found")
		}
		return nil, apperror.NewInternal("failed to verify comment", err)
	}

	reply := &entities.Reply{
		ID: uuid.NewV4(), CommentID: commentID, PostID: postID,
		UserID: userID, Content: req.Content, CreatedAt: time.Now(),
	}

	if err := s.ReplyRepo.Create(reply); err != nil {
		return nil, apperror.NewInternal("failed to create reply", err)
	}

	reply, err = s.ReplyRepo.FindByID(reply.ID)
	if err != nil {
		return nil, apperror.NewInternal("failed to load reply user", err)
	}

	s.createUserActivity(userID, "reply", postID)

	return dto.NewReplyResponse(reply), nil
}

func (s *InsightService) DeleteReply(userID uuid.UUID, replyID uuid.UUID) error {
	reply, err := s.ReplyRepo.FindByID(replyID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return apperror.NewNotFound("reply not found")
		}
		return apperror.NewInternal("failed to find reply", err)
	}

	if reply.UserID != userID {
		return apperror.NewForbidden("you do not own this reply")
	}

	if err := s.ReplyRepo.Delete(reply); err != nil {
		return apperror.NewInternal("failed to delete reply", err)
	}
	return nil
}

// GetCommentReplies retrieves replies for a comment
func (s *InsightService) GetCommentReplies(commentID uuid.UUID, req *dto.PaginationRequest) ([]*dto.ReplyResponse, int64, error) {
	if req.Limit == 0 {
		req.Limit = 10
	}

	total, err := s.ReplyRepo.CountByCommentID(commentID)
	if err != nil {
		return nil, 0, apperror.NewInternal("failed to count replies", err)
	}

	replies, err := s.ReplyRepo.FindByCommentID(commentID, req.Limit, req.Offset)
	if err != nil {
		return nil, 0, apperror.NewInternal("failed to get replies", err)
	}

	responses := make([]*dto.ReplyResponse, 0, len(replies))
	for _, reply := range replies {
		responses = append(responses, dto.NewReplyResponse(reply))
	}
	return responses, total, nil
}

// GetComment retrieves a comment by ID
func (s *InsightService) GetComment(id uuid.UUID) (*dto.CommentResponse, error) {
	comment, err := s.CommentRepo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apperror.NewNotFound("comment not found")
		}
		return nil, apperror.NewInternal("failed to get comment", err)
	}
	return dto.NewCommentResponse(comment), nil
}

// createUserActivity creates a user activity record (best-effort)
func (s *InsightService) createUserActivity(userID uuid.UUID, actionType string, postID uuid.UUID) {
	activity := &entities.UserActivity{
		ID: uuid.NewV4(), UserID: userID, PostID: &postID,
		ActionType: actionType, Count: 1, CreatedAt: time.Now(),
	}
	_ = s.UserActivityRepo.Create(activity)
}
