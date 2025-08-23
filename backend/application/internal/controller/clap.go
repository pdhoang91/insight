package controller

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/pdhoang91/blog/internal/dto"
	uuid "github.com/satori/go.uuid"
)

// ClapComment handles clap/unclap action for a comment
func (c *Controller) ClapComment(ctx *gin.Context) {
	// Get comment ID from URL
	commentIDStr := ctx.Param("id")
	commentID, err := uuid.FromString(commentIDStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid comment ID"})
		return
	}

	// Get user ID from context (authentication required)
	userIDStr, exists := ctx.Get("userID")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	userID, err := uuid.FromString(userIDStr.(string))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	// Toggle clap
	isClapped, err := c.service.ClapComment(userID, commentID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to clap comment"})
		return
	}

	// Get updated clap count
	clapCount, err := c.service.GetClapsCount("comment", commentID)
	if err != nil {
		// If we can't get updated count, just return clap status
		ctx.JSON(http.StatusOK, gin.H{
			"clapped": isClapped,
			"message": "Comment clapped successfully",
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"clapped":    isClapped,
		"clap_count": clapCount,
		"message":    "Comment clapped successfully",
	})
}

// ClapReply handles clap/unclap action for a reply
func (c *Controller) ClapReply(ctx *gin.Context) {
	// Get reply ID from URL
	replyIDStr := ctx.Param("id")
	replyID, err := uuid.FromString(replyIDStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid reply ID"})
		return
	}

	// Get user ID from context (authentication required)
	userIDStr, exists := ctx.Get("userID")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	userID, err := uuid.FromString(userIDStr.(string))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	// Toggle clap
	isClapped, err := c.service.ClapReply(userID, replyID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to clap reply"})
		return
	}

	// Get updated clap count
	clapCount, err := c.service.GetClapsCount("reply", replyID)
	if err != nil {
		// If we can't get updated count, just return clap status
		ctx.JSON(http.StatusOK, gin.H{
			"clapped": isClapped,
			"message": "Reply clapped successfully",
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"clapped":    isClapped,
		"clap_count": clapCount,
		"message":    "Reply clapped successfully",
	})
}

// GetClapsCount returns clap count for items
func (c *Controller) GetClapsCount(ctx *gin.Context) {
	itemType := ctx.Query("type")
	itemIDStr := ctx.Query("id")

	if itemType == "" || itemIDStr == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Missing type or id parameter"})
		return
	}

	itemID, err := uuid.FromString(itemIDStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID format"})
		return
	}

	count, err := c.service.GetClapsCount(itemType, itemID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get claps count"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"clap_count": count,
	})
}

// CreateReplyForComment creates a reply for a specific comment (alternative endpoint)
func (c *Controller) CreateReplyForComment(ctx *gin.Context) {
	// Get comment ID from URL parameter
	commentIDStr := ctx.Param("id")
	commentID, err := uuid.FromString(commentIDStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid comment ID"})
		return
	}

	userIDStr, exists := ctx.Get("userID")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	userID, err := uuid.FromString(userIDStr.(string))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	var req struct {
		Content string `json:"content" binding:"required"`
	}
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	// Get post_id from comment
	postID, err := c.service.GetPostIDFromComment(commentID)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Comment not found"})
		return
	}

	// Create the proper request structure
	replyReq := &dto.CreateReplyRequest{
		CommentID: commentID.String(),
		Content:   req.Content,
		PostID:    postID.String(),
	}

	// Call service with proper structure
	response, err := c.service.CreateReply(userID, replyReq)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusCreated, gin.H{"data": response})
}

// CheckUserClapStatus checks if user has clapped an item
func (c *Controller) CheckUserClapStatus(ctx *gin.Context) {
	// Get user ID from context (optional - if not authenticated, return false)
	userIDStr, exists := ctx.Get("userID")
	if !exists {
		ctx.JSON(http.StatusOK, gin.H{"has_clapped": false})
		return
	}

	userID, err := uuid.FromString(userIDStr.(string))
	if err != nil {
		ctx.JSON(http.StatusOK, gin.H{"has_clapped": false})
		return
	}

	// Get query parameters
	itemType := ctx.Query("type")
	itemIDStr := ctx.Query("id")

	if itemType == "" || itemIDStr == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Missing type or id parameter"})
		return
	}

	itemID, err := uuid.FromString(itemIDStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid id format"})
		return
	}

	// Check if user has clapped
	hasClapped, err := c.service.HasUserClapped(userID, itemType, itemID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check clap status"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"has_clapped": hasClapped})
}

// GetClapInfo returns both clap count and user clap status in one call
func (c *Controller) GetClapInfo(ctx *gin.Context) {
	itemType := ctx.Query("type")
	itemIDStr := ctx.Query("id")

	if itemType == "" || itemIDStr == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Missing type or id parameter"})
		return
	}

	itemID, err := uuid.FromString(itemIDStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID format"})
		return
	}

	// Get clap count
	count, err := c.service.GetClapsCount(itemType, itemID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get claps count"})
		return
	}

	// Check if user has clapped (optional - if not authenticated, return false)
	var hasClapped bool
	if userIDStr, exists := ctx.Get("userID"); exists {
		if userID, err := uuid.FromString(userIDStr.(string)); err == nil {
			hasClapped, _ = c.service.HasUserClapped(userID, itemType, itemID)
		}
	}

	ctx.JSON(http.StatusOK, gin.H{
		"clap_count":  count,
		"has_clapped": hasClapped,
	})
}
