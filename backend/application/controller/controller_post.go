// controller/controller_post.go
package controller

import (
	"log"
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	uuid "github.com/satori/go.uuid"
	"gorm.io/gorm"

	"github.com/pdhoang91/blog/database"
	"github.com/pdhoang91/blog/models"
	"github.com/pdhoang91/blog/utils"
)

// ===== POST METHODS (READ) =====

// GetPosts returns paginated posts
func (ctrl *Controller) GetPosts(c *gin.Context) {
	var posts []models.Post
	var total int64
	page, err := strconv.Atoi(c.DefaultQuery("page", "1"))
	if err != nil || page < 1 {
		page = 1
	}
	limit, err := strconv.Atoi(c.DefaultQuery("limit", "10"))
	if err != nil || limit < 1 {
		limit = 10
	}
	offset := (page - 1) * limit

	// Count total posts
	database.DB.Model(&models.Post{}).Count(&total)

	// Get posts with pagination
	if err := database.DB.Preload("User").
		Order("created_at desc").
		Limit(limit).
		Offset(offset).
		Find(&posts).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch posts"})
		return
	}

	// Calculate counts
	calculatePostCounts(posts)

	c.JSON(http.StatusOK, gin.H{
		"data":        posts,
		"total_count": total,
		"page":        page,
		"limit":       limit,
		"total_pages": (total + int64(limit) - 1) / int64(limit),
	})
}

// GetPopularPosts returns popular posts (by clap count)
func (ctrl *Controller) GetPopularPosts(c *gin.Context) {
	var posts []models.Post
	limit, err := strconv.Atoi(c.DefaultQuery("limit", "10"))
	if err != nil || limit < 1 {
		limit = 10
	}

	// For now, get all posts and sort by clap count after calculating
	// This is simpler and avoids complex SQL joins that might fail
	if err := database.DB.Preload("User").
		Order("created_at desc").
		Limit(limit * 3). // Get more posts to sort properly
		Find(&posts).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch posts"})
		return
	}

	// Calculate clap counts for all posts
	calculatePostCounts(posts)

	// Sort posts by clap count in Go (simpler than complex SQL)
	// This is temporary until we optimize the SQL query
	for i := 0; i < len(posts)-1; i++ {
		for j := i + 1; j < len(posts); j++ {
			if posts[i].ClapCount < posts[j].ClapCount {
				posts[i], posts[j] = posts[j], posts[i]
			}
		}
	}

	// Limit to requested amount
	if len(posts) > limit {
		posts = posts[:limit]
	}

	c.JSON(http.StatusOK, gin.H{"data": posts})
}

// GetLatestPosts returns latest posts
func (ctrl *Controller) GetLatestPosts(c *gin.Context) {
	var posts []models.Post
	limit, err := strconv.Atoi(c.DefaultQuery("limit", "10"))
	if err != nil || limit < 1 {
		limit = 10
	}

	if err := database.DB.Preload("User").
		Order("created_at desc").
		Limit(limit).
		Find(&posts).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch latest posts"})
		return
	}

	calculatePostCounts(posts)
	c.JSON(http.StatusOK, gin.H{"data": posts})
}

// GetPostByName returns a post by title name
func (ctrl *Controller) GetPostByName(c *gin.Context) {
	titleName := c.Param("title_name")

	var post models.Post
	if err := database.DB.Preload("User").
		Preload("Categories").
		Preload("Tags").
		Where("title_name = ?", titleName).
		First(&post).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Post not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch post"})
		}
		return
	}

	// Get post content
	var postContent models.PostContent
	if err := database.DB.Where("post_id = ?", post.ID).First(&postContent).Error; err != nil {
		log.Printf("No content found for post %s", post.ID)
	} else {
		post.PostContent = postContent
	}

	calculateSinglePostCounts(&post)
	c.JSON(http.StatusOK, gin.H{"data": post})
}

// ===== POST METHODS (WRITE) =====

// CreatePost creates a new post
func (ctrl *Controller) CreatePost(c *gin.Context) {
	// Get user ID from context
	userID, err := utils.GetUserIDFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var input struct {
		Title          string   `json:"title" binding:"required"`
		Content        string   `json:"content" binding:"required"`
		PreviewContent string   `json:"preview_content"`
		ImageTitle     string   `json:"image_title"`
		Categories     []string `json:"categories"`
		Tags           []string `json:"tags"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Create slug from title
	titleName := createSlug(input.Title)

	// Create post
	post := models.Post{
		ID:             uuid.NewV4(),
		UserID:         userID,
		Title:          input.Title,
		TitleName:      titleName,
		PreviewContent: input.PreviewContent,
		ImageTitle:     input.ImageTitle,
	}

	if err := database.DB.Create(&post).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create post"})
		return
	}

	// Create post content
	postContent := models.PostContent{
		PostID:  post.ID,
		Content: input.Content,
	}

	if err := database.DB.Create(&postContent).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create post content"})
		return
	}

	// Process post content for image relationships
	go func(postID uuid.UUID, content string, imageTitle string) {
		ctrl := GetController()
		if ctrl == nil {
			log.Printf("Warning: Controller not initialized for cleanup")
			return
		}

		// Parse title image ID if it's a UUID
		var titleImageID *uuid.UUID
		if imageTitle != "" {
			if parsedID, err := uuid.FromString(imageTitle); err == nil {
				titleImageID = &parsedID
			}
		}

		if err := ctrl.processPostContent(postID, content, titleImageID); err != nil {
			log.Printf("Warning: Failed to process post content for post %s: %v", postID, err)
		}
	}(post.ID, input.Content, input.ImageTitle)

	c.JSON(http.StatusCreated, gin.H{"data": post})
}

// UpdatePost updates an existing post
func (ctrl *Controller) UpdatePost(c *gin.Context) {
	// Get user ID from context
	userID, err := utils.GetUserIDFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// Get post ID from URL parameter
	postIDStr := c.Param("id")
	postID, err := uuid.FromString(postIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid post ID"})
		return
	}

	var input struct {
		Title          string   `json:"title"`
		Content        string   `json:"content"`
		PreviewContent string   `json:"preview_content"`
		ImageTitle     string   `json:"image_title"`
		Categories     []string `json:"categories"`
		Tags           []string `json:"tags"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Find post
	var post models.Post
	if err := database.DB.Where("id = ? AND user_id = ?", postID, userID).First(&post).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Post not found or access denied"})
		return
	}

	// Update post fields if provided
	if input.Title != "" {
		post.Title = input.Title
		post.TitleName = createSlug(input.Title)
	}
	if input.PreviewContent != "" {
		post.PreviewContent = input.PreviewContent
	}
	if input.ImageTitle != "" {
		post.ImageTitle = input.ImageTitle
	}

	if err := database.DB.Save(&post).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update post"})
		return
	}

	// Update post content if provided
	if input.Content != "" {
		var postContent models.PostContent
		if err := database.DB.Where("post_id = ?", postID).First(&postContent).Error; err != nil {
			// Create new content if it doesn't exist
			postContent = models.PostContent{
				PostID:  postID,
				Content: input.Content,
			}
			database.DB.Create(&postContent)
		} else {
			// Update existing content
			postContent.Content = input.Content
			database.DB.Save(&postContent)
		}
	}

	// Trigger immediate image cleanup for updated post (using goroutine)
	go func(postID uuid.UUID, content string, imageTitle string) {
		ctrl := GetController()
		if ctrl == nil {
			log.Printf("Warning: Controller not initialized for cleanup")
			return
		}

		// Parse title image ID if it's a UUID
		var titleImageID *uuid.UUID
		if imageTitle != "" {
			if parsedID, err := uuid.FromString(imageTitle); err == nil {
				titleImageID = &parsedID
			}
		}

		// First process the new content and relationships
		if err := ctrl.processPostContent(postID, content, titleImageID); err != nil {
			log.Printf("Warning: Failed to process post content for post %s: %v", postID, err)
		}

		// Then cleanup orphaned images
		newContentImageIDs := ctrl.extractImageIDsFromContent(content)
		if err := ctrl.cleanupPostImagesOnUpdate(postID, titleImageID, newContentImageIDs); err != nil {
			log.Printf("Warning: Failed to cleanup images for post %s: %v", postID, err)
		}
	}(post.ID, input.Content, input.ImageTitle)

	c.JSON(http.StatusOK, gin.H{"data": post})
}

// DeletePost deletes a post and its related data
func (ctrl *Controller) DeletePost(c *gin.Context) {
	// Get user ID from context
	userID, err := utils.GetUserIDFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// Get post ID from URL parameter
	postIDStr := c.Param("id")
	postID, err := uuid.FromString(postIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid post ID"})
		return
	}

	// Start transaction
	tx := database.DB.Begin()

	// Find and verify ownership
	var post models.Post
	if err := tx.Where("id = ? AND user_id = ?", postID, userID).First(&post).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusNotFound, gin.H{"error": "Post not found or access denied"})
		return
	}

	// Delete post content
	if err := tx.Where("post_id = ?", postID).Delete(&models.PostContent{}).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete post content"})
		return
	}

	// Delete post-image relationships
	if err := tx.Where("post_id = ?", postID).Delete(&models.PostImage{}).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete post-image relationships"})
		return
	}

	// Delete post
	if err := tx.Delete(&post).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete post"})
		return
	}

	// Commit transaction
	if err := tx.Commit().Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to commit transaction"})
		return
	}

	// Trigger immediate cleanup for deleted post (using goroutine)
	go func(postID uuid.UUID) {
		ctrl := GetController()
		if ctrl == nil {
			log.Printf("Warning: Controller not initialized for cleanup")
			return
		}

		if err := ctrl.cleanupPostImagesOnDelete(postID); err != nil {
			log.Printf("Warning: Failed to cleanup images for deleted post %s: %v", postID, err)
		}
	}(postID)

	c.JSON(http.StatusOK, gin.H{"message": "Post and related data deleted successfully"})
}

// ClapPost handles clapping/unclapping a post
func (ctrl *Controller) ClapPost(c *gin.Context) {
	// Get user ID from context
	userID, err := utils.GetUserIDFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// Get post ID from URL parameter
	postIDStr := c.Param("id")
	postID, err := uuid.FromString(postIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid post ID"})
		return
	}

	// Check if post exists
	var post models.Post
	if err := database.DB.First(&post, postID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Post not found"})
		return
	}

	// Check if user already clapped this post
	var existingActivity models.UserActivity
	err = database.DB.Where("user_id = ? AND post_id = ? AND activity_type = ?",
		userID, postID, string(models.ActivityTypeClap)).First(&existingActivity).Error

	// If there's a database error (like table doesn't exist), handle gracefully
	if err != nil && err != gorm.ErrRecordNotFound {
		// Check if it's a "table doesn't exist" error
		if strings.Contains(err.Error(), "relation \"user_activities\" does not exist") {
			c.JSON(http.StatusServiceUnavailable, gin.H{
				"error": "Clap system not available. Please run database migration first.",
				"hint":  "Run: psql -d insight -f migrate/user_activities.sql",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error: " + err.Error()})
		return
	}

	if err == nil {
		// User already clapped, so remove the clap (unclap)
		if err := database.DB.Delete(&existingActivity).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to unclap post"})
			return
		}

		// Get updated clap count
		var clapCount int64
		database.DB.Model(&models.UserActivity{}).
			Where("post_id = ? AND activity_type = ?", postID, string(models.ActivityTypeClap)).
			Count(&clapCount)

		c.JSON(http.StatusOK, gin.H{
			"message":    "Post unclaimed successfully",
			"clapped":    false,
			"clap_count": clapCount,
		})
		return
	}

	// User hasn't clapped yet, so add a clap
	activity := models.UserActivity{
		UserID:       userID,
		PostID:       &postID,
		ActivityType: string(models.ActivityTypeClap),
	}

	if err := database.DB.Create(&activity).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to clap post"})
		return
	}

	// Get updated clap count
	var clapCount int64
	database.DB.Model(&models.UserActivity{}).
		Where("post_id = ? AND activity_type = ?", postID, string(models.ActivityTypeClap)).
		Count(&clapCount)

	c.JSON(http.StatusOK, gin.H{
		"message":    "Post clapped successfully",
		"clapped":    true,
		"clap_count": clapCount,
	})
}

// GetClaps handles GET /claps endpoint for both posts and comments
func (ctrl *Controller) GetClaps(c *gin.Context) {
	clapType := c.Query("type")
	idStr := c.Query("id")

	if clapType == "" || idStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Missing required parameters: type and id",
		})
		return
	}

	id, err := uuid.FromString(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID format"})
		return
	}

	var clapCount int64
	var userClapped bool

	// Get user ID from context (optional for this endpoint)
	userID, _ := utils.GetUserIDFromContext(c)

	switch clapType {
	case "post":
		// Count claps for post
		if err := database.DB.Model(&models.UserActivity{}).
			Where("post_id = ? AND activity_type = ?", id, string(models.ActivityTypeClap)).
			Count(&clapCount).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to count post claps"})
			return
		}

		// Check if current user has clapped this post (if authenticated)
		if userID != uuid.Nil {
			var activity models.UserActivity
			err := database.DB.Where("user_id = ? AND post_id = ? AND activity_type = ?",
				userID, id, string(models.ActivityTypeClap)).First(&activity).Error
			userClapped = (err == nil)
		}

	case "comment":
		// Count claps for comment
		if err := database.DB.Model(&models.UserActivity{}).
			Where("comment_id = ? AND activity_type = ?", id, string(models.ActivityTypeClap)).
			Count(&clapCount).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to count comment claps"})
			return
		}

		// Check if current user has clapped this comment (if authenticated)
		if userID != uuid.Nil {
			var activity models.UserActivity
			err := database.DB.Where("user_id = ? AND comment_id = ? AND activity_type = ?",
				userID, id, string(models.ActivityTypeClap)).First(&activity).Error
			userClapped = (err == nil)
		}

	case "reply":
		// Count claps for reply
		if err := database.DB.Model(&models.UserActivity{}).
			Where("reply_id = ? AND activity_type = ?", id, string(models.ActivityTypeClap)).
			Count(&clapCount).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to count reply claps"})
			return
		}

		// Check if current user has clapped this reply (if authenticated)
		if userID != uuid.Nil {
			var activity models.UserActivity
			err := database.DB.Where("user_id = ? AND reply_id = ? AND activity_type = ?",
				userID, id, string(models.ActivityTypeClap)).First(&activity).Error
			userClapped = (err == nil)
		}

	default:
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid type. Must be 'post', 'comment', or 'reply'",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"type":         clapType,
		"id":           idStr,
		"clap_count":   clapCount,
		"user_clapped": userClapped,
	})
}

// ClapComment handles clapping/unclapping a comment
func (ctrl *Controller) ClapComment(c *gin.Context) {
	// Get user ID from context
	userID, err := utils.GetUserIDFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// Get comment ID from URL parameter
	commentIDStr := c.Param("id")
	commentID, err := uuid.FromString(commentIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid comment ID"})
		return
	}

	// Check if comment exists
	var comment models.Comment
	if err := database.DB.First(&comment, commentID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Comment not found"})
		return
	}

	// Check if user already clapped this comment
	var existingActivity models.UserActivity
	err = database.DB.Where("user_id = ? AND comment_id = ? AND activity_type = ?",
		userID, commentID, string(models.ActivityTypeClap)).First(&existingActivity).Error

	// If there's a database error, handle gracefully
	if err != nil && err != gorm.ErrRecordNotFound {
		if strings.Contains(err.Error(), "relation \"user_activities\" does not exist") {
			c.JSON(http.StatusServiceUnavailable, gin.H{
				"error": "Clap system not available. Please run database migration first.",
				"hint":  "Run: psql -d insight -f migrate/user_activities.sql",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error: " + err.Error()})
		return
	}

	if err == nil {
		// User already clapped, so remove the clap (unclap)
		if err := database.DB.Delete(&existingActivity).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to unclap comment"})
			return
		}

		// Get updated clap count
		var clapCount int64
		database.DB.Model(&models.UserActivity{}).
			Where("comment_id = ? AND activity_type = ?", commentID, string(models.ActivityTypeClap)).
			Count(&clapCount)

		c.JSON(http.StatusOK, gin.H{
			"message":    "Comment unclaimed successfully",
			"clapped":    false,
			"clap_count": clapCount,
		})
		return
	}

	// User hasn't clapped yet, so add a clap
	activity := models.UserActivity{
		UserID:       userID,
		CommentID:    &commentID,
		ActivityType: string(models.ActivityTypeClap),
	}

	if err := database.DB.Create(&activity).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to clap comment"})
		return
	}

	// Get updated clap count
	var clapCount int64
	database.DB.Model(&models.UserActivity{}).
		Where("comment_id = ? AND activity_type = ?", commentID, string(models.ActivityTypeClap)).
		Count(&clapCount)

	c.JSON(http.StatusOK, gin.H{
		"message":    "Comment clapped successfully",
		"clapped":    true,
		"clap_count": clapCount,
	})
}

// ClapReply handles clapping/unclapping a reply
func (ctrl *Controller) ClapReply(c *gin.Context) {
	// Get user ID from context
	userID, err := utils.GetUserIDFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// Get reply ID from URL parameter
	replyIDStr := c.Param("id")
	replyID, err := uuid.FromString(replyIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid reply ID"})
		return
	}

	// Check if reply exists
	var reply models.Reply
	if err := database.DB.First(&reply, replyID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Reply not found"})
		return
	}

	// Check if user already clapped this reply
	var existingActivity models.UserActivity
	err = database.DB.Where("user_id = ? AND reply_id = ? AND activity_type = ?",
		userID, replyID, string(models.ActivityTypeClap)).First(&existingActivity).Error

	// If there's a database error, handle gracefully
	if err != nil && err != gorm.ErrRecordNotFound {
		if strings.Contains(err.Error(), "relation \"user_activities\" does not exist") {
			c.JSON(http.StatusServiceUnavailable, gin.H{
				"error": "Clap system not available. Please run database migration first.",
				"hint":  "Run: psql -d insight -f migrate/user_activities.sql",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error: " + err.Error()})
		return
	}

	if err == nil {
		// User already clapped, so remove the clap (unclap)
		if err := database.DB.Delete(&existingActivity).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to unclap reply"})
			return
		}

		// Get updated clap count
		var clapCount int64
		database.DB.Model(&models.UserActivity{}).
			Where("reply_id = ? AND activity_type = ?", replyID, string(models.ActivityTypeClap)).
			Count(&clapCount)

		c.JSON(http.StatusOK, gin.H{
			"message":    "Reply unclaimed successfully",
			"clapped":    false,
			"clap_count": clapCount,
		})
		return
	}

	// User hasn't clapped yet, so add a clap
	activity := models.UserActivity{
		UserID:       userID,
		ReplyID:      &replyID,
		ActivityType: string(models.ActivityTypeClap),
	}

	if err := database.DB.Create(&activity).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to clap reply"})
		return
	}

	// Get updated clap count
	var clapCount int64
	database.DB.Model(&models.UserActivity{}).
		Where("reply_id = ? AND activity_type = ?", replyID, string(models.ActivityTypeClap)).
		Count(&clapCount)

	c.JSON(http.StatusOK, gin.H{
		"message":    "Reply clapped successfully",
		"clapped":    true,
		"clap_count": clapCount,
	})
}
