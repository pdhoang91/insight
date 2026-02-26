package controller

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/pdhoang91/blog/internal/dto"
	"github.com/pdhoang91/blog/internal/service"
	uuid "github.com/satori/go.uuid"
)

type EngagementController struct {
	svc     service.EngagementService
	post    service.PostService
	comment service.CommentService
}

func (c *EngagementController) ClapPost(ctx *gin.Context) {
	postID, err := uuid.FromString(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid post ID"})
		return
	}

	userID, ok := requireUserID(ctx)
	if !ok {
		return
	}

	isClapped, err := c.svc.ClapPost(userID, postID)
	if err != nil {
		respondError(ctx, err)
		return
	}

	postResponse, err := c.post.GetPost(postID)
	if err != nil {
		ctx.JSON(http.StatusOK, gin.H{"clapped": isClapped, "message": "Post clapped successfully"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"clapped": isClapped, "clap_count": postResponse.ClapCount,
		"message": "Post clapped successfully",
	})
}

func (c *EngagementController) ClapComment(ctx *gin.Context) {
	commentID, err := uuid.FromString(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid comment ID"})
		return
	}

	userID, ok := requireUserID(ctx)
	if !ok {
		return
	}

	isClapped, err := c.svc.ClapComment(userID, commentID)
	if err != nil {
		respondError(ctx, err)
		return
	}

	clapCount, err := c.svc.GetClapsCount("comment", commentID)
	if err != nil {
		ctx.JSON(http.StatusOK, gin.H{"clapped": isClapped, "message": "Comment clapped successfully"})
		return
	}
	ctx.JSON(http.StatusOK, gin.H{"clapped": isClapped, "clap_count": clapCount, "message": "Comment clapped successfully"})
}

func (c *EngagementController) ClapReply(ctx *gin.Context) {
	replyID, err := uuid.FromString(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid reply ID"})
		return
	}

	userID, ok := requireUserID(ctx)
	if !ok {
		return
	}

	isClapped, err := c.svc.ClapReply(userID, replyID)
	if err != nil {
		respondError(ctx, err)
		return
	}

	clapCount, err := c.svc.GetClapsCount("reply", replyID)
	if err != nil {
		ctx.JSON(http.StatusOK, gin.H{"clapped": isClapped, "message": "Reply clapped successfully"})
		return
	}
	ctx.JSON(http.StatusOK, gin.H{"clapped": isClapped, "clap_count": clapCount, "message": "Reply clapped successfully"})
}

func (c *EngagementController) GetClapsCount(ctx *gin.Context) {
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

	count, err := c.svc.GetClapsCount(itemType, itemID)
	if err != nil {
		respondError(ctx, err)
		return
	}
	ctx.JSON(http.StatusOK, gin.H{"clap_count": count})
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

func (c *EngagementController) CheckUserClapStatus(ctx *gin.Context) {
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

	hasClapped, err := c.svc.HasUserClapped(userID, itemType, itemID)
	if err != nil {
		respondError(ctx, err)
		return
	}
	ctx.JSON(http.StatusOK, gin.H{"has_clapped": hasClapped})
}

func (c *EngagementController) GetClapInfo(ctx *gin.Context) {
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

	count, err := c.svc.GetClapsCount(itemType, itemID)
	if err != nil {
		respondError(ctx, err)
		return
	}

	var hasClapped bool
	if userID, ok := optionalUserID(ctx); ok {
		hasClapped, _ = c.svc.HasUserClapped(userID, itemType, itemID)
	}

	ctx.JSON(http.StatusOK, gin.H{"clap_count": count, "has_clapped": hasClapped})
}
