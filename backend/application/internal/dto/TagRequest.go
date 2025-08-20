package dto

// Tag requests
type CreateTagRequest struct {
	Name string `json:"name" validate:"required,min=2,max=50"`
}

type UpdateTagRequest struct {
	Name string `json:"name,omitempty" validate:"omitempty,min=2,max=50"`
}
