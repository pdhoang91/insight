// controllers/search.go
package controllers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"github.com/pdhoang91/blog/database"
	"github.com/pdhoang91/blog/models"
	"github.com/pdhoang91/blog/search"
)

// SearchPostsBasic lấy danh sách các bài viết với phân trang
func SearchPostsBasic(c *gin.Context) {
	query := c.Query("q")
	var posts []models.Post
	var total int64
	page, err := strconv.Atoi(c.DefaultQuery("page", "1"))
	if err != nil || page < 1 {
		page = 1
	}
	limit, err := strconv.Atoi(c.DefaultQuery("limit", "10"))
	if err != nil || limit < 1 {
		limit = 10
	}
	offset := (page - 1) * limit

	// Tạo query cơ bản
	db := database.DB.Model(&models.Post{})

	// Thêm điều kiện cho query dựa trên các tham số
	if query != "" {
		db = db.Where("title ILIKE ? OR preview_content LIKE ?", "%"+query+"%", "%"+query+"%")
	}
	//if query != "" {
	//	db = db.Where("to_tsvector('english', title || ' ' || preview_content) @@ plainto_tsquery(?)", query)
	//}
	// Đếm tổng số bài viết
	if err := db.Count(&total).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Lấy các bài viết, preload thông tin User và sắp xếp theo ngày tạo mới nhất
	result := db.
		Preload("User").          // Eager load User
		Order("created_at DESC"). // Sắp xếp theo ngày CreatedAt mới nhất
		Limit(limit).
		Offset(offset).
		Find(&posts)

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":        posts,
		"total_count": total,
	})
}

// SearchPostsHandler xử lý yêu cầu tìm kiếm bài viết với pagination
func SearchPostsHandler(c *gin.Context) {
	query := c.Query("q")
	category := c.Query("category")
	tags := c.QueryArray("tags")
	//fuzzy := c.DefaultQuery("fuzzy", "false") == "true"
	fuzzy := true
	//autocomplete := c.DefaultQuery("autocomplete", "false") == "true"
	autocomplete := true

	// Lấy tham số pagination
	pageStr := c.DefaultQuery("page", "1")
	limitStr := c.DefaultQuery("limit", "10")

	page, err := strconv.Atoi(pageStr)
	if err != nil || page < 1 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid 'page' parameter"})
		return
	}

	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit < 1 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid 'limit' parameter"})
		return
	}

	// Thực hiện tìm kiếm với pagination
	posts, total, err := search.SearchPosts(query, category, tags, fuzzy, autocomplete, page, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Search failed", "details": err.Error()})
		return
	}

	totalPages := (total + limit - 1) / limit

	c.JSON(http.StatusOK, gin.H{
		"data": posts,
		"pagination": gin.H{
			"total":      total,
			"page":       page,
			"limit":      limit,
			"totalPages": totalPages,
		},
	})
}

// AutocompleteHandler cung cấp gợi ý cho autocomplete
func AutocompleteHandler(c *gin.Context) {
	query := c.Query("q")
	if query == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Query parameter 'q' is required"})
		return
	}

	// Tìm kiếm thẻ
	tags, err := search.SuggestTags(query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get tag suggestions"})
		return
	}

	// Tìm kiếm danh mục
	categories, err := search.SuggestCategories(query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get category suggestions"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"tags":       tags,
		"categories": categories,
	})
}
