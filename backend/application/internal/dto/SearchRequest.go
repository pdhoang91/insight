package dto

import (
	"time"
	uuid "github.com/satori/go.uuid"
)

// AdvancedSearchRequest represents an advanced search request
type AdvancedSearchRequest struct {
	Query       string      `json:"query"`
	CategoryIDs []uuid.UUID `json:"category_ids"`
	TagIDs      []uuid.UUID `json:"tag_ids"`
	AuthorID    *uuid.UUID  `json:"author_id"`
	DateFrom    *time.Time  `json:"date_from"`
	DateTo      *time.Time  `json:"date_to"`
	SortBy      string      `json:"sort_by"` // "views", "created_at", "title"
	Limit       int         `json:"limit"`
	Offset      int         `json:"offset"`
}
