// controller/controller_search.go
package controller

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"github.com/pdhoang91/blog/database"
	"github.com/pdhoang91/blog/models"
)

// ===== SEARCH METHODS =====

// SearchPostsHandler handles post search
func (ctrl *Controller) SearchPostsHandler(c *gin.Context) {
	query := c.Query("q")
	if query == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Query parameter 'q' is required"})
		return
	}

	page, err := strconv.Atoi(c.DefaultQuery("page", "1"))
	if err != nil || page < 1 {
		page = 1
	}
	limit, err := strconv.Atoi(c.DefaultQuery("limit", "10"))
	if err != nil || limit < 1 {
		limit = 10
	}
	offset := (page - 1) * limit

	var posts []models.Post
	var total int64

	// Search in title and preview content
	searchQuery := database.DB.Model(&models.Post{}).
		Where("title ILIKE ? OR preview_content ILIKE ?", "%"+query+"%", "%"+query+"%")

	searchQuery.Count(&total)

	if err := searchQuery.Preload("User").
		Order("created_at desc").
		Limit(limit).
		Offset(offset).
		Find(&posts).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to search posts"})
		return
	}

	calculatePostCounts(posts)

	c.JSON(http.StatusOK, gin.H{
		"data":        posts,
		"total_count": total,
		"page":        page,
		"limit":       limit,
		"total_pages": (total + int64(limit) - 1) / int64(limit),
		"query":       query,
	})
}

// TrackSearchHandler tracks search queries
func (ctrl *Controller) TrackSearchHandler(c *gin.Context) {
	var input struct {
		Query string `json:"query" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// For now, just return success - you can implement actual tracking later
	c.JSON(http.StatusOK, gin.H{
		"message": "Search tracked successfully",
		"query":   input.Query,
	})
}
