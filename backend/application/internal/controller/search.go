package controller

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/pdhoang91/blog/internal/service"
)

// SearchController handles all /search/* routes.
// It depends only on SearchService (ISP) – not on the full Service composite.
type SearchController struct {
	svc service.SearchService
}

// SearchPosts godoc
// GET /search/posts?q=...&page=...&limit=...
func (c *SearchController) SearchPosts(ctx *gin.Context) {
	query := ctx.Query("q")
	if query == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Query parameter 'q' is required"})
		return
	}

	req, err := parsePagination(ctx)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid query parameters"})
		return
	}
	if req.Page == 0 {
		req.Page = 1
	}

	posts, total, err := c.svc.SearchPosts(query, req.Page, req.Limit)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Search failed", "details": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"data":        ensureNotNil(posts),
		"total_count": total,
		"limit":       req.Limit,
		"offset":      (req.Page - 1) * req.Limit,
	})
}

// GetSearchSuggestions godoc
// GET /search/suggestions?q=...&limit=...
func (c *SearchController) GetSearchSuggestions(ctx *gin.Context) {
	query := ctx.Query("q")
	limit := intQueryDefault(ctx, "limit", 5)

	suggestions, err := c.svc.GetSearchSuggestions(query, limit)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get suggestions"})
		return
	}
	ctx.JSON(http.StatusOK, gin.H{"suggestions": suggestions})
}

// GetPopularSearches godoc
// GET /search/popular?limit=...
func (c *SearchController) GetPopularSearches(ctx *gin.Context) {
	limit := intQueryDefault(ctx, "limit", 10)

	searches, err := c.svc.GetPopularSearches(limit)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get popular searches"})
		return
	}
	ctx.JSON(http.StatusOK, gin.H{"popular_searches": searches})
}

// TrackSearch godoc
// POST /search/track
func (c *SearchController) TrackSearch(ctx *gin.Context) {
	var req struct {
		Query        string `json:"query" binding:"required"`
		UserID       string `json:"user_id"`
		ResultsCount int    `json:"results_count"`
	}
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}

	if err := c.svc.TrackSearch(req.Query, req.UserID, req.ResultsCount); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to track search"})
		return
	}
	ctx.JSON(http.StatusOK, gin.H{"message": "Search tracked successfully"})
}

// intQueryDefault parses an optional integer query param, returning def on missing/invalid input.
func intQueryDefault(ctx *gin.Context, key string, def int) int {
	raw := ctx.Query(key)
	if raw == "" {
		return def
	}
	v, err := strconv.Atoi(raw)
	if err != nil || v < 1 {
		return def
	}
	return v
}
