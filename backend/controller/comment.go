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

// GetComments lấy danh sách bình luận cho một bài viết cùng với các reply và user của mỗi reply
func GetComments(c *gin.Context) {

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

	// Đếm tổng số bình luận liên quan đến bài post
	if err := database.DB.Model(&models.Comment{}).Where("post_id = ?", postID).Count(&totalComments).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Lấy danh sách bình luận, preload Replies cùng với User cho mỗi Reply và User cho Comment
	result := database.DB.Preload("Replies.User").Preload("User").
		Where("post_id = ?", postID).
		Order("created_at desc").
		Limit(limit).
		Offset(offset).
		Find(&comments)

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}

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

func CreateReply(c *gin.Context) {
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
	if err = database.DB.First(&user, userID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "User not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Kiểm tra xem CommentID có tồn tại trong bảng Comments không
	var comment models.Comment
	if err = database.DB.First(&comment, input.CommentID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Comment not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	reply := models.Reply{
		CommentID: input.CommentID,
		UserID:    userID,
		Content:   input.Content,
	}

	if err = database.DB.Create(&reply).Error; err != nil {
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
	database.DB.Create(&userActivity)

	c.JSON(http.StatusOK, gin.H{"data": reply})
}
