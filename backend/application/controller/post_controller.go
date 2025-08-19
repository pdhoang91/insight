// controller/post_controller.go
package controller

import (
	"github.com/pdhoang91/blog/services"
)

// PostController handles post-related operations
type PostController struct {
	postImageService *services.PostImageService
}

// NewPostController creates a new post controller
func NewPostController() (*PostController, error) {
	postImageService, err := services.NewPostImageService()
	if err != nil {
		return nil, err
	}

	return &PostController{
		postImageService: postImageService,
	}, nil
}

// All existing post handler functions will be moved here as methods
// For now, we keep the existing functions as they are
// and will refactor them to use this controller instance
