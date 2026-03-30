package service

import (
	"log"
	"strings"
	"time"

	"github.com/pdhoang91/blog/internal/dto"
	"github.com/pdhoang91/blog/internal/entities"
	"github.com/pdhoang91/blog/internal/repository"
	uuid "github.com/satori/go.uuid"
)

// InitializeIndexes creates the PostgreSQL extensions and GIN indexes needed
// for full-text search. Should be called once at application startup.
func (s *InsightService) InitializeIndexes() error {
	if err := s.searchRepo.InitializeIndexes(); err != nil {
		log.Printf("search: index initialisation warning: %v", err)
	}
	log.Println("search: indexes ready")
	return nil
}

// SearchPosts performs a full-text + accent-insensitive search on the posts
// table. It returns a page of results and the total match count.
func (s *InsightService) SearchPosts(query string, page, limit int) ([]*dto.PostResponse, int64, error) {
	query = strings.TrimSpace(query)
	normalized := repository.NormalizeVietnameseText(query)
	offset := (page - 1) * limit

	rows, total, err := s.searchRepo.Search(normalized, query, limit, offset)
	if err != nil {
		return nil, 0, err
	}
	if len(rows) == 0 {
		return []*dto.PostResponse{}, total, nil
	}

	// Batch-fetch all authors in a single query.
	userIDs := uniqueUserIDs(rows)
	users, err := s.searchRepo.FindUsersByIDs(userIDs)
	if err != nil {
		return nil, 0, err
	}
	userMap := indexUsersByID(users)

	results := make([]*dto.PostResponse, 0, len(rows))
	for _, row := range rows {
		tags, err := s.searchRepo.GetTagsByPostID(row.ID)
		if err != nil {
			log.Printf("search: tags for post %s: %v", row.ID, err)
		}
		categories, err := s.searchRepo.GetCategoriesByPostID(row.ID)
		if err != nil {
			log.Printf("search: categories for post %s: %v", row.ID, err)
		}

		resp := buildPostResponse(row, tags, categories, userMap)
		results = append(results, resp)
	}

	log.Printf("search: %d results for %q", total, query)
	return results, total, nil
}

// GetSearchSuggestions returns ranked title suggestions for the given prefix.
func (s *InsightService) GetSearchSuggestions(query string, limit int) ([]dto.SearchSuggestion, error) {
	if strings.TrimSpace(query) == "" {
		return []dto.SearchSuggestion{}, nil
	}
	normalized := repository.NormalizeVietnameseText(query)
	return s.searchRepo.GetSuggestions(normalized, query, limit)
}

// GetPopularSearches returns the most-searched terms in the last 7 days.
func (s *InsightService) GetPopularSearches(limit int) ([]dto.PopularSearch, error) {
	return s.searchRepo.GetPopularSearches(limit)
}

// TrackSearch persists one search event to the analytics table.
func (s *InsightService) TrackSearch(query, userID string, resultsCount int) error {
	a := &entities.SearchAnalytics{
		ID:           uuid.NewV4(),
		Query:        query,
		UserID:       userID,
		ResultsCount: resultsCount,
		CreatedAt:    time.Now(),
	}
	return s.searchRepo.CreateAnalytics(a)
}

// --- private helpers -------------------------------------------------------

func uniqueUserIDs(rows []repository.SearchPostRow) []uuid.UUID {
	seen := make(map[uuid.UUID]struct{}, len(rows))
	ids := make([]uuid.UUID, 0, len(rows))
	for _, r := range rows {
		if _, ok := seen[r.UserID]; !ok {
			seen[r.UserID] = struct{}{}
			ids = append(ids, r.UserID)
		}
	}
	return ids
}

func indexUsersByID(users []entities.User) map[uuid.UUID]entities.User {
	m := make(map[uuid.UUID]entities.User, len(users))
	for _, u := range users {
		m[u.ID] = u
	}
	return m
}

func buildPostResponse(
	row repository.SearchPostRow,
	tags, categories []string,
	userMap map[uuid.UUID]entities.User,
) *dto.PostResponse {
	resp := &dto.PostResponse{
		ID:         row.ID,
		Title:      row.Title,
		Slug:       row.Slug,
		Excerpt:    row.Excerpt,
		CoverImage: row.CoverImage,
		Views:      row.Views,
		CreatedAt:  row.CreatedAt,
		UpdatedAt:  row.CreatedAt,
	}

	for _, t := range tags {
		resp.Tags = append(resp.Tags, &dto.TagResponse{Name: t})
	}
	for _, c := range categories {
		resp.Categories = append(resp.Categories, &dto.CategoryResponse{Name: c})
	}

	if u, ok := userMap[row.UserID]; ok {
		resp.User = dto.NewUserResponse(&u)
	}
	return resp
}
