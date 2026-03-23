package dto

import "github.com/pdhoang91/blog/internal/entities"

// ArchiveSummaryItem represents one month-bucket in the archive sidebar.
type ArchiveSummaryItem struct {
	Year  int   `json:"year"`
	Month int   `json:"month"`
	Count int64 `json:"count"`
}

// CategoryPostCount represents a category with its post count.
type CategoryPostCount struct {
	Category  *entities.Category
	PostCount int64
}

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

// Search requests
type SearchRequest struct {
	Query  string `json:"query" validate:"required,min=1"`
	Limit  int    `json:"limit,omitempty" validate:"omitempty,min=1,max=100"`
	Offset int    `json:"offset,omitempty" validate:"omitempty,min=0"`
}

// Pagination request
type PaginationRequest struct {
	Page   int `form:"page" json:"page,omitempty"`
	Limit  int `form:"limit" json:"limit,omitempty" validate:"omitempty,min=1,max=100"`
	Offset int `json:"offset,omitempty" validate:"omitempty,min=0"`
}

// CursorRequest is used for keyset (cursor) pagination.
// Cursor is an RFC3339-encoded created_at timestamp of the last seen item.
// An empty Cursor means "fetch from the beginning".
type CursorRequest struct {
	Cursor string `form:"cursor" json:"cursor,omitempty"`
	Limit  int    `form:"limit"  json:"limit,omitempty" validate:"omitempty,min=1,max=100"`
}
