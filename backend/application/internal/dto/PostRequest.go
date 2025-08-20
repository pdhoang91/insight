package dto

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
