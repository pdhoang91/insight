package dto

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
