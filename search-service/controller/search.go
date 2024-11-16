// controllers/search.go
package controller

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/pdhoang91/search-service/database"
	models "github.com/pdhoang91/search-service/model"
	service "github.com/pdhoang91/search-service/service"
	uuid "github.com/satori/go.uuid"
)

// SearchPostsHandler xử lý yêu cầu tìm kiếm bài viết với pagination
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

	// Thực hiện tìm kiếm với pagination
	data, total, err := service.SearchPosts(query, page, limit)
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

	var userID []uuid.UUID
	for _, v := range data {
		userID = append(userID, v.UserID)
	}

	var users []models.User
	result := database.DB.
		Where("id IN ?", userID).
		Order("created_at DESC").
		Find(&users)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}

	// Khởi tạo mapUser để tránh lỗi khi thêm phần tử
	mapUser := make(map[uuid.UUID]models.User)
	for _, v := range users {
		mapUser[v.ID] = v
	}

	for k, v := range data {
		if val, ok := mapUser[v.UserID]; ok {
			data[k].User = val
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"data":        data,
		"total_count": total,
	})
}

// IndexPostHandler xử lý yêu cầu chỉ định một bài viết vào Elasticsearch
func IndexPostHandler(c *gin.Context) {
	var post models.SearchPost
	if err := c.ShouldBindJSON(&post); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload", "details": err.Error()})
		return
	}

	// Kiểm tra ID hợp lệ
	if post.ID == uuid.Nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid post ID"})
		return
	}

	// Thực hiện chỉ định vào Elasticsearch
	if err := service.IndexPost(post); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to index post", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Post indexed successfully"})
}

// DeletePostHandler xử lý yêu cầu xóa một bài viết khỏi Elasticsearch
func DeletePostHandler(c *gin.Context) {
	idParam := c.Param("id")
	postID, err := uuid.FromString(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid post ID"})
		return
	}

	// Thực hiện xóa khỏi Elasticsearch
	if err := service.DeletePostFromIndex(postID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete post from index", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Post deleted from index successfully"})
}
