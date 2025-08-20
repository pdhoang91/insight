package dto

// Bookmark requests
type CreateBookmarkRequest struct {
	PostID string `json:"post_id" validate:"required"`
}
