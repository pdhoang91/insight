// controllers/tag.go
package controller

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"github.com/pdhoang91/blog/database"
	"github.com/pdhoang91/blog/models"
)

// CreateTag tạo thẻ mới.
func CreateTag(c *gin.Context) {
	var input struct {
		Name string `json:"name" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	tag := models.Tag{Name: input.Name}

	if err := database.DB.Create(&tag).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create tag"})
		return
	}

	// Indexing tag vào Elasticsearch
	//err := search.IndexTag(tag)
	//if err != nil {
	//	c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to index tag"})
	//	return
	//}

	c.JSON(http.StatusOK, gin.H{"data": tag})
}

// GetTags lấy danh sách thẻ.
func GetTags(c *gin.Context) {
	var tags []models.Tag
	if err := database.DB.Find(&tags).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch tags"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": tags})
}

// AddTagToPost gắn thẻ vào bài viết.
func AddTagToPost(c *gin.Context) {
	postID := c.Param("post_id")
	tagID := c.Param("tag_id")

	var post models.Post
	if err := database.DB.First(&post, postID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Post not found"})
		return
	}

	var tag models.Tag
	if err := database.DB.First(&tag, tagID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Tag not found"})
		return
	}

	if err := database.DB.Model(&post).Association("Tags").Append(&tag); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add tag to post"})
		return
	}

	// Cập nhật lại bài viết trong Elasticsearch để phản ánh việc thêm tag
	//if err := search.IndexPost(post); err != nil {
	//	c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to index post after adding tag"})
	//	return
	//}

	c.JSON(http.StatusOK, gin.H{"message": "Tag added to post successfully"})
}

// RemoveTagFromPost bỏ thẻ khỏi bài viết.
func RemoveTagFromPost(c *gin.Context) {
	postID := c.Param("post_id")
	tagID := c.Param("tag_id")

	var post models.Post
	if err := database.DB.First(&post, postID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Post not found"})
		return
	}

	var tag models.Tag
	if err := database.DB.First(&tag, tagID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Tag not found"})
		return
	}

	if err := database.DB.Model(&post).Association("Tags").Delete(&tag); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to remove tag from post"})
		return
	}

	// Cập nhật lại bài viết trong Elasticsearch để phản ánh việc xóa tag
	//if err := search.IndexPost(post); err != nil {
	//	c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to index post after removing tag"})
	//	return
	//}

	c.JSON(http.StatusOK, gin.H{"message": "Tag removed from post successfully"})
}

// SearchTags tìm kiếm tags theo tên
func SearchTags(c *gin.Context) {
	query := c.Query("q")
	limitStr := c.DefaultQuery("limit", "10")

	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit < 1 {
		limit = 10
	}

	var tags []models.Tag
	if query == "" {
		// Nếu không có query, trả về tags phổ biến nhất
		if err := database.DB.Limit(limit).Find(&tags).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch tags"})
			return
		}
	} else {
		// Tìm kiếm tags theo tên
		if err := database.DB.Where("name ILIKE ?", "%"+query+"%").Limit(limit).Find(&tags).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to search tags"})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{"data": tags})
}

// GetPopularTags trả về danh sách các tag có nhiều bài post nhất cho sidebar
func GetPopularTags(c *gin.Context) {
	// Lấy các tham số phân trang từ query string với giá trị mặc định
	pageStr := c.DefaultQuery("page", "1")
	limitStr := c.DefaultQuery("limit", "9")

	// Chuyển đổi các tham số sang kiểu int
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

	offset := (page - 1) * limit

	type TagWithCount struct {
		models.Tag
		PostCount int64 `json:"post_count"`
	}

	var tags []TagWithCount
	var totalCount int64

	// Đếm tổng số tags có ít nhất 1 bài post
	countQuery := `
		SELECT COUNT(DISTINCT t.id) 
		FROM tags t 
		INNER JOIN post_tags pt ON t.id = pt.tag_id
	`
	if err := database.DB.Raw(countQuery).Scan(&totalCount).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to count tags"})
		return
	}

	// Query để lấy tags với số lượng posts, sắp xếp theo số lượng posts giảm dần
	query := `
		SELECT t.id, t.name, t.created_at, t.updated_at, COUNT(pt.post_id) as post_count
		FROM tags t 
		INNER JOIN post_tags pt ON t.id = pt.tag_id 
		GROUP BY t.id, t.name, t.created_at, t.updated_at 
		ORDER BY post_count DESC 
		LIMIT ? OFFSET ?
	`

	if err := database.DB.Raw(query, limit, offset).Scan(&tags).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch popular tags"})
		return
	}

	// Trả về dữ liệu theo định dạng yêu cầu
	c.JSON(http.StatusOK, gin.H{
		"data":        tags,
		"total_count": totalCount,
	})
}
