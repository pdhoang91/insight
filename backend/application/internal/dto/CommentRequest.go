package dto

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
