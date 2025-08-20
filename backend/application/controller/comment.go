package controller

import (
	"errors"
	"fmt"
	"net/http"
	"regexp"

	uuid "github.com/satori/go.uuid"
	"gorm.io/gorm"

	"github.com/pdhoang91/blog/database"
	"github.com/pdhoang91/blog/models"
	"github.com/pdhoang91/blog/utils"

	"github.com/gin-gonic/gin"
)

// calculateCommentClapCounts calculates clap counts for comments and their replies
func (ctrl *Controller) calculateCommentClapCounts(comments []models.Comment) {
	if len(comments) == 0 {
		return
	}

	// Extract comment IDs and reply IDs for bulk queries
	commentIDs := make([]uuid.UUID, len(comments))
	var replyIDs []uuid.UUID

	for i, comment := range comments {
		commentIDs[i] = comment.ID
		for _, reply := range comment.Replies {
			replyIDs = append(replyIDs, reply.ID)
		}
	}

	// Bulk query for comment clap counts
	type ClapCountResult struct {
		ID        uuid.UUID `json:"id"`
		ClapCount int64     `json:"clap_count"`
	}

	var commentClapCounts []ClapCountResult
	if len(commentIDs) > 0 {
		ctrl.DB.Model(&models.UserActivity{}).
			Select("comment_id as id, COALESCE(SUM(clap_count), 0) as clap_count").
			Where("comment_id IN ? AND action_type = ?", commentIDs, "clap_comment").
			Group("comment_id").
			Scan(&commentClapCounts)
	}

	// Bulk query for reply clap counts
	var replyClapCounts []ClapCountResult
	if len(replyIDs) > 0 {
		ctrl.DB.Model(&models.UserActivity{}).
			Select("reply_id as id, COALESCE(SUM(clap_count), 0) as clap_count").
			Where("reply_id IN ? AND action_type = ?", replyIDs, "clap_reply").
			Group("reply_id").
			Scan(&replyClapCounts)
	}

	// Create maps for quick lookup
	commentClapCountMap := make(map[uuid.UUID]int64)
	for _, cc := range commentClapCounts {
		commentClapCountMap[cc.ID] = cc.ClapCount
	}

	replyClapCountMap := make(map[uuid.UUID]int64)
	for _, rc := range replyClapCounts {
		replyClapCountMap[rc.ID] = rc.ClapCount
	}

	// Assign clap counts to comments and replies
	// Now uses denormalized counts for better performance with fallback
	for i := range comments {
		// Use denormalized count first, fallback to calculated if needed
		if comments[i].ClapsCount > 0 {
			comments[i].ClapCount = comments[i].ClapsCount
		} else {
			comments[i].ClapCount = uint64(commentClapCountMap[comments[i].ID])
		}

		for j := range comments[i].Replies {
			// Use denormalized count first, fallback to calculated if needed
			if comments[i].Replies[j].ClapsCount > 0 {
				comments[i].Replies[j].ClapCount = comments[i].Replies[j].ClapsCount
			} else {
				comments[i].Replies[j].ClapCount = uint64(replyClapCountMap[comments[i].Replies[j].ID])
			}
		}
	}
}

// GetComments lấy danh sách bình luận cho một bài viết cùng với các reply và user của mỗi reply
func (ctrl *Controller) GetComments(c *gin.Context) {

	postIDStr := c.Param("id")
	postID, err := uuid.FromString(postIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid UUID format"})
		return
	}

	var comments []models.Comment
	var totalComments int64

	// Sử dụng hàm helper để lấy các tham số phân trang
	pagingParams, err := utils.GetPagingParams(c)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid paging parameters"})
		return
	}
	offset := (pagingParams.Page - 1) * pagingParams.Limit
	limit := pagingParams.Limit

	// Đếm tổng số bình luận liên quan đến bài post (chỉ active comments)
	if err := ctrl.DB.Model(&models.Comment{}).Where("post_id = ? AND status = ?", postID, "active").Count(&totalComments).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Lấy danh sách bình luận, preload Replies cùng với User cho mỗi Reply và User cho Comment
	result := ctrl.DB.Preload("Replies", "status = ?", "active").Preload("Replies.User").Preload("User").
		Where("post_id = ? AND status = ?", postID, "active").
		Order("created_at desc").
		Limit(limit).
		Offset(offset).
		Find(&comments)

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}

	// Calculate clap counts for comments and replies
	ctrl.calculateCommentClapCounts(comments)

	// Tính tổng số reply cho mỗi comment
	totalCommentReply := totalComments
	for _, comment := range comments {
		totalCommentReply += int64(len(comment.Replies)) // Cộng số lượng reply của từng comment
	}

	c.JSON(http.StatusOK, gin.H{
		"data":                comments,
		"total_count":         totalComments,
		"total_comment_reply": totalCommentReply,
	})
}

// CreateComment tạo một bình luận mới cho bài viết
func CreateComment(c *gin.Context) {
	// Lấy userID từ context
	userID, err := utils.GetUserIDFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	var input struct {
		Content string    `json:"content" binding:"required"`
		PostID  uuid.UUID `json:"post_id" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Kiểm tra xem AuthorID có tồn tại trong bảng Users không
	var user models.User
	if err = database.DB.First(&user, userID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid AuthorID: User not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	comment := models.Comment{
		PostID:  input.PostID,
		UserID:  userID,
		Content: input.Content,
	}

	if err = database.DB.Create(&comment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Ghi lại hoạt động tạo bình luận
	userActivity := models.UserActivity{
		UserID:     userID,
		PostID:     &comment.PostID,
		CommentID:  &comment.ID,
		ActionType: "comment_created",
	}
	database.DB.Create(&userActivity)

	// Preload User và Replies sau khi tạo bình luận
	if err = database.DB.Preload("User").Preload("Replies").First(&comment, comment.ID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Parse mentions from content
	mentionedUserIDs, err := parseMentions(comment.Content)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
	}

	// Create notifications for mentioned users
	for _, mentionedUserID := range mentionedUserIDs {
		message := fmt.Sprintf("You were mentioned in a comment by %s.", user.Name)
		utils.CreateNotification(mentionedUserID, models.NotificationTypeMention, message, comment.ID)
	}

	c.JSON(http.StatusOK, gin.H{"data": comment})
}

// parseMentions phân tích và trả về danh sách userID được nhắc đến trong bình luận
func parseMentions(content string) ([]uuid.UUID, error) {
	mentionRegex := regexp.MustCompile(`@(\w+)`)
	matches := mentionRegex.FindAllStringSubmatch(content, -1)

	var userIDs []uuid.UUID
	for _, match := range matches {
		username := match[1]
		var user models.User
		if err := database.DB.Where("name = ?", username).First(&user).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				// Nếu user không tồn tại, bạn có thể bỏ qua hoặc trả về lỗi
				continue
			}
			return nil, err
		}
		userIDs = append(userIDs, user.ID)
	}
	return userIDs, nil
}

// CreateReply creates a new reply for a comment using unified controller
func (ctrl *Controller) CreateReply(c *gin.Context) {
	// Lấy userID từ context
	userID, err := utils.GetUserIDFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	var input struct {
		Content   string    `json:"content" binding:"required"`    // Nội dung phản hồi
		CommentID uuid.UUID `json:"comment_id" binding:"required"` // ID của bình luận
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Kiểm tra xem UserID có tồn tại trong bảng Users không
	var user models.User
	if err = ctrl.DB.First(&user, userID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "User not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Kiểm tra xem CommentID có tồn tại trong bảng Comments không
	var comment models.Comment
	if err = ctrl.DB.First(&comment, input.CommentID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Comment not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	reply := models.Reply{
		CommentID: input.CommentID,
		PostID:    comment.PostID, // Get PostID from the comment
		UserID:    userID,
		Content:   input.Content,
	}

	if err = ctrl.DB.Create(&reply).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Ghi lại hoạt động tạo phản hồi
	userActivity := models.UserActivity{
		UserID:     userID,
		CommentID:  &reply.CommentID,
		ReplyID:    &reply.ID,
		ActionType: "reply_created",
	}
	ctrl.DB.Create(&userActivity)

	c.JSON(http.StatusOK, gin.H{"data": reply})
}
