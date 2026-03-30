package repository

import (
	"log"
	"strings"
	"time"
	"unicode"

	"github.com/pdhoang91/blog/internal/dto"
	"github.com/pdhoang91/blog/internal/entities"
	uuid "github.com/satori/go.uuid"
	"golang.org/x/text/runes"
	"golang.org/x/text/transform"
	"golang.org/x/text/unicode/norm"
	"gorm.io/gorm"
)

// SearchPostRow holds the raw columns returned by the full-text search query.
// It is an internal value object – not a domain entity – because it is a
// projection used only by the search feature.
type SearchPostRow struct {
	ID         uuid.UUID
	Title      string
	Slug       string
	Excerpt    string
	CoverImage string
	UserID     uuid.UUID
	CreatedAt  time.Time
	Views      uint64
}

// SearchRepository encapsulates all database operations needed by the search feature.
// Every method has a single, clearly-named responsibility (SRP / ISP).
type SearchRepository interface {
	// InitializeIndexes creates PostgreSQL extensions, helper functions, and GIN
	// indexes required for efficient full-text search. Safe to call on every
	// startup – all statements use IF NOT EXISTS / CREATE OR REPLACE.
	InitializeIndexes() error

	// Search executes the full-text + LIKE query and returns a page of matching
	// posts together with the total number of matches across all pages.
	// normalizedQuery is the accent-free, lowercase form; rawQuery is the
	// original user input.
	Search(normalizedQuery, rawQuery string, limit, offset int) ([]SearchPostRow, int64, error)

	// FindUsersByIDs fetches users in a single batch query.
	FindUsersByIDs(ids []uuid.UUID) ([]entities.User, error)

	// GetTagsByPostID returns the tag names attached to a post.
	GetTagsByPostID(postID uuid.UUID) ([]string, error)

	// GetCategoriesByPostID returns the category names attached to a post.
	GetCategoriesByPostID(postID uuid.UUID) ([]string, error)

	// GetSuggestions returns ranked title suggestions that match the query.
	GetSuggestions(normalizedQuery, rawQuery string, limit int) ([]dto.SearchSuggestion, error)

	// GetPopularSearches returns the most-queried terms in the last 7 days.
	GetPopularSearches(limit int) ([]dto.PopularSearch, error)

	// CreateAnalytics persists one search event for analytics.
	CreateAnalytics(a *entities.SearchAnalytics) error
}

// pgSearchRepository is the PostgreSQL implementation of SearchRepository.
type pgSearchRepository struct {
	db *gorm.DB
}

// NewSearchRepository creates a SearchRepository backed by the given *gorm.DB.
// Callers depend on the interface, not the concrete type (DIP).
func NewSearchRepository(db *gorm.DB) SearchRepository {
	return &pgSearchRepository{db: db}
}

// NormalizeVietnameseText strips diacritical marks and lowercases the input.
// Exported so the service layer can reuse the same normalisation without
// importing a separate utility package.
func NormalizeVietnameseText(text string) string {
	text = strings.ToLower(text)
	t := transform.Chain(norm.NFD, runes.Remove(runes.In(unicode.Mn)), norm.NFC)
	normalized, _, _ := transform.String(t, text)
	return normalized
}

// InitializeIndexes implements SearchRepository.
func (r *pgSearchRepository) InitializeIndexes() error {
	stmts := []string{
		`CREATE EXTENSION IF NOT EXISTS unaccent;`,

		// Immutable wrapper so it can be used in index expressions.
		`CREATE OR REPLACE FUNCTION immutable_unaccent(text)
		 RETURNS text AS $$
		 BEGIN
		   RETURN unaccent($1);
		 END;
		 $$ LANGUAGE plpgsql IMMUTABLE;`,

		// Recursively extracts plain text from a TipTap / ProseMirror JSON tree.
		`CREATE OR REPLACE FUNCTION extract_text_from_json_doc(doc jsonb)
		 RETURNS text AS $$
		 DECLARE
		   result text := '';
		   child  jsonb;
		 BEGIN
		   IF doc IS NULL THEN RETURN ''; END IF;
		   IF doc->>'text' IS NOT NULL THEN
		     result := result || ' ' || (doc->>'text');
		   END IF;
		   IF doc->'content' IS NOT NULL AND jsonb_typeof(doc->'content') = 'array' THEN
		     FOR child IN SELECT jsonb_array_elements(doc->'content')
		     LOOP
		       result := result || extract_text_from_json_doc(child);
		     END LOOP;
		   END IF;
		   RETURN result;
		 END;
		 $$ LANGUAGE plpgsql IMMUTABLE;`,

		`CREATE INDEX IF NOT EXISTS idx_posts_fulltext_search
		 ON posts USING gin(
		   to_tsvector('simple', lower(immutable_unaccent(
		     coalesce(title, '') || ' ' || coalesce(excerpt, '')))));`,

		`CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at);`,
		`CREATE INDEX IF NOT EXISTS idx_posts_views      ON posts(views);`,
		`CREATE INDEX IF NOT EXISTS idx_posts_user_id    ON posts(user_id);`,

		`CREATE INDEX IF NOT EXISTS idx_posts_title_unaccent
		 ON posts USING gin(
		   to_tsvector('simple', lower(immutable_unaccent(coalesce(title, '')))));`,

		`CREATE INDEX IF NOT EXISTS idx_posts_excerpt_unaccent
		 ON posts USING gin(
		   to_tsvector('simple', lower(immutable_unaccent(coalesce(excerpt, '')))));`,
	}

	for _, stmt := range stmts {
		if err := r.db.Exec(stmt).Error; err != nil {
			log.Printf("search: index init warning: %v", err)
		}
	}
	return nil
}

// rawSearchRow mirrors exactly the columns selected in Search.
type rawSearchRow struct {
	ID         uuid.UUID `gorm:"column:id"`
	Title      string    `gorm:"column:title"`
	Slug       string    `gorm:"column:slug"`
	Excerpt    string    `gorm:"column:excerpt"`
	CoverImage string    `gorm:"column:cover_image"`
	UserID     uuid.UUID `gorm:"column:user_id"`
	CreatedAt  time.Time `gorm:"column:created_at"`
	Views      uint64    `gorm:"column:views"`
}

// Search implements SearchRepository.
func (r *pgSearchRepository) Search(normalizedQuery, rawQuery string, limit, offset int) ([]SearchPostRow, int64, error) {
	base := r.db.Table("posts").
		Joins("LEFT JOIN post_contents ON post_contents.post_id = posts.id AND post_contents.deleted_at IS NULL").
		Select("DISTINCT posts.id, posts.title, posts.slug, posts.excerpt, posts.cover_image, posts.user_id, posts.created_at, posts.views").
		Where("posts.deleted_at IS NULL").
		Order("posts.created_at DESC")

	if normalizedQuery != "" {
		base = base.Where(`
			(to_tsvector('simple', lower(coalesce(posts.title, '') || ' ' || coalesce(posts.excerpt, '')))
			    @@ plainto_tsquery('simple', ?)
			 OR lower(immutable_unaccent(posts.title))   LIKE ?
			 OR lower(immutable_unaccent(posts.excerpt))  LIKE ?
			 OR posts.title   ILIKE ?
			 OR posts.excerpt ILIKE ?
			 OR (post_contents.content IS NOT NULL
			     AND lower(immutable_unaccent(extract_text_from_json_doc(post_contents.content))) LIKE ?))`,
			normalizedQuery,
			"%"+normalizedQuery+"%",
			"%"+normalizedQuery+"%",
			"%"+rawQuery+"%",
			"%"+rawQuery+"%",
			"%"+normalizedQuery+"%",
		)
	}

	var total int64
	if err := base.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	var rows []rawSearchRow
	if err := base.Limit(limit).Offset(offset).Scan(&rows).Error; err != nil {
		return nil, 0, err
	}

	result := make([]SearchPostRow, len(rows))
	for i, row := range rows {
		result[i] = SearchPostRow{
			ID:         row.ID,
			Title:      row.Title,
			Slug:       row.Slug,
			Excerpt:    row.Excerpt,
			CoverImage: row.CoverImage,
			UserID:     row.UserID,
			CreatedAt:  row.CreatedAt,
			Views:      row.Views,
		}
	}
	return result, total, nil
}

// FindUsersByIDs implements SearchRepository.
func (r *pgSearchRepository) FindUsersByIDs(ids []uuid.UUID) ([]entities.User, error) {
	var users []entities.User
	if err := r.db.Where("id IN ?", ids).Find(&users).Error; err != nil {
		return nil, err
	}
	return users, nil
}

// GetTagsByPostID implements SearchRepository.
func (r *pgSearchRepository) GetTagsByPostID(postID uuid.UUID) ([]string, error) {
	var names []string
	err := r.db.Table("tags").
		Select("tags.name").
		Joins("JOIN post_tags ON tags.id = post_tags.tag_id").
		Where("post_tags.post_id = ?", postID).
		Pluck("name", &names).Error
	return names, err
}

// GetCategoriesByPostID implements SearchRepository.
func (r *pgSearchRepository) GetCategoriesByPostID(postID uuid.UUID) ([]string, error) {
	var names []string
	err := r.db.Table("categories").
		Select("categories.name").
		Joins("JOIN post_categories ON categories.id = post_categories.category_id").
		Where("post_categories.post_id = ?", postID).
		Pluck("name", &names).Error
	return names, err
}

// suggestionRow mirrors the SELECT columns in GetSuggestions.
type suggestionRow struct {
	Title string
	Score float64
}

// GetSuggestions implements SearchRepository.
func (r *pgSearchRepository) GetSuggestions(normalizedQuery, rawQuery string, limit int) ([]dto.SearchSuggestion, error) {
	var rows []suggestionRow
	err := r.db.Raw(`
		SELECT DISTINCT title,
		       ts_rank(to_tsvector('simple', lower(title)), plainto_tsquery('simple', ?)) AS score
		FROM posts
		WHERE lower(immutable_unaccent(title)) LIKE ?
		   OR title ILIKE ?
		   OR to_tsvector('simple', lower(title)) @@ plainto_tsquery('simple', ?)
		ORDER BY score DESC, title
		LIMIT ?`,
		normalizedQuery,
		"%"+normalizedQuery+"%",
		"%"+rawQuery+"%",
		normalizedQuery,
		limit,
	).Scan(&rows).Error
	if err != nil {
		return nil, err
	}

	suggestions := make([]dto.SearchSuggestion, len(rows))
	for i, row := range rows {
		suggestions[i] = dto.SearchSuggestion{Text: row.Title, Score: row.Score}
	}
	return suggestions, nil
}

// GetPopularSearches implements SearchRepository.
func (r *pgSearchRepository) GetPopularSearches(limit int) ([]dto.PopularSearch, error) {
	var results []dto.PopularSearch
	err := r.db.Raw(`
		SELECT query, COUNT(*) AS count
		FROM search_analytics
		WHERE created_at >= NOW() - INTERVAL '7 days'
		  AND query != ''
		GROUP BY query
		ORDER BY count DESC
		LIMIT ?`, limit,
	).Scan(&results).Error
	return results, err
}

// CreateAnalytics implements SearchRepository.
func (r *pgSearchRepository) CreateAnalytics(a *entities.SearchAnalytics) error {
	return r.db.Create(a).Error
}
