package service

import (
	"github.com/pdhoang91/blog/internal/dto"
	"github.com/pdhoang91/blog/pkg/httpclient"
	uuid "github.com/satori/go.uuid"
)

// InsightService contains all dependencies and business logic
type InsightService struct {
	*BaseService

	// External clients
	SearchClient *httpclient.SearchClient
}

// NewInsightService creates a new insight service with all dependencies
func NewInsightService(baseService *BaseService) *InsightService {
	return &InsightService{
		BaseService:  baseService,
		SearchClient: httpclient.NewSearchClient(),
	}
}

// GetSearchClient returns the search client instance
func (s *InsightService) GetSearchClient() *httpclient.SearchClient {
	return s.SearchClient
}

// GetUserBookmarksWithUsername is a wrapper method for GetUserBookmarks that returns username
func (s *InsightService) GetUserBookmarksWithUsername(userID uuid.UUID, req *dto.PaginationRequest) ([]*dto.PostResponse, string, int64, error) {
	return s.GetUserBookmarks(userID, req)
}
