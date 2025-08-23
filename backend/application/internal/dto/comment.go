package dto

import (
	"time"

	"github.com/pdhoang91/blog/internal/entities"
	uuid "github.com/satori/go.uuid"
)

// Comment requests
type CreateCommentRequest struct {
	PostID  string `json:"post_id" validate:"required,uuid"`
	Content string `json:"content" validate:"required,min=1,max=1000"`
}

type UpdateCommentRequest struct {
	Content string `json:"content" validate:"required,min=1,max=1000"`
}

// Reply requests
type CreateReplyRequest struct {
	CommentID string `json:"comment_id" validate:"required,uuid"`
	PostID    string `json:"post_id" validate:"required,uuid"`
	Content   string `json:"content" validate:"required,min=1,max=1000"`
}

type UpdateReplyRequest struct {
	Content string `json:"content" validate:"required,min=1,max=1000"`
}

// Comment responses
type CommentResponse struct {
	ID           uuid.UUID        `json:"id"`
	PostID       uuid.UUID        `json:"post_id"`
	Content      string           `json:"content"`
	ClapCount    uint64           `json:"clap_count"`
	RepliesCount uint64           `json:"replies_count"`
	CreatedAt    time.Time        `json:"created_at"`
	User         *UserResponse    `json:"user,omitempty"`
	Replies      []*ReplyResponse `json:"replies,omitempty"`
}

func NewCommentResponse(comment *entities.Comment) *CommentResponse {
	response := &CommentResponse{
		ID:           comment.ID,
		PostID:       comment.PostID,
		Content:      comment.Content,
		ClapCount:    comment.ClapCount,
		RepliesCount: comment.RepliesCount,
		CreatedAt:    comment.CreatedAt,
	}

	if comment.User.ID != uuid.Nil {
		response.User = NewUserResponse(&comment.User)
	}

	for _, reply := range comment.Replies {
		response.Replies = append(response.Replies, NewReplyResponse(&reply))
	}

	return response
}

// Reply responses
type ReplyResponse struct {
	ID         uuid.UUID     `json:"id"`
	CommentID  uuid.UUID     `json:"comment_id"`
	PostID     uuid.UUID     `json:"post_id"`
	Content    string        `json:"content"`
	CountReply uint64        `json:"count_reply"`
	ClapCount  uint64        `json:"clap_count"`
	CreatedAt  time.Time     `json:"created_at"`
	User       *UserResponse `json:"user,omitempty"`
}

func NewReplyResponse(reply *entities.Reply) *ReplyResponse {
	response := &ReplyResponse{
		ID:         reply.ID,
		CommentID:  reply.CommentID,
		PostID:     reply.PostID,
		Content:    reply.Content,
		CountReply: reply.CountReply,
		ClapCount:  reply.ClapCount,
		CreatedAt:  reply.CreatedAt,
	}

	if reply.User.ID != uuid.Nil {
		response.User = NewUserResponse(&reply.User)
	}

	return response
}
