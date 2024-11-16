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
