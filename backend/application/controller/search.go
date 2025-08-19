// controllers/search.go
package controller

import (
	"context"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	uuid "github.com/satori/go.uuid"

	"github.com/pdhoang91/blog/database"
	"github.com/pdhoang91/blog/external/search"
	"github.com/pdhoang91/blog/models"
)

// controllers/search.go
func SearchPostsHandler(c *gin.Context) {
	query := c.Query("q")
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

	client := search.New()

	// Context với timeout
	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	// Thực hiện tìm kiếm với pagination
	data, total, err := client.SearchPost(ctx, query, page, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Search failed", "details": err.Error()})
		return
	}

	// Nếu không có dữ liệu, trả về ngay lập tức
	if len(data) == 0 {
		c.JSON(http.StatusOK, gin.H{
			"data":        data,
			"total_count": total,
		})
		return
	}

	// Lấy danh sách userID từ dữ liệu bài viết
	var userID []uuid.UUID
	for _, v := range data {
		userID = append(userID, v.UserID)
	}

	// Truy vấn thông tin người dùng từ database
	var users []models.User
	result := database.DB.
		Where("id IN ?", userID).
		Order("created_at DESC").
		Find(&users)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}

	// Tạo mapUser để ánh xạ userID với thông tin người dùng
	mapUser := make(map[uuid.UUID]models.User)
	for _, v := range users {
		mapUser[v.ID] = v
	}

	// Cập nhật thông tin người dùng trong dữ liệu bài viết
	for k, v := range data {
		if val, ok := mapUser[v.UserID]; ok {
			data[k].User = val
		}
	}

	// Trả về kết quả JSON
	c.JSON(http.StatusOK, gin.H{
		"data":        data,
		"total_count": total,
	})
}

// SearchSuggestionsHandler xử lý yêu cầu gợi ý tìm kiếm
func SearchSuggestionsHandler(c *gin.Context) {
	query := c.Query("q")
	limitStr := c.DefaultQuery("limit", "5")

	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit < 1 {
		limit = 5
	}

	client := search.New()

	// Context với timeout
	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	suggestions, err := client.GetSearchSuggestions(ctx, query, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get suggestions", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"suggestions": suggestions,
	})
}

// PopularSearchesHandler xử lý yêu cầu lấy các tìm kiếm phổ biến
func PopularSearchesHandler(c *gin.Context) {
	limitStr := c.DefaultQuery("limit", "10")

	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit < 1 {
		limit = 10
	}

	client := search.New()

	// Context với timeout
	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	searches, err := client.GetPopularSearches(ctx, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get popular searches", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"popular_searches": searches,
	})
}

// TrackSearchHandler xử lý việc theo dõi search analytics
func TrackSearchHandler(c *gin.Context) {
	var request struct {
		Query        string `json:"query" binding:"required"`
		UserID       string `json:"user_id"`
		ResultsCount int    `json:"results_count"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload", "details": err.Error()})
		return
	}

	client := search.New()

	// Context với timeout
	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	err := client.TrackSearch(ctx, request.Query, request.UserID, request.ResultsCount)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to track search", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Search tracked successfully"})
}
