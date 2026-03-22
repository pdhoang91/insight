package controller

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/pdhoang91/blog/internal/dto"
	"github.com/pdhoang91/blog/internal/service"
	uuid "github.com/satori/go.uuid"
)

type EngagementController struct {
	comment service.CommentService
}

func (c *EngagementController) CreateReplyForComment(ctx *gin.Context) {
	commentID, err := uuid.FromString(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid comment ID"})
		return
	}

	userID, ok := requireUserID(ctx)
	if !ok {
		return
	}

	var req struct {
		Content string `json:"content" binding:"required"`
	}
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	postID, err := c.comment.GetPostIDFromComment(commentID)
	if err != nil {
		respondError(ctx, err)
		return
	}

	replyReq := &dto.CreateReplyRequest{
		CommentID: commentID.String(), Content: req.Content, PostID: postID.String(),
	}

	response, err := c.comment.CreateReply(userID, replyReq)
	if err != nil {
		respondError(ctx, err)
		return
	}
	ctx.JSON(http.StatusCreated, gin.H{"data": response})
}
