// controllers/tag.go
package controller

import (
	"net/http"

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
