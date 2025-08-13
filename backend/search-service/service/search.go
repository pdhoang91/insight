// search/service.go
package service

import (
	"fmt"
	"log"
	"strings"
	"time"

	"github.com/pdhoang91/search-service/database"
	models "github.com/pdhoang91/search-service/model"
	uuid "github.com/satori/go.uuid"
)

// InitializeSearchService initializes PostgreSQL full-text search
func InitializeSearchService() error {
	// Create full-text search indexes if they don't exist
	err := createFullTextSearchIndexes()
	if err != nil {
		log.Printf("Warning: Failed to create full-text search indexes: %v", err)
	}

	log.Println("PostgreSQL search service initialized successfully.")
	return nil
}

// createFullTextSearchIndexes creates GIN indexes for full-text search
func createFullTextSearchIndexes() error {
	// Create GIN index for full-text search on posts table (only title and preview_content)
	queries := []string{
		// Create GIN index for full-text search on posts (using english config)
		`CREATE INDEX IF NOT EXISTS idx_posts_fulltext_search 
		 ON posts USING gin(to_tsvector('english', 
		 	coalesce(title, '') || ' ' || 
		 	coalesce(preview_content, '')));`,

		// Create indexes for common sorting
		`CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at);`,
		`CREATE INDEX IF NOT EXISTS idx_posts_views ON posts(views);`,
		`CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);`,
	}

	for _, query := range queries {
		if err := database.DB.Exec(query).Error; err != nil {
			log.Printf("Warning: Failed to execute query '%s': %v", query, err)
		}
	}

	return nil
}

// SearchPosts thực hiện tìm kiếm đơn giản trên title và preview_content
func SearchPosts(query string, page int, limit int) ([]models.SearchPost, int, error) {
	var posts []models.SearchPost
	var totalCount int64

	// Build base query - chỉ search trong title và preview_content
	baseQuery := database.DB.Table("posts").
		Select(`posts.id, posts.title, posts.title_name, posts.preview_content, 
		       posts.user_id, posts.created_at, posts.views`).
		Order("posts.created_at DESC") // Mặc định sort theo created_at mới nhất

	// Apply text search filter chỉ trong title và preview_content
	if query != "" {
		searchQuery := strings.TrimSpace(query)
		if searchQuery != "" {
			// Sử dụng PostgreSQL full-text search và ILIKE
			baseQuery = baseQuery.Where(`
				(to_tsvector('english', coalesce(posts.title, '') || ' ' || 
				 coalesce(posts.preview_content, '')) @@ plainto_tsquery('english', ?) OR
				 posts.title ILIKE ? OR 
				 posts.preview_content ILIKE ?)`,
				searchQuery, "%"+searchQuery+"%", "%"+searchQuery+"%")
		}
	}

	// Get total count
	countQuery := baseQuery
	if err := countQuery.Count(&totalCount).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to count search results: %v", err)
	}

	// Apply pagination and get results
	offset := (page - 1) * limit
	if err := baseQuery.
		Limit(limit).
		Offset(offset).
		Scan(&posts).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to execute search query: %v", err)
	}

	// Fill in tags and categories for each post
	for i := range posts {
		if err := fillPostMetadata(&posts[i]); err != nil {
			log.Printf("Warning: Failed to fill metadata for post %s: %v", posts[i].ID, err)
		}
		// Set default values for missing fields
		posts[i].ClapCount = 0
		posts[i].AverageRating = 0.0
		posts[i].CommentsCount = 0
		posts[i].Content = "" // Không load content để tăng performance
	}

	log.Printf("PostgreSQL search found %d results for query: %s", totalCount, query)
	return posts, int(totalCount), nil
}

// fillPostMetadata fills tags and categories for a post
func fillPostMetadata(post *models.SearchPost) error {
	// Get categories
	var categories []string
	err := database.DB.Table("categories").
		Select("categories.name").
		Joins("JOIN post_categories ON categories.id = post_categories.category_id").
		Where("post_categories.post_id = ?", post.ID).
		Pluck("name", &categories).Error
	if err != nil {
		return err
	}
	post.Categories = categories

	// Get tags
	var tags []string
	err = database.DB.Table("tags").
		Select("tags.name").
		Joins("JOIN post_tags ON tags.id = post_tags.tag_id").
		Where("post_tags.post_id = ?", post.ID).
		Pluck("name", &tags).Error
	if err != nil {
		return err
	}
	post.Tags = tags

	return nil
}

// GetSearchSuggestions lấy gợi ý tìm kiếm dựa trên PostgreSQL
func GetSearchSuggestions(query string, limit int) ([]models.SearchSuggestion, error) {
	if query == "" {
		return []models.SearchSuggestion{}, nil
	}

	var suggestions []models.SearchSuggestion

	// Search in post titles for suggestions
	rows, err := database.DB.Raw(`
		SELECT DISTINCT title, 
		       ts_rank(to_tsvector('english', title), plainto_tsquery('english', ?)) as score
		FROM posts 
		WHERE title ILIKE ? 
		   OR to_tsvector('english', title) @@ plainto_tsquery('english', ?)
		ORDER BY score DESC, title
		LIMIT ?`, query, "%"+query+"%", query, limit).Rows()

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var title string
		var score float64
		if err := rows.Scan(&title, &score); err != nil {
			continue
		}
		suggestions = append(suggestions, models.SearchSuggestion{
			Text:  title,
			Score: score,
		})
	}

	return suggestions, nil
}

// GetPopularSearches lấy các tìm kiếm phổ biến từ PostgreSQL
func GetPopularSearches(limit int) ([]models.PopularSearch, error) {
	var results []models.PopularSearch

	err := database.DB.Raw(`
		SELECT query, COUNT(*) as count 
		FROM search_analytics 
		WHERE created_at >= NOW() - INTERVAL '7 days'
		AND query != '' 
		GROUP BY query 
		ORDER BY count DESC 
		LIMIT ?
	`, limit).Scan(&results).Error

	if err != nil {
		return nil, err
	}

	return results, nil
}

// TrackSearch ghi lại thông tin search analytics vào PostgreSQL
func TrackSearch(query, userID string, resultsCount int) error {
	analytics := models.SearchAnalytics{
		ID:           uuid.NewV4(),
		Query:        query,
		UserID:       userID,
		ResultsCount: resultsCount,
		CreatedAt:    time.Now(),
	}

	return database.DB.Create(&analytics).Error
}

// IndexPost - No longer needed with PostgreSQL, but keeping for compatibility
func IndexPost(post models.SearchPost) error {
	log.Printf("IndexPost called for post %s - using PostgreSQL, no action needed", post.ID)
	return nil
}

// DeletePostFromIndex - No longer needed with PostgreSQL, but keeping for compatibility
func DeletePostFromIndex(postID uuid.UUID) error {
	log.Printf("DeletePostFromIndex called for post %s - using PostgreSQL, no action needed", postID)
	return nil
}
