// controller/standardized_methods.go
package controller

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/pdhoang91/blog/models"
	"github.com/pdhoang91/blog/utils"
	uuid "github.com/satori/go.uuid"
)

// GetTags gets all tags with standardized response
func (ctrl *Controller) GetTags(c *gin.Context) {
	var tags []models.Tag
	if err := ctrl.DB.Find(&tags).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch tags"})
		return
	}

	// Return empty array instead of null when no tags found
	if len(tags) == 0 {
		c.JSON(http.StatusOK, gin.H{"data": []models.Tag{}})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": tags})
}

// SearchTags searches tags with standardized response
func (ctrl *Controller) SearchTags(c *gin.Context) {
	query := c.Query("q")
	limitStr := c.DefaultQuery("limit", "10")
	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit <= 0 {
		limit = 10
	}

	var tags []models.Tag
	if query == "" {
		// If no query, return popular tags
		if err := ctrl.DB.Limit(limit).Find(&tags).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch tags"})
			return
		}
	} else {
		// Search tags by name
		if err := ctrl.DB.Where("name ILIKE ?", "%"+query+"%").Limit(limit).Find(&tags).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to search tags"})
			return
		}
	}

	// Return empty array instead of null when no tags found
	if len(tags) == 0 {
		c.JSON(http.StatusOK, gin.H{"data": []models.Tag{}})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": tags})
}

// GetCategories gets all categories with standardized response
func (ctrl *Controller) GetCategories(c *gin.Context) {
	page, err := strconv.Atoi(c.DefaultQuery("page", "1"))
	if err != nil || page < 1 {
		page = 1
	}
	limit, err := strconv.Atoi(c.DefaultQuery("limit", "10"))
	if err != nil || limit < 1 {
		limit = 10
	}
	offset := (page - 1) * limit

	var categories []models.Category
	var total int64

	// Count total categories
	if err := ctrl.DB.Model(&models.Category{}).Count(&total).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to count categories"})
		return
	}

	// Get categories with pagination
	if err := ctrl.DB.Order("created_at desc").Limit(limit).Offset(offset).Find(&categories).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch categories"})
		return
	}

	// Return empty array instead of null when no categories found
	if len(categories) == 0 {
		c.JSON(http.StatusOK, gin.H{
			"data":        []models.Category{},
			"total_count": total,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":        categories,
		"total_count": total,
	})
}

// GetTabs gets user tabs with standardized response
func (ctrl *Controller) GetUserTabs(c *gin.Context) {
	userID, err := utils.GetUserIDFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	// Get user tabs
	var tabs []models.Tab
	if err := ctrl.DB.Preload("Category").Where("user_id = ?", userID).Find(&tabs).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch tabs"})
		return
	}

	// Convert tabs to frontend-friendly format
	var tabNames []string
	for _, tab := range tabs {
		if tab.Category.Name != "" {
			tabNames = append(tabNames, tab.Category.Name)
		}
	}

	// Return empty array instead of null when no tabs found
	if len(tabNames) == 0 {
		c.JSON(http.StatusOK, gin.H{"data": []string{}})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": tabNames})
}

// GetNotifications gets user notifications with standardized response
func (ctrl *Controller) GetNotifications(c *gin.Context) {
	userID, err := utils.GetUserIDFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	var notifications []models.Notification
	if err := ctrl.DB.Where("user_id = ?", userID).Order("created_at DESC").Find(&notifications).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get notifications"})
		return
	}

	// Return empty array instead of null when no notifications found
	if len(notifications) == 0 {
		c.JSON(http.StatusOK, gin.H{"data": []models.Notification{}})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": notifications})
}

// GetUserActivities gets user activities with standardized response
func (ctrl *Controller) GetUserActivities(c *gin.Context) {
	userIDStr := c.Param("user_id")
	userID, err := uuid.FromString(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	var activities []models.UserActivity
	if err := ctrl.DB.Where("user_id = ?", userID).Find(&activities).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get activities"})
		return
	}

	// Return empty array instead of null when no activities found
	if len(activities) == 0 {
		c.JSON(http.StatusOK, gin.H{"data": []models.UserActivity{}})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": activities})
}

// GetBookmarks gets user bookmarks with standardized response
func (ctrl *Controller) GetBookmarks(c *gin.Context) {
	userID, err := utils.GetUserIDFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	pagingParams, err := utils.GetPagingParams(c)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid paging parameters"})
		return
	}
	offset := (pagingParams.Page - 1) * pagingParams.Limit
	limit := pagingParams.Limit

	var bookmarks []models.Bookmark
	var total int64

	// Count total bookmarks
	if err := ctrl.DB.Model(&models.Bookmark{}).Where("user_id = ?", userID).Count(&total).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to count bookmarks"})
		return
	}

	// Get bookmarks with posts
	result := ctrl.DB.
		Preload("Post").
		Preload("Post.User").
		Preload("Post.Categories").
		Preload("Post.Tags").
		Where("user_id = ?", userID).
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&bookmarks)

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get bookmarks"})
		return
	}

	// Extract posts and calculate counts
	posts := make([]models.Post, len(bookmarks))
	for i, bookmark := range bookmarks {
		posts[i] = bookmark.Post
	}
	calculatePostCounts(posts)

	// Return empty array instead of null when no bookmarks found
	if len(bookmarks) == 0 {
		c.JSON(http.StatusOK, gin.H{
			"data":        []models.Bookmark{},
			"total_count": total,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":        bookmarks,
		"total_count": total,
	})
}

// GetFollowingPosts gets posts from followed users with standardized response
func (ctrl *Controller) GetFollowingPosts(c *gin.Context) {
	userID, err := utils.GetUserIDFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	// Get following list
	var follows []models.Follow
	if err := ctrl.DB.Where("follower_id = ?", userID).Find(&follows).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get following list"})
		return
	}

	if len(follows) == 0 {
		// Return empty array if user is not following anyone
		c.JSON(http.StatusOK, gin.H{"data": []models.Post{}})
		return
	}

	var followingIDs []uuid.UUID
	for _, follow := range follows {
		followingIDs = append(followingIDs, follow.FollowingID)
	}

	var posts []models.Post
	if err = ctrl.DB.Preload("User").Where("user_id IN ?", followingIDs).Find(&posts).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get posts"})
		return
	}

	// Calculate post counts
	calculatePostCounts(posts)

	// Return empty array instead of null when no posts found
	if len(posts) == 0 {
		c.JSON(http.StatusOK, gin.H{"data": []models.Post{}})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": posts})
}

// ListUserImages lists user's images with standardized response
func (ctrl *Controller) ListUserImages(c *gin.Context) {
	userID, err := utils.GetUserIDFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	page, err := strconv.Atoi(c.DefaultQuery("page", "1"))
	if err != nil || page < 1 {
		page = 1
	}
	limit, err := strconv.Atoi(c.DefaultQuery("limit", "20"))
	if err != nil || limit < 1 {
		limit = 20
	}
	offset := (page - 1) * limit

	imageType := c.Query("type") // Optional filter by type

	// Build query
	query := ctrl.DB.Where("user_id = ?", userID)
	if imageType != "" {
		query = query.Where("image_type = ?", imageType)
	}

	var total int64
	if err := query.Model(&models.Image{}).Count(&total).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to count images"})
		return
	}

	// Get images
	var images []models.Image
	if err := query.Order("created_at DESC").Limit(limit).Offset(offset).Find(&images).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get images"})
		return
	}

	// Add URLs to response
	imageResponses := make([]gin.H, len(images))
	for i, img := range images {
		imageResponses[i] = gin.H{
			"id":                img.ID,
			"storage_key":       img.StorageKey,
			"original_filename": img.OriginalFilename,
			"content_type":      img.ContentType,
			"file_size":         img.FileSize,
			"image_type":        img.ImageType,
			"width":             img.Width,
			"height":            img.Height,
			"created_at":        img.CreatedAt,
			"url":               ctrl.StorageManager.GetImageURL(img.ID.String()),
		}
	}

	// Return empty array instead of null when no images found
	if len(imageResponses) == 0 {
		c.JSON(http.StatusOK, gin.H{
			"data":        []gin.H{},
			"total_count": total,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":        imageResponses,
		"total_count": total,
	})
}
