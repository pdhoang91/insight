// controller/controller_category.go
package controller

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"github.com/pdhoang91/blog/database"
	"github.com/pdhoang91/blog/models"
)

// ===== CATEGORY METHODS =====

// GetCategories returns paginated categories
func (ctrl *Controller) GetCategories(c *gin.Context) {
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

	offset := (page - 1) * limit

	var categories []models.Category
	var totalCount int64

	if err := database.DB.Model(&models.Category{}).Count(&totalCount).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to count categories"})
		return
	}

	if err := database.DB.Order("created_at desc").Limit(limit).Offset(offset).Find(&categories).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch categories"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":        categories,
		"total_count": totalCount,
		"page":        page,
		"limit":       limit,
		"total_pages": (totalCount + int64(limit) - 1) / int64(limit),
	})
}

// GetPostsByCategory returns posts by category
func (ctrl *Controller) GetPostsByCategory(c *gin.Context) {
	categoryName := c.Param("name")
	pageStr := c.DefaultQuery("page", "1")
	limitStr := c.DefaultQuery("limit", "10")

	page, err := strconv.Atoi(pageStr)
	if err != nil || page < 1 {
		page = 1
	}

	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit < 1 {
		limit = 10
	}

	offset := (page - 1) * limit

	// Find category
	var category models.Category
	if err := database.DB.Where("name = ?", categoryName).First(&category).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Category not found"})
		return
	}

	// Get posts in this category
	var posts []models.Post
	var totalCount int64

	query := database.DB.Model(&models.Post{}).
		Joins("JOIN post_categories ON posts.id = post_categories.post_id").
		Where("post_categories.category_id = ?", category.ID)

	query.Count(&totalCount)

	if err := query.Preload("User").
		Order("posts.created_at desc").
		Limit(limit).
		Offset(offset).
		Find(&posts).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch posts"})
		return
	}

	// Calculate counts for posts
	calculatePostCounts(posts)

	c.JSON(http.StatusOK, gin.H{
		"data":        posts,
		"total_count": totalCount,
		"page":        page,
		"limit":       limit,
		"total_pages": (totalCount + int64(limit) - 1) / int64(limit),
		"category":    category,
	})
}

// GetTopCategories returns top categories by post count
func (ctrl *Controller) GetTopCategories(c *gin.Context) {
	pageStr := c.DefaultQuery("page", "1")
	limitStr := c.DefaultQuery("limit", "10")

	page, err := strconv.Atoi(pageStr)
	if err != nil || page < 1 {
		page = 1
	}

	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit < 1 {
		limit = 10
	}

	offset := (page - 1) * limit

	var categories []struct {
		models.Category
		PostCount int64 `json:"post_count"`
	}

	// Get total count first
	var totalCount int64
	if err := database.DB.Model(&models.Category{}).Count(&totalCount).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to count categories"})
		return
	}

	if err := database.DB.Model(&models.Category{}).
		Select("categories.*, COUNT(post_categories.post_id) as post_count").
		Joins("LEFT JOIN post_categories ON categories.id = post_categories.category_id").
		Group("categories.id").
		Order("post_count desc").
		Limit(limit).
		Offset(offset).
		Find(&categories).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch top categories"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":        categories,
		"total_count": totalCount,
		"page":        page,
		"limit":       limit,
		"total_pages": (totalCount + int64(limit) - 1) / int64(limit),
	})
}

// GetPopularCategories returns popular categories
func (ctrl *Controller) GetPopularCategories(c *gin.Context) {
	// For now, this is the same as GetTopCategories
	ctrl.GetTopCategories(c)
}
