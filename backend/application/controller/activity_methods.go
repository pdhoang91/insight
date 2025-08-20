// controller/activity_methods.go
package controller

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/pdhoang91/blog/models"
	"github.com/pdhoang91/blog/utils"
	uuid "github.com/satori/go.uuid"
	"gorm.io/gorm"
)

// HandleClapPost handles clapping a post using unified controller
func (ctrl *Controller) HandleClapPost(c *gin.Context) {
	postIDStr := c.Param("id")
	postID, err := uuid.FromString(postIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid UUID format"})
		return
	}

	userID, err := utils.GetUserIDFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	// Check if post exists
	var post models.Post
	if err := ctrl.DB.First(&post, postID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Post not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get post"})
		}
		return
	}

	// Check if user already has clap activity for this post
	var existingActivity models.UserActivity
	err = ctrl.DB.Where("user_id = ? AND post_id = ? AND action_type = ?", userID, postID, "clap_post").First(&existingActivity).Error

	if err == nil {
		// User already has clap activity, increment the count
		existingActivity.ClapCount++
		existingActivity.UpdatedAt = time.Now()
		if err := ctrl.DB.Save(&existingActivity).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update clap count"})
			return
		}
	} else if err == gorm.ErrRecordNotFound {
		// Create new clap activity
		newActivity := models.UserActivity{
			UserID:     userID,
			PostID:     &postID,
			ActionType: "clap_post",
			ClapCount:  1,
		}

		if err := ctrl.DB.Create(&newActivity).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to record clap activity"})
			return
		}
	} else {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check existing clap"})
		return
	}

	// Get updated clap count (sum of all clap_count from all users)
	var totalClapCount int64
	ctrl.DB.Model(&models.UserActivity{}).
		Select("COALESCE(SUM(clap_count), 0)").
		Where("post_id = ? AND action_type = ?", postID, "clap_post").
		Scan(&totalClapCount)

	c.JSON(http.StatusOK, gin.H{
		"message":    "Clapped successfully",
		"clap_count": totalClapCount,
	})
}

// HandleUnclapPost handles unclapping a post using unified controller
func (ctrl *Controller) HandleUnclapPost(c *gin.Context) {
	postIDStr := c.Param("id")
	postID, err := uuid.FromString(postIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid UUID format"})
		return
	}

	userID, err := utils.GetUserIDFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	// Find the clap activity and decrement count
	var existingActivity models.UserActivity
	err = ctrl.DB.Where("user_id = ? AND post_id = ? AND action_type = ?", userID, postID, "clap_post").First(&existingActivity).Error

	if err == gorm.ErrRecordNotFound {
		c.JSON(http.StatusNotFound, gin.H{"error": "Clap not found"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to find clap"})
		return
	}

	// Decrement clap count
	if existingActivity.ClapCount > 1 {
		// If user has multiple claps, just decrement
		existingActivity.ClapCount--
		existingActivity.UpdatedAt = time.Now()
		if err := ctrl.DB.Save(&existingActivity).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update clap count"})
			return
		}
	} else {
		// If user has only 1 clap, delete the record
		if err := ctrl.DB.Delete(&existingActivity).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to remove clap"})
			return
		}
	}

	// Get updated clap count (sum of all clap_count from all users)
	var totalClapCount int64
	ctrl.DB.Model(&models.UserActivity{}).
		Select("COALESCE(SUM(clap_count), 0)").
		Where("post_id = ? AND action_type = ?", postID, "clap_post").
		Scan(&totalClapCount)

	c.JSON(http.StatusOK, gin.H{
		"message":    "Unclapped successfully",
		"clap_count": totalClapCount,
	})
}

// HandleClapComment handles clapping a comment using unified controller
func (ctrl *Controller) HandleClapComment(c *gin.Context) {
	commentIDStr := c.Param("id")
	commentID, err := uuid.FromString(commentIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid UUID format"})
		return
	}

	userID, err := utils.GetUserIDFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	// Check if comment exists
	var comment models.Comment
	if err := ctrl.DB.First(&comment, commentID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Comment not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get comment"})
		}
		return
	}

	// Check if user already has clap activity for this comment
	var existingActivity models.UserActivity
	err = ctrl.DB.Where("user_id = ? AND comment_id = ? AND action_type = ?", userID, commentID, "clap_comment").First(&existingActivity).Error

	if err == nil {
		// User already has clap activity, increment the count
		existingActivity.ClapCount++
		existingActivity.UpdatedAt = time.Now()
		if err := ctrl.DB.Save(&existingActivity).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update clap count"})
			return
		}
	} else if err == gorm.ErrRecordNotFound {
		// Create new clap activity
		newActivity := models.UserActivity{
			UserID:     userID,
			CommentID:  &commentID,
			ActionType: "clap_comment",
			ClapCount:  1,
		}

		if err := ctrl.DB.Create(&newActivity).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to record clap activity"})
			return
		}
	} else {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check existing clap"})
		return
	}

	// Get updated clap count (sum of all clap_count from all users)
	var totalClapCount int64
	ctrl.DB.Model(&models.UserActivity{}).
		Select("COALESCE(SUM(clap_count), 0)").
		Where("comment_id = ? AND action_type = ?", commentID, "clap_comment").
		Scan(&totalClapCount)

	c.JSON(http.StatusOK, gin.H{
		"message":    "Clapped successfully",
		"clap_count": totalClapCount,
	})
}

// HandleClapReply handles clapping a reply using unified controller
func (ctrl *Controller) HandleClapReply(c *gin.Context) {
	replyIDStr := c.Param("id")
	replyID, err := uuid.FromString(replyIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid UUID format"})
		return
	}

	userID, err := utils.GetUserIDFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	// Check if reply exists
	var reply models.Reply
	if err := ctrl.DB.First(&reply, replyID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Reply not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get reply"})
		}
		return
	}

	// Check if user already has clap activity for this reply
	var existingActivity models.UserActivity
	err = ctrl.DB.Where("user_id = ? AND reply_id = ? AND action_type = ?", userID, replyID, "clap_reply").First(&existingActivity).Error

	if err == nil {
		// User already has clap activity, increment the count
		existingActivity.ClapCount++
		existingActivity.UpdatedAt = time.Now()
		if err := ctrl.DB.Save(&existingActivity).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update clap count"})
			return
		}
	} else if err == gorm.ErrRecordNotFound {
		// Create new clap activity
		newActivity := models.UserActivity{
			UserID:     userID,
			ReplyID:    &replyID,
			ActionType: "clap_reply",
			ClapCount:  1,
		}

		if err := ctrl.DB.Create(&newActivity).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to record clap activity"})
			return
		}
	} else {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check existing clap"})
		return
	}

	// Get updated clap count (sum of all clap_count from all users)
	var totalClapCount int64
	ctrl.DB.Model(&models.UserActivity{}).
		Select("COALESCE(SUM(clap_count), 0)").
		Where("reply_id = ? AND action_type = ?", replyID, "clap_reply").
		Scan(&totalClapCount)

	c.JSON(http.StatusOK, gin.H{
		"message":    "Clapped successfully",
		"clap_count": totalClapCount,
	})
}

// HandleUnclapComment handles unclapping a comment using unified controller
func (ctrl *Controller) HandleUnclapComment(c *gin.Context) {
	commentIDStr := c.Param("id")
	commentID, err := uuid.FromString(commentIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid UUID format"})
		return
	}

	userID, err := utils.GetUserIDFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	// Find the clap activity and decrement count
	var existingActivity models.UserActivity
	err = ctrl.DB.Where("user_id = ? AND comment_id = ? AND action_type = ?", userID, commentID, "clap_comment").First(&existingActivity).Error

	if err == gorm.ErrRecordNotFound {
		c.JSON(http.StatusNotFound, gin.H{"error": "Clap not found"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to find clap"})
		return
	}

	// Decrement clap count
	if existingActivity.ClapCount > 1 {
		// If user has multiple claps, just decrement
		existingActivity.ClapCount--
		existingActivity.UpdatedAt = time.Now()
		if err := ctrl.DB.Save(&existingActivity).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update clap count"})
			return
		}
	} else {
		// If user has only 1 clap, delete the record
		if err := ctrl.DB.Delete(&existingActivity).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to remove clap"})
			return
		}
	}

	// Get updated clap count (sum of all clap_count from all users)
	var totalClapCount int64
	ctrl.DB.Model(&models.UserActivity{}).
		Select("COALESCE(SUM(clap_count), 0)").
		Where("comment_id = ? AND action_type = ?", commentID, "clap_comment").
		Scan(&totalClapCount)

	c.JSON(http.StatusOK, gin.H{
		"message":    "Unclapped successfully",
		"clap_count": totalClapCount,
	})
}

// HandleUnclapReply handles unclapping a reply using unified controller
func (ctrl *Controller) HandleUnclapReply(c *gin.Context) {
	replyIDStr := c.Param("id")
	replyID, err := uuid.FromString(replyIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid UUID format"})
		return
	}

	userID, err := utils.GetUserIDFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	// Find the clap activity and decrement count
	var existingActivity models.UserActivity
	err = ctrl.DB.Where("user_id = ? AND reply_id = ? AND action_type = ?", userID, replyID, "clap_reply").First(&existingActivity).Error

	if err == gorm.ErrRecordNotFound {
		c.JSON(http.StatusNotFound, gin.H{"error": "Clap not found"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to find clap"})
		return
	}

	// Decrement clap count
	if existingActivity.ClapCount > 1 {
		// If user has multiple claps, just decrement
		existingActivity.ClapCount--
		existingActivity.UpdatedAt = time.Now()
		if err := ctrl.DB.Save(&existingActivity).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update clap count"})
			return
		}
	} else {
		// If user has only 1 clap, delete the record
		if err := ctrl.DB.Delete(&existingActivity).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to remove clap"})
			return
		}
	}

	// Get updated clap count (sum of all clap_count from all users)
	var totalClapCount int64
	ctrl.DB.Model(&models.UserActivity{}).
		Select("COALESCE(SUM(clap_count), 0)").
		Where("reply_id = ? AND action_type = ?", replyID, "clap_reply").
		Scan(&totalClapCount)

	c.JSON(http.StatusOK, gin.H{
		"message":    "Unclapped successfully",
		"clap_count": totalClapCount,
	})
}
