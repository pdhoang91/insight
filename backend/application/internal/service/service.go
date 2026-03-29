package service

import (
	"github.com/pdhoang91/blog/internal/repository"
)

// InsightService is the single concrete implementation of Service.
// It embeds BaseService (which holds all infrastructure deps) and adds
// the searchRepo needed exclusively by the search feature.
type InsightService struct {
	*BaseService
	searchRepo repository.SearchRepository
}

// NewInsightService wires all dependencies into InsightService.
// searchRepo is required; pass repository.NewSearchRepository(db) from main.
func NewInsightService(baseService *BaseService, searchRepo repository.SearchRepository) *InsightService {
	return &InsightService{
		BaseService: baseService,
		searchRepo:  searchRepo,
	}
}
