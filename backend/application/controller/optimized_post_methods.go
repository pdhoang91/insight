// controller/optimized_post_methods.go
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

// OptimizedCreatePost creates a new post with image info from frontend
func (ctrl *Controller) OptimizedCreatePost(c *gin.Context) {
	var input struct {
		Title          string   `json:"title" binding:"required"`
		ImageTitle     string   `json:"image_title"`
		PreviewContent string   `json:"preview_content"`
		Content        string   `json:"content" binding:"required"`
		CategoryIDs    []string `json:"category_ids"`
		TagIDs         []string `json:"tag_ids"`
		// New: Frontend provides image info directly
		ContentImageIDs []string `json:"content_image_ids"` // Image IDs used in content
		TitleImageID    string   `json:"title_image_id"`    // Title image ID
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

	// Create post content (no processing needed - content is ready)
	postContent := models.PostContent{
		PostID:  post.ID,
		Content: input.Content, // Direct content from FE
	}

	if err := ctrl.DB.Create(&postContent).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create post content"})
		return
	}

	// Create image references directly from FE data
	if err := ctrl.createImageReferences(post.ID, input.ContentImageIDs, input.TitleImageID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create image references"})
		return
	}

	// Handle categories
	if len(input.CategoryIDs) > 0 {
		if err := ctrl.associateCategories(&post, input.CategoryIDs); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to associate categories"})
			return
		}
	}

	// Handle tags
	if len(input.TagIDs) > 0 {
		if err := ctrl.associateTags(&post, input.TagIDs); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to associate tags"})
			return
		}
	}

	// Load associations for response
	if err := ctrl.DB.Preload("User").Preload("Categories").Preload("Tags").Preload("PostContent").First(&post, post.ID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load post"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"data": post})
}

// createImageReferences creates image references from frontend data
func (ctrl *Controller) createImageReferences(postID uuid.UUID, contentImageIDs []string, titleImageID string) error {
	var references []models.ImageReference

	// Add content image references
	for _, imageIDStr := range contentImageIDs {
		if imageID, err := uuid.FromString(imageIDStr); err == nil {
			references = append(references, models.ImageReference{
				ImageID: imageID,
				PostID:  postID,
				RefType: "content",
			})
		}
	}

	// Add title image reference
	if titleImageID != "" {
		if imageID, err := uuid.FromString(titleImageID); err == nil {
			references = append(references, models.ImageReference{
				ImageID: imageID,
				PostID:  postID,
				RefType: "title",
			})
		}
	}

	// Batch create references
	if len(references) > 0 {
		return ctrl.DB.Create(&references).Error
	}

	return nil
}

// associateCategories associates categories with post
func (ctrl *Controller) associateCategories(post *models.Post, categoryIDs []string) error {
	var categories []models.Category
	for _, categoryIDStr := range categoryIDs {
		categoryID, err := uuid.FromString(categoryIDStr)
		if err != nil {
			continue
		}
		categories = append(categories, models.Category{ID: categoryID})
	}
	return ctrl.DB.Model(post).Association("Categories").Append(categories)
}

// associateTags associates tags with post
func (ctrl *Controller) associateTags(post *models.Post, tagIDs []string) error {
	var tags []models.Tag
	for _, tagIDStr := range tagIDs {
		tagID, err := uuid.FromString(tagIDStr)
		if err != nil {
			continue
		}
		tags = append(tags, models.Tag{ID: tagID})
	}
	return ctrl.DB.Model(post).Association("Tags").Append(tags)
}

// OptimizedUpdatePost updates a post with image info from frontend
func (ctrl *Controller) OptimizedUpdatePost(c *gin.Context) {
	postID, err := uuid.FromString(c.Param("id"))
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
		// New: Frontend provides image info directly
		ContentImageIDs []string `json:"content_image_ids"` // Image IDs used in content
		TitleImageID    string   `json:"title_image_id"`    // Title image ID
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
	if err := ctrl.DB.Where("id = ? AND user_id = ?", postID, userID).First(&post).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Post not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get post"})
		}
		return
	}

	// Delete old image references (we'll recreate them)
	if err := ctrl.DB.Where("post_id = ?", postID).Delete(&models.ImageReference{}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update image references"})
		return
	}

	// Update post fields
	updates := map[string]interface{}{
		"updated_at": time.Now(),
	}

	if input.Title != "" {
		updates["title"] = input.Title
		// Regenerate title_name if title changed
		if input.Title != post.Title {
			titleName := utils.GenerateTitleName(input.Title)
			var existingPost models.Post
			if err := ctrl.DB.Where("title_name = ? AND id != ?", titleName, postID).First(&existingPost).Error; err == nil {
				titleName = fmt.Sprintf("%s-%d", titleName, time.Now().Unix())
			}
			updates["title_name"] = titleName
		}
	}

	if input.ImageTitle != "" {
		updates["image_title"] = input.ImageTitle
	}

	if input.PreviewContent != "" {
		updates["preview_content"] = input.PreviewContent
	}

	// Update post
	if err := ctrl.DB.Model(&post).Updates(updates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update post"})
		return
	}

	// Update content if provided
	if input.Content != "" {
		if err := ctrl.DB.Model(&models.PostContent{}).Where("post_id = ?", postID).Update("content", input.Content).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update content"})
			return
		}
	}

	// Create new image references
	if err := ctrl.createImageReferences(postID, input.ContentImageIDs, input.TitleImageID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create image references"})
		return
	}

	// Update categories
	if len(input.CategoryIDs) > 0 {
		// Clear existing associations
		if err := ctrl.DB.Model(&post).Association("Categories").Clear(); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to clear categories"})
			return
		}
		// Add new associations
		if err := ctrl.associateCategories(&post, input.CategoryIDs); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to associate categories"})
			return
		}
	}

	// Update tags
	if len(input.TagIDs) > 0 {
		// Clear existing associations
		if err := ctrl.DB.Model(&post).Association("Tags").Clear(); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to clear tags"})
			return
		}
		// Add new associations
		if err := ctrl.associateTags(&post, input.TagIDs); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to associate tags"})
			return
		}
	}

	// Load updated post with associations
	if err := ctrl.DB.Preload("User").Preload("Categories").Preload("Tags").Preload("PostContent").First(&post, postID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load updated post"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": post})
}
