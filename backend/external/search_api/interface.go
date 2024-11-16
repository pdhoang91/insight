// search_api/search_client.go
package search_api

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
}
