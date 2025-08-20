package dto

import (
	"time"

	"github.com/pdhoang91/blog/internal/entities"
	uuid "github.com/satori/go.uuid"
)

// Bookmark responses
type BookmarkResponse struct {
	ID           uuid.UUID     `json:"id"`
	PostID       uuid.UUID     `json:"post_id"`
	UserID       uuid.UUID     `json:"user_id"`
	IsBookmarked bool          `json:"is_bookmarked"`
	CreatedAt    time.Time     `json:"created_at"`
	UpdatedAt    time.Time     `json:"updated_at"`
	Post         *PostResponse `json:"post,omitempty"`
	User         *UserResponse `json:"user,omitempty"`
}

func NewBookmarkResponse(bookmark *entities.Bookmark) *BookmarkResponse {
	response := &BookmarkResponse{
		ID:           bookmark.ID,
		PostID:       bookmark.PostID,
		UserID:       bookmark.UserID,
		IsBookmarked: bookmark.IsBookmarked,
		CreatedAt:    bookmark.CreatedAt,
		UpdatedAt:    bookmark.UpdatedAt,
	}

	if bookmark.Post.ID != uuid.Nil {
		response.Post = NewPostResponse(&bookmark.Post)
	}

	if bookmark.User.ID != uuid.Nil {
		response.User = NewUserResponse(&bookmark.User)
	}

	return response
}
