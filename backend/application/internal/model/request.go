package model

// User requests
type CreateUserRequest struct {
	Name     string `json:"name" validate:"required,min=2,max=100"`
	Email    string `json:"email" validate:"required,email"`
	Username string `json:"username" validate:"required,min=3,max=50"`
	Password string `json:"password" validate:"required,min=6"`
}

type UpdateUserRequest struct {
	Name     string `json:"name,omitempty" validate:"omitempty,min=2,max=100"`
	Username string `json:"username,omitempty" validate:"omitempty,min=3,max=50"`
	Bio      string `json:"bio,omitempty"`
	Phone    string `json:"phone,omitempty"`
	Dob      string `json:"dob,omitempty"`
}

type LoginRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
}

// Post requests
type CreatePostRequest struct {
	Title          string   `json:"title" validate:"required,min=5,max=200"`
	PreviewContent string   `json:"preview_content" validate:"required,min=10,max=500"`
	Content        string   `json:"content" validate:"required,min=50"`
	CategoryIDs    []string `json:"category_ids,omitempty"`
	TagNames       []string `json:"tag_names,omitempty"`
}

type UpdatePostRequest struct {
	Title          string   `json:"title,omitempty" validate:"omitempty,min=5,max=200"`
	PreviewContent string   `json:"preview_content,omitempty" validate:"omitempty,min=10,max=500"`
	Content        string   `json:"content,omitempty" validate:"omitempty,min=50"`
	CategoryIDs    []string `json:"category_ids,omitempty"`
	TagNames       []string `json:"tag_names,omitempty"`
}

// Category requests
type CreateCategoryRequest struct {
	Name        string `json:"name" validate:"required,min=2,max=100"`
	Description string `json:"description,omitempty"`
}

type UpdateCategoryRequest struct {
	Name        string `json:"name,omitempty" validate:"omitempty,min=2,max=100"`
	Description string `json:"description,omitempty"`
}

// Tag requests
type CreateTagRequest struct {
	Name string `json:"name" validate:"required,min=2,max=50"`
}

type UpdateTagRequest struct {
	Name string `json:"name,omitempty" validate:"omitempty,min=2,max=50"`
}

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

// Search requests
type SearchRequest struct {
	Query  string `json:"query" validate:"required,min=1"`
	Limit  int    `json:"limit,omitempty" validate:"omitempty,min=1,max=100"`
	Offset int    `json:"offset,omitempty" validate:"omitempty,min=0"`
}

// Bookmark requests
type CreateBookmarkRequest struct {
	PostID string `json:"post_id" validate:"required"`
}

// Pagination request
type PaginationRequest struct {
	Page   int `form:"page" json:"page,omitempty"`
	Limit  int `form:"limit" json:"limit,omitempty" validate:"omitempty,min=1,max=100"`
	Offset int `json:"offset,omitempty" validate:"omitempty,min=0"`
}
