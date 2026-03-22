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

// parseCursor parses an RFC3339 cursor string into *time.Time. Returns nil on empty/invalid input.
func parseCursor(s string) *time.Time {
	if s == "" {
		return nil
	}
	t, err := time.Parse(time.RFC3339Nano, s)
	if err != nil {
		return nil
	}
	return &t
}

// nextCursorStr returns the RFC3339Nano created_at of the last item as the next cursor,
// or nil if the page was smaller than limit (no more data).
func nextCursorStr(createdAt time.Time, count, limit int) *string {
	if count < limit {
		return nil
	}
	s := createdAt.UTC().Format(time.RFC3339Nano)
	return &s
}

// GetPostComments retrieves comments for a post using cursor (keyset) pagination.
// Returns (comments, totalCount, nextCursor, error).
// nextCursor is nil when there are no more pages.
func (s *InsightService) GetPostComments(postID uuid.UUID, req *dto.CursorRequest) ([]*dto.CommentResponse, int64, *string, error) {
	if req.Limit == 0 {
		req.Limit = 10
	}

	totalComments, err := s.CommentRepo.CountByPostID(postID)
	if err != nil {
		return nil, 0, nil, apperror.NewInternal("failed to count comments", err)
	}

	cursor := parseCursor(req.Cursor)
	comments, err := s.CommentRepo.FindByPostIDCursor(postID, cursor, req.Limit)
	if err != nil {
		return nil, 0, nil, apperror.NewInternal("failed to get comments", err)
	}

	_ = s.ReplyRepo.CalculateReplyCounts(comments)

	responses := make([]*dto.CommentResponse, 0, len(comments))
	for _, comment := range comments {
		responses = append(responses, dto.NewCommentResponse(comment))
	}

	var next *string
	if len(comments) > 0 {
		next = nextCursorStr(comments[len(comments)-1].CreatedAt, len(comments), req.Limit)
	}
	return responses, totalComments, next, nil
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

// GetCommentReplies retrieves replies for a comment using cursor (keyset) pagination.
// Returns (replies, nextCursor, error).
// nextCursor is nil when there are no more pages.
func (s *InsightService) GetCommentReplies(commentID uuid.UUID, req *dto.CursorRequest) ([]*dto.ReplyResponse, *string, error) {
	if req.Limit == 0 {
		req.Limit = 10
	}

	cursor := parseCursor(req.Cursor)
	replies, err := s.ReplyRepo.FindByCommentIDCursor(commentID, cursor, req.Limit)
	if err != nil {
		return nil, nil, apperror.NewInternal("failed to get replies", err)
	}

	responses := make([]*dto.ReplyResponse, 0, len(replies))
	for _, reply := range replies {
		responses = append(responses, dto.NewReplyResponse(reply))
	}

	var next *string
	if len(replies) > 0 {
		next = nextCursorStr(replies[len(replies)-1].CreatedAt, len(replies), req.Limit)
	}
	return responses, next, nil
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

