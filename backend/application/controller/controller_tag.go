// controller/controller_tag.go
package controller

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	uuid "github.com/satori/go.uuid"

	"github.com/pdhoang91/blog/database"
	"github.com/pdhoang91/blog/models"
)

// ===== TAG METHODS =====

// CreateTag creates a new tag
func (ctrl *Controller) CreateTag(c *gin.Context) {
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

	c.JSON(http.StatusOK, gin.H{"data": tag})
}

// GetTags returns all tags
func (ctrl *Controller) GetTags(c *gin.Context) {
	var tags []models.Tag
	if err := database.DB.Find(&tags).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch tags"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": tags})
}

// SearchTags searches for tags by name
func (ctrl *Controller) SearchTags(c *gin.Context) {
	query := c.Query("q")
	if query == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Query parameter 'q' is required"})
		return
	}

	var tags []models.Tag
	if err := database.DB.Where("name ILIKE ?", "%"+query+"%").Find(&tags).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to search tags"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": tags})
}

// GetPopularTags returns popular tags by usage count
func (ctrl *Controller) GetPopularTags(c *gin.Context) {
	limitStr := c.DefaultQuery("limit", "10")
	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit < 1 {
		limit = 10
	}

	var tags []struct {
		models.Tag
		PostCount int64 `json:"post_count"`
	}

	if err := database.DB.Model(&models.Tag{}).
		Select("tags.*, COUNT(post_tags.post_id) as post_count").
		Joins("LEFT JOIN post_tags ON tags.id = post_tags.tag_id").
		Group("tags.id").
		Order("post_count desc").
		Limit(limit).
		Find(&tags).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch popular tags"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": tags})
}

// AddTagToPost adds a tag to a post
func (ctrl *Controller) AddTagToPost(c *gin.Context) {
	tagIDStr := c.Param("tag_id")
	postIDStr := c.Param("post_id")

	tagID, err := uuid.FromString(tagIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid tag ID"})
		return
	}

	postID, err := uuid.FromString(postIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid post ID"})
		return
	}

	// Verify tag exists
	var tag models.Tag
	if err := database.DB.First(&tag, tagID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Tag not found"})
		return
	}

	// Verify post exists
	var post models.Post
	if err := database.DB.First(&post, postID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Post not found"})
		return
	}

	// Add tag to post
	if err := database.DB.Model(&post).Association("Tags").Append(&tag); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add tag to post"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Tag added to post successfully"})
}

// RemoveTagFromPost removes a tag from a post
func (ctrl *Controller) RemoveTagFromPost(c *gin.Context) {
	tagIDStr := c.Param("tag_id")
	postIDStr := c.Param("post_id")

	tagID, err := uuid.FromString(tagIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid tag ID"})
		return
	}

	postID, err := uuid.FromString(postIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid post ID"})
		return
	}

	// Verify tag exists
	var tag models.Tag
	if err := database.DB.First(&tag, tagID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Tag not found"})
		return
	}

	// Verify post exists
	var post models.Post
	if err := database.DB.First(&post, postID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Post not found"})
		return
	}

	// Remove tag from post
	if err := database.DB.Model(&post).Association("Tags").Delete(&tag); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to remove tag from post"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Tag removed from post successfully"})
}
