// search_api/search_client.go
package search

import (
	"context"

	"github.com/pdhoang91/blog/models"
	uuid "github.com/satori/go.uuid"
)

// ISearchClient provides methods for interacting with the Search API
type ISearchClient interface {
	SearchPost(ctx context.Context, query string, page int, limit int) ([]models.SearchPost, int, error)
	IndexPost(ctx context.Context, post models.SearchPost) error
	DeletePostFromIndex(ctx context.Context, postID uuid.UUID) error
	GetSearchSuggestions(ctx context.Context, query string, limit int) ([]models.SearchSuggestion, error)
	GetPopularSearches(ctx context.Context, limit int) ([]models.PopularSearch, error)
	TrackSearch(ctx context.Context, query, userID string, resultsCount int) error
}
