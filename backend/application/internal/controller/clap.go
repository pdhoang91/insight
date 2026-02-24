package controller

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/pdhoang91/blog/internal/dto"
	uuid "github.com/satori/go.uuid"
)

func (c *Controller) ClapComment(ctx *gin.Context) {
	commentID, err := uuid.FromString(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid comment ID"})
		return
	}

	userID, ok := requireUserID(ctx)
	if !ok {
		return
	}

	isClapped, err := c.service.ClapComment(userID, commentID)
	if err != nil {
		respondError(ctx, err)
		return
	}

	clapCount, err := c.service.GetClapsCount("comment", commentID)
	if err != nil {
		ctx.JSON(http.StatusOK, gin.H{"clapped": isClapped, "message": "Comment clapped successfully"})
		return
	}
	ctx.JSON(http.StatusOK, gin.H{"clapped": isClapped, "clap_count": clapCount, "message": "Comment clapped successfully"})
}

func (c *Controller) ClapReply(ctx *gin.Context) {
	replyID, err := uuid.FromString(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid reply ID"})
		return
	}

	userID, ok := requireUserID(ctx)
	if !ok {
		return
	}

	isClapped, err := c.service.ClapReply(userID, replyID)
	if err != nil {
		respondError(ctx, err)
		return
	}

	clapCount, err := c.service.GetClapsCount("reply", replyID)
	if err != nil {
		ctx.JSON(http.StatusOK, gin.H{"clapped": isClapped, "message": "Reply clapped successfully"})
		return
	}
	ctx.JSON(http.StatusOK, gin.H{"clapped": isClapped, "clap_count": clapCount, "message": "Reply clapped successfully"})
}

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
		respondError(ctx, err)
		return
	}
	ctx.JSON(http.StatusOK, gin.H{"clap_count": count})
}

func (c *Controller) CreateReplyForComment(ctx *gin.Context) {
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

	postID, err := c.service.GetPostIDFromComment(commentID)
	if err != nil {
		respondError(ctx, err)
		return
	}

	replyReq := &dto.CreateReplyRequest{
		CommentID: commentID.String(), Content: req.Content, PostID: postID.String(),
	}

	response, err := c.service.CreateReply(userID, replyReq)
	if err != nil {
		respondError(ctx, err)
		return
	}
	ctx.JSON(http.StatusCreated, gin.H{"data": response})
}

func (c *Controller) CheckUserClapStatus(ctx *gin.Context) {
	userID, ok := optionalUserID(ctx)
	if !ok {
		ctx.JSON(http.StatusOK, gin.H{"has_clapped": false})
		return
	}

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

	hasClapped, err := c.service.HasUserClapped(userID, itemType, itemID)
	if err != nil {
		respondError(ctx, err)
		return
	}
	ctx.JSON(http.StatusOK, gin.H{"has_clapped": hasClapped})
}

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

	count, err := c.service.GetClapsCount(itemType, itemID)
	if err != nil {
		respondError(ctx, err)
		return
	}

	var hasClapped bool
	if userID, ok := optionalUserID(ctx); ok {
		hasClapped, _ = c.service.HasUserClapped(userID, itemType, itemID)
	}

	ctx.JSON(http.StatusOK, gin.H{"clap_count": count, "has_clapped": hasClapped})
}
