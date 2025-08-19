// controller/controller_comment.go
package controller

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	uuid "github.com/satori/go.uuid"

	"github.com/pdhoang91/blog/database"
	"github.com/pdhoang91/blog/models"
	"github.com/pdhoang91/blog/utils"
)

// ===== COMMENT METHODS =====

// GetComments returns comments for a post
func (ctrl *Controller) GetComments(c *gin.Context) {
	postIDStr := c.Param("id")
	postID, err := uuid.FromString(postIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid post ID"})
		return
	}

	page, err := strconv.Atoi(c.DefaultQuery("page", "1"))
	if err != nil || page < 1 {
		page = 1
	}
	limit, err := strconv.Atoi(c.DefaultQuery("limit", "10"))
	if err != nil || limit < 1 {
		limit = 10
	}
	offset := (page - 1) * limit

	var comments []models.Comment
	var total int64

	// Count total comments
	database.DB.Model(&models.Comment{}).Where("post_id = ?", postID).Count(&total)

	// Get comments with pagination
	if err := database.DB.Where("post_id = ?", postID).
		Preload("User").
		Preload("Replies.User").
		Order("created_at desc").
		Limit(limit).
		Offset(offset).
		Find(&comments).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch comments"})
		return
	}

	// Calculate clap counts for comments and replies
	calculateCommentCounts(comments)

	c.JSON(http.StatusOK, gin.H{
		"data":        comments,
		"total_count": total,
		"page":        page,
		"limit":       limit,
		"total_pages": (total + int64(limit) - 1) / int64(limit),
	})
}

// CreateComment creates a new comment
func (ctrl *Controller) CreateComment(c *gin.Context) {
	postIDStr := c.Param("id")
	postID, err := uuid.FromString(postIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid post ID"})
		return
	}

	var input struct {
		Content string `json:"content" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID, err := utils.GetUserIDFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// Verify post exists
	var post models.Post
	if err := database.DB.First(&post, postID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Post not found"})
		return
	}

	comment := models.Comment{
		PostID:  postID,
		UserID:  userID,
		Content: input.Content,
	}

	if err := database.DB.Create(&comment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create comment"})
		return
	}

	// Load user data
	database.DB.Preload("User").First(&comment, comment.ID)

	// Calculate clap count for the new comment
	calculateSingleCommentCounts(&comment)

	c.JSON(http.StatusCreated, gin.H{"data": comment})
}

// CreateReply creates a reply to a comment
func (ctrl *Controller) CreateReply(c *gin.Context) {
	commentIDStr := c.Param("comment_id")
	commentID, err := uuid.FromString(commentIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid comment ID"})
		return
	}

	var input struct {
		Content string `json:"content" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID, err := utils.GetUserIDFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// Verify comment exists
	var comment models.Comment
	if err := database.DB.First(&comment, commentID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Comment not found"})
		return
	}

	reply := models.Reply{
		CommentID: commentID,
		UserID:    userID,
		Content:   input.Content,
	}

	if err := database.DB.Create(&reply).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create reply"})
		return
	}

	// Load user data
	database.DB.Preload("User").First(&reply, reply.ID)

	// Calculate clap count for the new reply
	calculateSingleReplyCounts(&reply)

	c.JSON(http.StatusCreated, gin.H{"data": reply})
}
