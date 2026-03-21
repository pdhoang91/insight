package dto

import (
	"encoding/json"
	"time"

	"github.com/pdhoang91/blog/internal/entities"
	uuid "github.com/satori/go.uuid"
)

// Post requests
type CreatePostRequest struct {
	Title      string          `json:"title" validate:"required,min=5,max=200"`
	CoverImage string          `json:"cover_image,omitempty"`
	Excerpt    string          `json:"excerpt,omitempty" validate:"omitempty,min=10,max=500"`
	Content    json.RawMessage `json:"content" validate:"required"`
	CategoryNames []string     `json:"categories,omitempty"`
	TagNames      []string     `json:"tags,omitempty"`
}

type UpdatePostRequest struct {
	Title      string          `json:"title,omitempty" validate:"omitempty,min=5,max=200"`
	CoverImage string          `json:"cover_image,omitempty"`
	Excerpt    string          `json:"excerpt,omitempty" validate:"omitempty,min=10,max=500"`
	Content    json.RawMessage `json:"content,omitempty"`
	CategoryNames *[]string    `json:"categories,omitempty"`
	TagNames      *[]string    `json:"tags,omitempty"`
}

// Post responses
type PostResponse struct {
	ID            uuid.UUID           `json:"id"`
	Title         string              `json:"title"`
	Slug          string              `json:"slug"`
	Excerpt       string              `json:"excerpt"`
	CoverImage    string              `json:"cover_image"`
	Content       json.RawMessage     `json:"content,omitempty"`
	Views         uint64              `json:"views"`
	ClapCount     uint64              `json:"clap_count"`
	CommentsCount uint64              `json:"comments_count"`
	AverageRating float64             `json:"average_rating"`
	CreatedAt     time.Time           `json:"created_at"`
	UpdatedAt     time.Time           `json:"updated_at"`
	User          *UserResponse       `json:"user,omitempty"`
	Categories    []*CategoryResponse `json:"categories,omitempty"`
	Tags          []*TagResponse      `json:"tags,omitempty"`
}

func NewPostResponse(post *entities.Post) *PostResponse {
	response := &PostResponse{
		ID:            post.ID,
		Title:         post.Title,
		Slug:          post.Slug,
		Excerpt:       post.Excerpt,
		CoverImage:    post.CoverImage,
		Content:       post.Content,
		Views:         post.Views,
		ClapCount:     post.ClapCount,
		CommentsCount: post.CommentsCount,
		AverageRating: post.AverageRating,
		CreatedAt:     post.CreatedAt,
		UpdatedAt:     post.UpdatedAt,
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
