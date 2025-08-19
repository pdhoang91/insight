// controller/user_controller.go
package controller

// UserController handles user-related operations
type UserController struct {
	// Add user service dependencies here when needed
}

// NewUserController creates a new user controller
func NewUserController() (*UserController, error) {
	return &UserController{}, nil
}

// All existing user handler functions will be moved here as methods
// For now, we keep the existing functions as they are
// and will refactor them to use this controller instance
