package dto

import (
	"github.com/pdhoang91/blog/internal/entities"
	uuid "github.com/satori/go.uuid"
	"time"
)

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

// Post responses
type PostResponse struct {
	ID             uuid.UUID           `json:"id"`
	Title          string              `json:"title"`
	ImageTitle     string              `json:"image_title"`
	TitleName      string              `json:"title_name"`
	PreviewContent string              `json:"preview_content"`
	Content        string              `json:"content,omitempty"`
	Views          uint64              `json:"views"`
	ClapCount      uint64              `json:"clap_count"`
	CommentsCount  uint64              `json:"comments_count"`
	AverageRating  float64             `json:"average_rating"`
	CreatedAt      time.Time           `json:"created_at"`
	UpdatedAt      time.Time           `json:"updated_at"`
	User           *UserResponse       `json:"user,omitempty"`
	Categories     []*CategoryResponse `json:"categories,omitempty"`
	Tags           []*TagResponse      `json:"tags,omitempty"`
}

func NewPostResponse(post *entities.Post) *PostResponse {
	response := &PostResponse{
		ID:             post.ID,
		Title:          post.Title,
		ImageTitle:     post.ImageTitle,
		TitleName:      post.TitleName,
		PreviewContent: post.PreviewContent,
		Content:        post.Content,
		Views:          post.Views,
		ClapCount:      post.ClapCount,
		CommentsCount:  post.CommentsCount,
		AverageRating:  post.AverageRating,
		CreatedAt:      post.CreatedAt,
		UpdatedAt:      post.UpdatedAt,
	}

	if post.User.ID != uuid.Nil {
		response.User = NewUserResponse(&post.User)
	}

	for _, category := range post.Categories {
		response.Categories = append(response.Categories, NewCategoryResponse(&category))
	}

	for _, tag := range post.Tags {
		response.Tags = append(response.Tags, NewTagResponse(&tag))
	}

	return response
}
