// controller/post_methods.go
package controller

import (
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/pdhoang91/blog/models"
	"github.com/pdhoang91/blog/utils"
	uuid "github.com/satori/go.uuid"
	"gorm.io/gorm"
)

// CreatePost creates a new post with unified controller
func (ctrl *Controller) CreatePost(c *gin.Context) {
	var input struct {
		Title          string   `json:"title" binding:"required"`
		ImageTitle     string   `json:"image_title"`
		PreviewContent string   `json:"preview_content"`
		Content        string   `json:"content" binding:"required"`
		CategoryIDs    []string `json:"category_ids"`
		TagIDs         []string `json:"tag_ids"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID, err := utils.GetUserIDFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	// Generate title_name from title
	titleName := utils.GenerateTitleName(input.Title)

	// Check if title_name already exists
	var existingPost models.Post
	if err := ctrl.DB.Where("title_name = ?", titleName).First(&existingPost).Error; err == nil {
		// Title name exists, append timestamp
		titleName = fmt.Sprintf("%s-%d", titleName, time.Now().Unix())
	}

	// Process content for saving (convert image URLs to data-image-id)
	processedContent, err := ctrl.StorageManager.ProcessContentForSaving(input.Content, uuid.Nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to process content"})
		return
	}

	// Create post
	post := models.Post{
		Title:          input.Title,
		ImageTitle:     input.ImageTitle,
		TitleName:      titleName,
		PreviewContent: input.PreviewContent,
		UserID:         userID,
		CreatedAt:      time.Now(),
		UpdatedAt:      time.Now(),
	}

	if err := ctrl.DB.Create(&post).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create post"})
		return
	}

	// Create post content
	postContent := models.PostContent{
		PostID:  post.ID,
		Content: processedContent,
	}

	if err := ctrl.DB.Create(&postContent).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create post content"})
		return
	}

	// Process content again to update image references with correct post ID
	finalContent, err := ctrl.StorageManager.ProcessContentForSaving(input.Content, post.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to process content references"})
		return
	}

	// Update content with correct references
	if err := ctrl.DB.Model(&postContent).Update("content", finalContent).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update content references"})
		return
	}

	// Handle categories
	if len(input.CategoryIDs) > 0 {
		var categories []models.Category
		for _, categoryIDStr := range input.CategoryIDs {
			categoryID, err := uuid.FromString(categoryIDStr)
			if err != nil {
				continue
			}
			categories = append(categories, models.Category{ID: categoryID})
		}
		if err := ctrl.DB.Model(&post).Association("Categories").Append(categories); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to associate categories"})
			return
		}
	}

	// Handle tags
	if len(input.TagIDs) > 0 {
		var tags []models.Tag
		for _, tagIDStr := range input.TagIDs {
			tagID, err := uuid.FromString(tagIDStr)
			if err != nil {
				continue
			}
			tags = append(tags, models.Tag{ID: tagID})
		}
		if err := ctrl.DB.Model(&post).Association("Tags").Append(tags); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to associate tags"})
			return
		}
	}

	// TODO: Index post for search when search service is available

	// Load associations for response
	if err := ctrl.DB.Preload("User").Preload("Categories").Preload("Tags").First(&post, post.ID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load post details"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"data": post})
}

// UpdatePost updates an existing post with direct image deletion
func (ctrl *Controller) UpdatePost(c *gin.Context) {
	postID := c.Param("id")
	postUUID, err := uuid.FromString(postID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid post ID"})
		return
	}

	var input struct {
		Title          string   `json:"title"`
		ImageTitle     string   `json:"image_title"`
		PreviewContent string   `json:"preview_content"`
		Content        string   `json:"content"`
		CategoryIDs    []string `json:"category_ids"`
		TagIDs         []string `json:"tag_ids"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID, err := utils.GetUserIDFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	// Get existing post
	var post models.Post
	if err := ctrl.DB.Preload("PostContent").First(&post, "id = ? AND user_id = ?", postUUID, userID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Post not found or access denied"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get post"})
		}
		return
	}

	// Handle title image deletion if changed
	if input.ImageTitle != post.ImageTitle && post.ImageTitle != "" {
		if oldImageID := ctrl.ExtractImageIDFromTitleURL(post.ImageTitle); oldImageID != nil {
			if err := ctrl.DeleteImageDirectly(c.Request.Context(), *oldImageID); err != nil {
				fmt.Printf("Warning: failed to delete old title image: %v\n", err)
			}
		}
	}

	// Handle content image changes
	if input.Content != "" && post.PostContent.Content != "" {
		// Get old and new image IDs
		oldImageIDs := ctrl.ExtractImageIDsFromContent(post.PostContent.Content)
		newImageIDs := ctrl.ExtractImageIDsFromContent(input.Content)

		// Find images to delete (in old but not in new)
		imagesToDelete := make([]uuid.UUID, 0)
		newImageMap := make(map[uuid.UUID]bool)
		for _, id := range newImageIDs {
			newImageMap[id] = true
		}

		for _, oldID := range oldImageIDs {
			if !newImageMap[oldID] {
				imagesToDelete = append(imagesToDelete, oldID)
			}
		}

		// Delete removed images immediately
		for _, imageID := range imagesToDelete {
			if err := ctrl.DeleteImageDirectly(c.Request.Context(), imageID); err != nil {
				fmt.Printf("Warning: failed to delete removed image: %v\n", err)
			}
		}
	}

	// Update post fields
	updateData := map[string]interface{}{
		"updated_at": time.Now(),
	}

	if input.Title != "" {
		updateData["title"] = input.Title
		// Regenerate title_name if title changed
		if input.Title != post.Title {
			titleName := utils.GenerateTitleName(input.Title)
			// Check if new title_name already exists
			var existingPost models.Post
			if err := ctrl.DB.Where("title_name = ? AND id != ?", titleName, postUUID).First(&existingPost).Error; err == nil {
				titleName = fmt.Sprintf("%s-%d", titleName, time.Now().Unix())
			}
			updateData["title_name"] = titleName
		}
	}

	if input.ImageTitle != "" {
		updateData["image_title"] = input.ImageTitle
	}

	if input.PreviewContent != "" {
		updateData["preview_content"] = input.PreviewContent
	}

	// Update post
	if err := ctrl.DB.Model(&post).Updates(updateData).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update post"})
		return
	}

	// Update content if provided
	if input.Content != "" {
		// Process content for saving
		processedContent, err := ctrl.StorageManager.ProcessContentForSaving(input.Content, postUUID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to process content"})
			return
		}

		// Update post content
		if err := ctrl.DB.Model(&models.PostContent{}).Where("post_id = ?", postUUID).Update("content", processedContent).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update content"})
			return
		}
	}

	// Update categories
	if len(input.CategoryIDs) > 0 {
		var categories []models.Category
		for _, categoryIDStr := range input.CategoryIDs {
			categoryID, err := uuid.FromString(categoryIDStr)
			if err != nil {
				continue
			}
			categories = append(categories, models.Category{ID: categoryID})
		}
		if err := ctrl.DB.Model(&post).Association("Categories").Replace(categories); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update categories"})
			return
		}
	}

	// Update tags
	if len(input.TagIDs) > 0 {
		var tags []models.Tag
		for _, tagIDStr := range input.TagIDs {
			tagID, err := uuid.FromString(tagIDStr)
			if err != nil {
				continue
			}
			tags = append(tags, models.Tag{ID: tagID})
		}
		if err := ctrl.DB.Model(&post).Association("Tags").Replace(tags); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update tags"})
			return
		}
	}

	// TODO: Update search index when search service is available

	// Load updated post with associations
	if err := ctrl.DB.Preload("User").Preload("Categories").Preload("Tags").Preload("PostContent").First(&post, postUUID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load updated post"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": post})
}

// DeletePost deletes a post and all associated images
func (ctrl *Controller) DeletePost(c *gin.Context) {
	postID := c.Param("id")
	postUUID, err := uuid.FromString(postID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid post ID"})
		return
	}

	userID, err := utils.GetUserIDFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	// Get post to verify ownership
	var post models.Post
	if err := ctrl.DB.First(&post, "id = ? AND user_id = ?", postUUID, userID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Post not found or access denied"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get post"})
		}
		return
	}

	// Delete all images associated with this post
	if err := ctrl.DeletePostImages(c.Request.Context(), postUUID); err != nil {
		fmt.Printf("Warning: failed to delete post images: %v\n", err)
	}

	// Delete title image if exists
	if post.ImageTitle != "" {
		if imageID := ctrl.ExtractImageIDFromTitleURL(post.ImageTitle); imageID != nil {
			if err := ctrl.DeleteImageDirectly(c.Request.Context(), *imageID); err != nil {
				fmt.Printf("Warning: failed to delete title image: %v\n", err)
			}
		}
	}

	// TODO: Delete from search index when search service is available

	// Delete post content
	if err := ctrl.DB.Where("post_id = ?", postUUID).Delete(&models.PostContent{}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete post content"})
		return
	}

	// Delete post associations
	if err := ctrl.DB.Model(&post).Association("Categories").Clear(); err != nil {
		fmt.Printf("Warning: failed to clear post categories: %v\n", err)
	}

	if err := ctrl.DB.Model(&post).Association("Tags").Clear(); err != nil {
		fmt.Printf("Warning: failed to clear post tags: %v\n", err)
	}

	// Delete comments and related activities
	if err := ctrl.DB.Where("post_id = ?", postUUID).Delete(&models.Comment{}).Error; err != nil {
		fmt.Printf("Warning: failed to delete post comments: %v\n", err)
	}

	if err := ctrl.DB.Where("post_id = ?", postUUID).Delete(&models.UserActivity{}).Error; err != nil {
		fmt.Printf("Warning: failed to delete post activities: %v\n", err)
	}

	// Delete the post itself
	if err := ctrl.DB.Delete(&post).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete post"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Post deleted successfully"})
}
