// controller/manager.go
package controller

import (
	"fmt"
	"log"
)

// Global controller instances
var (
	ImageCtrl    *ImageController
	PostCtrl     *PostController
	SearchCtrl   *SearchController
	CommentCtrl  *CommentController
	UserCtrl     *UserController
	AuthCtrl     *AuthController
	CategoryCtrl *CategoryController
	TagCtrl      *TagController
)

// Controllers holds all controller instances
type Controllers struct {
	Image    *ImageController
	Post     *PostController
	Search   *SearchController
	Comment  *CommentController
	User     *UserController
	Auth     *AuthController
	Category *CategoryController
	Tag      *TagController
}

// InitControllers initializes all controllers
func InitControllers() (*Controllers, error) {
	log.Println("Initializing controllers...")

	// Initialize Image Controller
	var err error
	ImageCtrl, err = NewImageController()
	if err != nil {
		return nil, fmt.Errorf("failed to initialize ImageController: %w", err)
	}

	// Initialize Post Controller
	PostCtrl, err = NewPostController()
	if err != nil {
		return nil, fmt.Errorf("failed to initialize PostController: %w", err)
	}

	// Initialize Search Controller
	SearchCtrl, err = NewSearchController()
	if err != nil {
		return nil, fmt.Errorf("failed to initialize SearchController: %w", err)
	}

	// Initialize Comment Controller
	CommentCtrl, err = NewCommentController()
	if err != nil {
		return nil, fmt.Errorf("failed to initialize CommentController: %w", err)
	}

	// Initialize User Controller
	UserCtrl, err = NewUserController()
	if err != nil {
		return nil, fmt.Errorf("failed to initialize UserController: %w", err)
	}

	// Initialize Auth Controller
	AuthCtrl, err = NewAuthController()
	if err != nil {
		return nil, fmt.Errorf("failed to initialize AuthController: %w", err)
	}

	// Initialize Category Controller
	CategoryCtrl, err = NewCategoryController()
	if err != nil {
		return nil, fmt.Errorf("failed to initialize CategoryController: %w", err)
	}

	// Initialize Tag Controller
	TagCtrl, err = NewTagController()
	if err != nil {
		return nil, fmt.Errorf("failed to initialize TagController: %w", err)
	}

	controllers := &Controllers{
		Image:    ImageCtrl,
		Post:     PostCtrl,
		Search:   SearchCtrl,
		Comment:  CommentCtrl,
		User:     UserCtrl,
		Auth:     AuthCtrl,
		Category: CategoryCtrl,
		Tag:      TagCtrl,
	}

	log.Println("All controllers initialized successfully")
	return controllers, nil
}

// Getter functions for backward compatibility
func GetImageController() *ImageController {
	if ImageCtrl == nil {
		log.Fatal("Image controller not initialized. Call InitControllers() first.")
	}
	return ImageCtrl
}

func GetPostController() *PostController {
	if PostCtrl == nil {
		log.Fatal("Post controller not initialized. Call InitControllers() first.")
	}
	return PostCtrl
}

func GetSearchController() *SearchController {
	if SearchCtrl == nil {
		log.Fatal("Search controller not initialized. Call InitControllers() first.")
	}
	return SearchCtrl
}

func GetCommentController() *CommentController {
	if CommentCtrl == nil {
		log.Fatal("Comment controller not initialized. Call InitControllers() first.")
	}
	return CommentCtrl
}

func GetUserController() *UserController {
	if UserCtrl == nil {
		log.Fatal("User controller not initialized. Call InitControllers() first.")
	}
	return UserCtrl
}

func GetAuthController() *AuthController {
	if AuthCtrl == nil {
		log.Fatal("Auth controller not initialized. Call InitControllers() first.")
	}
	return AuthCtrl
}

func GetCategoryController() *CategoryController {
	if CategoryCtrl == nil {
		log.Fatal("Category controller not initialized. Call InitControllers() first.")
	}
	return CategoryCtrl
}

func GetTagController() *TagController {
	if TagCtrl == nil {
		log.Fatal("Tag controller not initialized. Call InitControllers() first.")
	}
	return TagCtrl
}
