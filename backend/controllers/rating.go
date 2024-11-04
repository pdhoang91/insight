// controllers/rating.go
package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	uuid "github.com/satori/go.uuid"
	"gorm.io/gorm"

	"github.com/pdhoang91/blog/database"
	"github.com/pdhoang91/blog/models"
	"github.com/pdhoang91/blog/utils"
)

// CreateRating tạo hoặc cập nhật đánh giá cho một post
func CreateRating(c *gin.Context) {
	var input struct {
		PostID uuid.UUID `json:"post_id" binding:"required"`
		Score  uint      `json:"score" binding:"required,min=1,max=5"`
	}

	// Lấy userID từ context
	userID, err := utils.GetUserIDFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	// Bind input JSON
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var rating models.Rating
	// Kiểm tra xem đánh giá đã tồn tại chưa
	if err := database.DB.Where("post_id = ? AND user_id = ?", input.PostID, userID).First(&rating).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			// Tạo đánh giá mới
			rating = models.Rating{
				PostID: input.PostID,
				UserID: userID,
				Score:  input.Score,
			}
			if err := database.DB.Create(&rating).Error; err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	} else {
		// Cập nhật đánh giá hiện tại
		rating.Score = input.Score
		if err := database.DB.Save(&rating).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{"data": rating})
}

func GetRatingForPost(c *gin.Context) {
	var post models.Post
	id := c.Param("id")
	// Chuyển đổi id sang uuid.UUID
	postID, err := uuid.FromString(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid UUID format"})
		return
	}

	// Fetch the post
	if err := database.DB.First(&post, postID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Post not found"})
		return
	}

	// Fetch ratings for the post
	var ratings []models.Rating
	if err := database.DB.Where("post_id = ?", postID).Find(&ratings).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load ratings"})
		return
	}

	// Calculate the average rating
	var totalScore uint
	var count uint
	userRatings := make(map[uuid.UUID]uint) // userID -> score

	for _, rating := range ratings {
		if existingScore, exists := userRatings[rating.UserID]; !exists || existingScore < rating.Score {
			userRatings[rating.UserID] = rating.Score
		}
	}

	for _, score := range userRatings {
		totalScore += score
		count++
	}

	var averageRating float64
	if count > 0 {
		averageRating = float64(totalScore) / float64(count)
	}

	c.JSON(http.StatusOK, gin.H{
		"post":           post,
		"average_rating": averageRating,
	})
}
