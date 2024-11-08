// controllers/bulk_index.go
package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"github.com/pdhoang91/blog/database"
	"github.com/pdhoang91/blog/models"
	"github.com/pdhoang91/blog/search"
)

// BulkIndexHandler thực hiện bulk indexing tất cả các bài viết hiện có vào Elasticsearch.
func BulkIndexHandler(c *gin.Context) {
	var posts []models.Post
	if err := database.DB.Preload("Tags").Preload("Categories").Find(&posts).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch posts", "details": err.Error()})
		return
	}

	if err := search.BulkIndexPosts(posts); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to bulk index posts", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Successfully bulk indexed posts"})
}
