package controller

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/pdhoang91/blog/internal/model"
)

// ==================== COMMENT ROUTES ====================

// GetPostComments retrieves comments for a post
func (c *Controller) GetPostComments(ctx *gin.Context) {
	idParam := ctx.Param("id")
	postID, err := c.ParseUUID(idParam)
	if err != nil {
		c.Error(ctx, err)
		return
	}

	var req model.PaginationRequest
	if err := c.BindAndValidateQuery(ctx, &req); err != nil {
		c.Error(ctx, err)
		return
	}

	responses, totalComments, totalCommentReply, err := c.service.GetPostComments(postID, &req)
	if err != nil {
		c.Error(ctx, err)
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"data":                responses,
		"total_count":         totalComments,
		"total_comment_reply": totalCommentReply,
	})
}

// CreateComment creates a new comment
func (c *Controller) CreateComment(ctx *gin.Context) {
	userIDStr, err := c.GetUserIDFromContext(ctx)
	if err != nil {
		c.Error(ctx, err)
		return
	}

	userID, err := c.ParseUUID(userIDStr)
	if err != nil {
		c.Error(ctx, err)
		return
	}

	var req model.CreateCommentRequest
	if err := c.BindAndValidate(ctx, &req); err != nil {
		c.Error(ctx, err)
		return
	}

	response, err := c.service.CreateComment(userID, &req)
	if err != nil {
		c.Error(ctx, err)
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"data": response})
}

// UpdateComment updates a comment
func (c *Controller) UpdateComment(ctx *gin.Context) {
	idParam := ctx.Param("id")
	commentID, err := c.ParseUUID(idParam)
	if err != nil {
		c.Error(ctx, err)
		return
	}

	userIDStr, err := c.GetUserIDFromContext(ctx)
	if err != nil {
		c.Error(ctx, err)
		return
	}

	userID, err := c.ParseUUID(userIDStr)
	if err != nil {
		c.Error(ctx, err)
		return
	}

	var req model.UpdateCommentRequest
	if err := c.BindAndValidate(ctx, &req); err != nil {
		c.Error(ctx, err)
		return
	}

	response, err := c.service.UpdateComment(userID, commentID, &req)
	if err != nil {
		c.Error(ctx, err)
		return
	}

	c.Success(ctx, response)
}

// DeleteComment deletes a comment
func (c *Controller) DeleteComment(ctx *gin.Context) {
	idParam := ctx.Param("id")
	commentID, err := c.ParseUUID(idParam)
	if err != nil {
		c.Error(ctx, err)
		return
	}

	userIDStr, err := c.GetUserIDFromContext(ctx)
	if err != nil {
		c.Error(ctx, err)
		return
	}

	userID, err := c.ParseUUID(userIDStr)
	if err != nil {
		c.Error(ctx, err)
		return
	}

	err = c.service.DeleteComment(userID, commentID)
	if err != nil {
		c.Error(ctx, err)
		return
	}

	c.Success(ctx, gin.H{"message": "Comment deleted successfully"})
}

// ==================== REPLY ROUTES ====================

// CreateReply creates a new reply
func (c *Controller) CreateReply(ctx *gin.Context) {
	userIDStr, err := c.GetUserIDFromContext(ctx)
	if err != nil {
		c.Error(ctx, err)
		return
	}

	userID, err := c.ParseUUID(userIDStr)
	if err != nil {
		c.Error(ctx, err)
		return
	}

	var req model.CreateReplyRequest
	if err := c.BindAndValidate(ctx, &req); err != nil {
		c.Error(ctx, err)
		return
	}

	response, err := c.service.CreateReply(userID, &req)
	if err != nil {
		c.Error(ctx, err)
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"data": response})
}

// GetCommentReplies retrieves replies for a comment
func (c *Controller) GetCommentReplies(ctx *gin.Context) {
	idParam := ctx.Param("id")
	commentID, err := c.ParseUUID(idParam)
	if err != nil {
		c.Error(ctx, err)
		return
	}

	var req model.PaginationRequest
	if err := c.BindAndValidateQuery(ctx, &req); err != nil {
		c.Error(ctx, err)
		return
	}

	responses, total, err := c.service.GetCommentReplies(commentID, &req)
	if err != nil {
		c.Error(ctx, err)
		return
	}

	c.PaginatedSuccess(ctx, responses, total, req.Limit, req.Offset)
}

// UpdateReply updates a reply
func (c *Controller) UpdateReply(ctx *gin.Context) {
	idParam := ctx.Param("id")
	replyID, err := c.ParseUUID(idParam)
	if err != nil {
		c.Error(ctx, err)
		return
	}

	userIDStr, err := c.GetUserIDFromContext(ctx)
	if err != nil {
		c.Error(ctx, err)
		return
	}

	userID, err := c.ParseUUID(userIDStr)
	if err != nil {
		c.Error(ctx, err)
		return
	}

	var req model.UpdateReplyRequest
	if err := c.BindAndValidate(ctx, &req); err != nil {
		c.Error(ctx, err)
		return
	}

	response, err := c.service.UpdateReply(userID, replyID, &req)
	if err != nil {
		c.Error(ctx, err)
		return
	}

	c.Success(ctx, response)
}

// DeleteReply deletes a reply
func (c *Controller) DeleteReply(ctx *gin.Context) {
	idParam := ctx.Param("id")
	replyID, err := c.ParseUUID(idParam)
	if err != nil {
		c.Error(ctx, err)
		return
	}

	userIDStr, err := c.GetUserIDFromContext(ctx)
	if err != nil {
		c.Error(ctx, err)
		return
	}

	userID, err := c.ParseUUID(userIDStr)
	if err != nil {
		c.Error(ctx, err)
		return
	}

	err = c.service.DeleteReply(userID, replyID)
	if err != nil {
		c.Error(ctx, err)
		return
	}

	c.Success(ctx, gin.H{"message": "Reply deleted successfully"})
}
