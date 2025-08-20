package model

import (
	"time"

	"github.com/pdhoang91/blog/internal/entities"
	uuid "github.com/satori/go.uuid"
)

// Standard API responses
type SuccessResponse struct {
	Status string      `json:"status"`
	Code   int         `json:"code"`
	Data   interface{} `json:"data"`
}

type ErrorResponse struct {
	Status  string `json:"status"`
	Code    int    `json:"code"`
	Message string `json:"message"`
}

type PaginatedResponse struct {
	Status string      `json:"status"`
	Code   int         `json:"code"`
	Data   interface{} `json:"data"`
	Meta   MetaData    `json:"meta"`
}

type MetaData struct {
	Total  int64 `json:"total"`
	Limit  int   `json:"limit"`
	Offset int   `json:"offset"`
}

// User responses
type UserResponse struct {
	ID            uuid.UUID `json:"id"`
	Email         string    `json:"email"`
	Name          string    `json:"name"`
	Username      string    `json:"username"`
	AvatarURL     string    `json:"avatar_url"`
	Bio           string    `json:"bio"`
	Phone         string    `json:"phone"`
	Dob           string    `json:"dob"`
	Role          string    `json:"role"`
	EmailVerified bool      `json:"email_verified"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

func NewUserResponse(user *entities.User) *UserResponse {
	return &UserResponse{
		ID:            user.ID,
		Email:         user.Email,
		Name:          user.Name,
		Username:      user.Username,
		AvatarURL:     user.AvatarURL,
		Bio:           user.Bio,
		Phone:         user.Phone,
		Dob:           user.Dob,
		Role:          string(user.Role),
		EmailVerified: user.EmailVerified,
		CreatedAt:     user.CreatedAt,
		UpdatedAt:     user.UpdatedAt,
	}
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

// Category responses
type CategoryResponse struct {
	ID          uuid.UUID `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

func NewCategoryResponse(category *entities.Category) *CategoryResponse {
	return &CategoryResponse{
		ID:          category.ID,
		Name:        category.Name,
		Description: category.Description,
		CreatedAt:   category.CreatedAt,
		UpdatedAt:   category.UpdatedAt,
	}
}

// CategoryWithCount represents a category with post count
type CategoryWithCount struct {
	CategoryResponse
	PostCount int64 `json:"post_count"`
}

// Comment responses
type CommentResponse struct {
	ID           uuid.UUID        `json:"id"`
	PostID       uuid.UUID        `json:"post_id"`
	Content      string           `json:"content"`
	ClapCount    uint64           `json:"clap_count"`
	RepliesCount uint64           `json:"replies_count"`
	CreatedAt    time.Time        `json:"created_at"`
	User         *UserResponse    `json:"user,omitempty"`
	Replies      []*ReplyResponse `json:"replies,omitempty"`
}

func NewCommentResponse(comment *entities.Comment) *CommentResponse {
	response := &CommentResponse{
		ID:           comment.ID,
		PostID:       comment.PostID,
		Content:      comment.Content,
		ClapCount:    comment.ClapCount,
		RepliesCount: comment.RepliesCount,
		CreatedAt:    comment.CreatedAt,
	}

	if comment.User.ID != uuid.Nil {
		response.User = NewUserResponse(&comment.User)
	}

	for _, reply := range comment.Replies {
		response.Replies = append(response.Replies, NewReplyResponse(&reply))
	}

	return response
}

// Tag responses
type TagResponse struct {
	ID        uuid.UUID `json:"id"`
	Name      string    `json:"name"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

func NewTagResponse(tag *entities.Tag) *TagResponse {
	return &TagResponse{
		ID:        tag.ID,
		Name:      tag.Name,
		CreatedAt: tag.CreatedAt,
		UpdatedAt: tag.UpdatedAt,
	}
}

// Reply responses
type ReplyResponse struct {
	ID        uuid.UUID     `json:"id"`
	CommentID uuid.UUID     `json:"comment_id"`
	PostID    uuid.UUID     `json:"post_id"`
	Content   string        `json:"content"`
	ClapCount uint64        `json:"clap_count"`
	CreatedAt time.Time     `json:"created_at"`
	User      *UserResponse `json:"user,omitempty"`
}

func NewReplyResponse(reply *entities.Reply) *ReplyResponse {
	response := &ReplyResponse{
		ID:        reply.ID,
		CommentID: reply.CommentID,
		PostID:    reply.PostID,
		Content:   reply.Content,
		ClapCount: reply.ClapCount,
		CreatedAt: reply.CreatedAt,
	}

	if reply.User.ID != uuid.Nil {
		response.User = NewUserResponse(&reply.User)
	}

	return response
}

// Bookmark responses
type BookmarkResponse struct {
	ID           uuid.UUID     `json:"id"`
	PostID       uuid.UUID     `json:"post_id"`
	UserID       uuid.UUID     `json:"user_id"`
	IsBookmarked bool          `json:"is_bookmarked"`
	CreatedAt    time.Time     `json:"created_at"`
	UpdatedAt    time.Time     `json:"updated_at"`
	Post         *PostResponse `json:"post,omitempty"`
	User         *UserResponse `json:"user,omitempty"`
}

func NewBookmarkResponse(bookmark *entities.Bookmark) *BookmarkResponse {
	response := &BookmarkResponse{
		ID:           bookmark.ID,
		PostID:       bookmark.PostID,
		UserID:       bookmark.UserID,
		IsBookmarked: bookmark.IsBookmarked,
		CreatedAt:    bookmark.CreatedAt,
		UpdatedAt:    bookmark.UpdatedAt,
	}

	if bookmark.Post.ID != uuid.Nil {
		response.Post = NewPostResponse(&bookmark.Post)
	}

	if bookmark.User.ID != uuid.Nil {
		response.User = NewUserResponse(&bookmark.User)
	}

	return response
}

// Auth responses
type LoginResponse struct {
	Token string        `json:"token"`
	User  *UserResponse `json:"user"`
}
