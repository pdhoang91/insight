package service

import (
	"errors"
	"fmt"
	"strings"

	"github.com/pdhoang91/blog/internal/dto"
	"github.com/pdhoang91/blog/internal/entities"
)

// ==================== ENHANCED SEARCH METHODS ====================

// SearchAllEnhanced performs comprehensive search across all content types
func (s *InsightService) SearchAllEnhanced(query string, req *dto.PaginationRequest) (*dto.SearchResults, error) {
	if req.Limit == 0 {
		req.Limit = 20
	}

	// Clean and prepare search query
	cleanQuery := strings.TrimSpace(query)
	if cleanQuery == "" {
		return &dto.SearchResults{
			Query:      query,
			TotalCount: 0,
			Posts:      []*dto.PostResponse{},
			Users:      []*dto.UserResponse{},
			Categories: []*dto.CategoryResponse{},
			Tags:       []*dto.TagResponse{},
		}, nil
	}

	// Search posts
	posts, postCount, err := s.searchPostsEnhanced(cleanQuery, req.Limit/4, req.Offset/4)
	if err != nil {
		return nil, err
	}

	// Search users
	users, userCount, err := s.searchUsersEnhanced(cleanQuery, req.Limit/4, req.Offset/4)
	if err != nil {
		return nil, err
	}

	// Search categories
	categories, categoryCount, err := s.searchCategoriesEnhanced(cleanQuery, req.Limit/4, req.Offset/4)
	if err != nil {
		return nil, err
	}

	// Search tags
	tags, tagCount, err := s.searchTagsEnhanced(cleanQuery, req.Limit/4, req.Offset/4)
	if err != nil {
		return nil, err
	}

	return &dto.SearchResults{
		Query:      query,
		TotalCount: postCount + userCount + categoryCount + tagCount,
		Posts:      posts,
		Users:      users,
		Categories: categories,
		Tags:       tags,
	}, nil
}

// searchPostsEnhanced performs enhanced post search with ranking
func (s *InsightService) searchPostsEnhanced(query string, limit, offset int) ([]*dto.PostResponse, int64, error) {
	var posts []*entities.Post

	// Use PostgreSQL full-text search if available, otherwise use LIKE
	searchQuery := fmt.Sprintf("%%%s%%", query)

	err := s.DBR2.Preload("User").
		Preload("Categories").
		Preload("Tags").
		Where("title ILIKE ? OR preview_content ILIKE ?", searchQuery, searchQuery).
		Order("views DESC, created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&posts).Error
	if err != nil {
		return nil, 0, err
	}

	// Get total count
	var total int64
	err = s.DBR2.Model(&entities.Post{}).
		Where("title ILIKE ? OR preview_content ILIKE ?", searchQuery, searchQuery).
		Count(&total).Error
	if err != nil {
		return nil, 0, err
	}

	// Convert to responses
	var responses []*dto.PostResponse
	for _, post := range posts {
		responses = append(responses, dto.NewPostResponse(post))
	}

	return responses, total, nil
}

// searchUsersEnhanced performs enhanced user search
func (s *InsightService) searchUsersEnhanced(query string, limit, offset int) ([]*dto.UserResponse, int64, error) {
	var users []*entities.User

	searchQuery := fmt.Sprintf("%%%s%%", query)

	err := s.DBR2.Where("name ILIKE ? OR username ILIKE ? OR bio ILIKE ?",
		searchQuery, searchQuery, searchQuery).
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&users).Error
	if err != nil {
		return nil, 0, err
	}

	// Get total count
	var total int64
	err = s.DBR2.Model(&entities.User{}).
		Where("name ILIKE ? OR username ILIKE ? OR bio ILIKE ?",
			searchQuery, searchQuery, searchQuery).
		Count(&total).Error
	if err != nil {
		return nil, 0, err
	}

	// Convert to responses
	var responses []*dto.UserResponse
	for _, user := range users {
		responses = append(responses, dto.NewUserResponse(user))
	}

	return responses, total, nil
}

// searchCategoriesEnhanced performs enhanced category search
func (s *InsightService) searchCategoriesEnhanced(query string, limit, offset int) ([]*dto.CategoryResponse, int64, error) {
	var categories []*entities.Category

	searchQuery := fmt.Sprintf("%%%s%%", query)

	err := s.DBR2.Where("name ILIKE ? OR description ILIKE ?", searchQuery, searchQuery).
		Order("name ASC").
		Limit(limit).
		Offset(offset).
		Find(&categories).Error
	if err != nil {
		return nil, 0, err
	}

	// Get total count
	var total int64
	err = s.DBR2.Model(&entities.Category{}).
		Where("name ILIKE ? OR description ILIKE ?", searchQuery, searchQuery).
		Count(&total).Error
	if err != nil {
		return nil, 0, err
	}

	// Convert to responses
	var responses []*dto.CategoryResponse
	for _, category := range categories {
		responses = append(responses, dto.NewCategoryResponse(category))
	}

	return responses, total, nil
}

// searchTagsEnhanced performs enhanced tag search
func (s *InsightService) searchTagsEnhanced(query string, limit, offset int) ([]*dto.TagResponse, int64, error) {
	var tags []*entities.Tag

	searchQuery := fmt.Sprintf("%%%s%%", query)

	err := s.DBR2.Where("name ILIKE ?", searchQuery).
		Order("name ASC").
		Limit(limit).
		Offset(offset).
		Find(&tags).Error
	if err != nil {
		return nil, 0, err
	}

	// Get total count
	var total int64
	err = s.DBR2.Model(&entities.Tag{}).
		Where("name ILIKE ?", searchQuery).
		Count(&total).Error
	if err != nil {
		return nil, 0, err
	}

	// Convert to responses
	var responses []*dto.TagResponse
	for _, tag := range tags {
		responses = append(responses, dto.NewTagResponse(tag))
	}

	return responses, total, nil
}

// SearchPostsAdvanced performs advanced post search with filters
func (s *InsightService) SearchPostsAdvanced(req *dto.AdvancedSearchRequest) ([]*dto.PostResponse, int64, error) {
	if req.Limit == 0 {
		req.Limit = 20
	}

	query := s.DBR2.Preload("User").Preload("Categories").Preload("Tags")

	// Text search
	if req.Query != "" {
		searchQuery := fmt.Sprintf("%%%s%%", req.Query)
		query = query.Where("title ILIKE ? OR preview_content ILIKE ?", searchQuery, searchQuery)
	}

	// Category filter
	if len(req.CategoryIDs) > 0 {
		query = query.Joins("JOIN post_categories ON posts.id = post_categories.post_id").
			Where("post_categories.category_id IN ?", req.CategoryIDs)
	}

	// Tag filter
	if len(req.TagIDs) > 0 {
		query = query.Joins("JOIN post_tags ON posts.id = post_tags.post_id").
			Where("post_tags.tag_id IN ?", req.TagIDs)
	}

	// Author filter
	if req.AuthorID != nil {
		query = query.Where("user_id = ?", *req.AuthorID)
	}

	// Date range filter
	if req.DateFrom != nil {
		query = query.Where("created_at >= ?", *req.DateFrom)
	}
	if req.DateTo != nil {
		query = query.Where("created_at <= ?", *req.DateTo)
	}

	// Sorting
	switch req.SortBy {
	case "views":
		query = query.Order("views DESC")
	case "created_at":
		query = query.Order("created_at DESC")
	case "title":
		query = query.Order("title ASC")
	default:
		query = query.Order("created_at DESC")
	}

	var posts []*entities.Post
	err := query.Limit(req.Limit).Offset(req.Offset).Find(&posts).Error
	if err != nil {
		return nil, 0, errors.New("internal server error")
	}

	// Get total count with same filters
	countQuery := s.DBR2.Model(&entities.Post{})
	if req.Query != "" {
		searchQuery := fmt.Sprintf("%%%s%%", req.Query)
		countQuery = countQuery.Where("title ILIKE ? OR preview_content ILIKE ?", searchQuery, searchQuery)
	}
	if len(req.CategoryIDs) > 0 {
		countQuery = countQuery.Joins("JOIN post_categories ON posts.id = post_categories.post_id").
			Where("post_categories.category_id IN ?", req.CategoryIDs)
	}
	if len(req.TagIDs) > 0 {
		countQuery = countQuery.Joins("JOIN post_tags ON posts.id = post_tags.post_id").
			Where("post_tags.tag_id IN ?", req.TagIDs)
	}
	if req.AuthorID != nil {
		countQuery = countQuery.Where("user_id = ?", *req.AuthorID)
	}
	if req.DateFrom != nil {
		countQuery = countQuery.Where("created_at >= ?", *req.DateFrom)
	}
	if req.DateTo != nil {
		countQuery = countQuery.Where("created_at <= ?", *req.DateTo)
	}

	var total int64
	err = countQuery.Count(&total).Error
	if err != nil {
		return nil, 0, errors.New("internal server error")
	}

	// Convert to responses
	var responses []*dto.PostResponse
	for _, post := range posts {
		responses = append(responses, dto.NewPostResponse(post))
	}

	return responses, total, nil
}

// GetSearchSuggestions provides search suggestions based on query
func (s *InsightService) GetSearchSuggestions(query string, limit int) (*dto.SearchSuggestions, error) {
	if limit == 0 {
		limit = 10
	}

	cleanQuery := strings.TrimSpace(query)
	if cleanQuery == "" {
		return &dto.SearchSuggestions{}, nil
	}

	searchQuery := fmt.Sprintf("%s%%", cleanQuery) // Prefix match for suggestions

	// Get post title suggestions
	var postTitles []string
	err := s.DBR2.Model(&entities.Post{}).
		Select("title").
		Where("title ILIKE ?", searchQuery).
		Order("views DESC").
		Limit(limit/2).
		Pluck("title", &postTitles).Error
	if err != nil {
		return nil, errors.New("internal server error")
	}

	// Get tag suggestions
	var tagNames []string
	err = s.DBR2.Model(&entities.Tag{}).
		Select("name").
		Where("name ILIKE ?", searchQuery).
		Order("name ASC").
		Limit(limit/2).
		Pluck("name", &tagNames).Error
	if err != nil {
		return nil, errors.New("internal server error")
	}

	// Get category suggestions
	var categoryNames []string
	err = s.DBR2.Model(&entities.Category{}).
		Select("name").
		Where("name ILIKE ?", searchQuery).
		Order("name ASC").
		Limit(limit/4).
		Pluck("name", &categoryNames).Error
	if err != nil {
		return nil, errors.New("internal server error")
	}

	// Get user suggestions
	var usernames []string
	err = s.DBR2.Model(&entities.User{}).
		Select("username").
		Where("username ILIKE ?", searchQuery).
		Order("username ASC").
		Limit(limit/4).
		Pluck("username", &usernames).Error
	if err != nil {
		return nil, errors.New("internal server error")
	}

	return &dto.SearchSuggestions{
		Posts:      postTitles,
		Tags:       tagNames,
		Categories: categoryNames,
		Users:      usernames,
	}, nil
}
