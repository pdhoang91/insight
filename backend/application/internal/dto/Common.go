package dto

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
