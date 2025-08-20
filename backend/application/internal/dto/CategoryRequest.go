package dto

// Category requests
type CreateCategoryRequest struct {
	Name        string `json:"name" validate:"required,min=2,max=100"`
	Description string `json:"description,omitempty"`
}

type UpdateCategoryRequest struct {
	Name        string `json:"name,omitempty" validate:"omitempty,min=2,max=100"`
	Description string `json:"description,omitempty"`
}
