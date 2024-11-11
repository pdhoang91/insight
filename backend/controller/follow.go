// controllers/follơ.go
package controller

import (
	"fmt"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	uuid "github.com/satori/go.uuid"

	"github.com/pdhoang91/blog/database"
	"github.com/pdhoang91/blog/models"
	"github.com/pdhoang91/blog/utils"

	"gorm.io/gorm"
)

func FollowUser(c *gin.Context) {
	var input struct {
		FollowingID uuid.UUID `json:"following_id" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID, err := utils.GetUserIDFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	var existingFollow models.Follow
	if err := database.DB.Where("follower_id = ? AND following_id = ?", userID, input.FollowingID).First(&existingFollow).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"message": "You are already following this user"})
		return
	} else if err != gorm.ErrRecordNotFound {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	follow := models.Follow{
		FollowerID:  userID,
		FollowingID: input.FollowingID,
	}

	if err := database.DB.Create(&follow).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": follow})
}
func UnfollowUser(c *gin.Context) {

	userID, err := utils.GetUserIDFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	//followingID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	//if err != nil {
	//	c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
	//	return
	//}
	followingIDStr := c.Param("id")
	// Chuyển đổi id sang uuid.UUID
	followingID, err := uuid.FromString(followingIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid UUID format"})
		return
	}

	var follow models.Follow
	if err := database.DB.Where("follower_id = ? AND following_id = ?", userID, followingID).First(&follow).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"message": "You are not following this user"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if err := database.DB.Delete(&follow).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Unfollowed successfully"})
}

func GetFollowingPosts(c *gin.Context) {
	userID, err := utils.GetUserIDFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	var follows []models.Follow
	if err := database.DB.Where("follower_id = ?", userID).Find(&follows).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var followingIDs []uuid.UUID
	for _, follow := range follows {
		followingIDs = append(followingIDs, follow.FollowingID)
	}

	// Thêm log để kiểm tra danh sách followingIDs
	fmt.Println("Following IDs:", followingIDs)

	// Kiểm tra nếu followingIDs rỗng
	if len(followingIDs) == 0 {
		// Trả về danh sách rỗng
		c.JSON(http.StatusOK, gin.H{
			"data":        []models.Post{},
			"total_count": 0,
		})
		return
	}

	var posts []models.Post
	if err = database.DB.Preload("User").Where("user_id IN ?", followingIDs).Find(&posts).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Thêm log để kiểm tra danh sách posts
	fmt.Println("Posts:", posts)

	// Trả về danh sách bài viết
	c.JSON(http.StatusOK, gin.H{
		"data":        posts,
		"total_count": len(posts),
	})
}

// CheckFollowingStatus kiểm tra xem người dùng hiện tại có theo dõi người dùng khác hay không
func CheckFollowingStatus(c *gin.Context) {

	userID, err := utils.GetUserIDFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	followingIDStr := c.Param("id")
	// Chuyển đổi id sang uuid.UUID
	followingID, err := uuid.FromString(followingIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid UUID format"})
		return
	}

	//// Chuyển đổi ID người dùng cần kiểm tra từ chuỗi sang uint
	//followingID, err := strconv.ParseUint(followingIDStr, 10, 32)
	//if err != nil {
	//	c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
	//	return
	//}

	var follow models.Follow
	// Kiểm tra trong cơ sở dữ liệu xem có bản ghi nào trong bảng Follow không
	if err := database.DB.Where("follower_id = ? AND following_id = ?", userID, followingID).First(&follow).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			// Nếu không tìm thấy, trả về false
			c.JSON(http.StatusOK, gin.H{"isFollowing": false})
			return
		}
		// Nếu có lỗi khác, trả về lỗi server
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Nếu tìm thấy bản ghi, trả về true
	c.JSON(http.StatusOK, gin.H{"isFollowing": true})
}

// controllers/follow.go

func GetSuggestedProfiles(c *gin.Context) {
	userID, err := utils.GetUserIDFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	// Lấy tham số phân trang
	pagingParams, err := utils.GetPagingParams(c)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid paging parameters"})
		return
	}

	profiles, total, err := fetchSuggestedProfiles(userID, pagingParams.Page, pagingParams.Limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Chuẩn bị dữ liệu phản hồi
	type UserResponse struct {
		ID        uuid.UUID `json:"id"`
		Name      string    `json:"name"`
		Username  string    `json:"username"`
		AvatarURL string    `json:"avatar_url"`
	}

	var userResponses []UserResponse
	for _, user := range profiles {
		userResponses = append(userResponses, UserResponse{
			ID:        user.ID,
			Name:      user.Name,
			Username:  user.Username,
			AvatarURL: user.AvatarURL,
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"data":        userResponses,
		"total_count": total,
		"page":        pagingParams.Page,
		"limit":       pagingParams.Limit,
	})
}

// fetchSuggestedProfiles trả về danh sách người dùng được gợi ý để theo dõi
func fetchSuggestedProfiles(currentUserID uuid.UUID, page int, limit int) ([]models.User, int64, error) {
	var users []models.User
	var total int64

	// Subquery để lấy danh sách user mà current user đang theo dõi
	subQuery := database.DB.Model(&models.Follow{}).Select("following_id").Where("follower_id = ?", currentUserID)

	// Truy vấn tìm các user không nằm trong danh sách theo dõi và không phải chính current user
	query := database.DB.Model(&models.User{}).
		Where("id NOT IN (?) AND id != ?", subQuery, currentUserID)

	// Đếm tổng số kết quả với COUNT(*) thay vì COUNT("users"."*")
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Truy vấn với phân trang
	err := query.Order("created_at DESC").
		Limit(limit).
		Offset((page - 1) * limit).
		Find(&users).Error

	if err != nil {
		return nil, 0, err
	}

	return users, total, nil
}

// controllers/follow.go

func GetPeopleYouMayKnow(c *gin.Context) {
	// Lấy userID của người dùng hiện tại từ context
	currentUserID, err := utils.GetUserIDFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	// Lấy username từ query parameters
	username := c.Query("username")
	if username == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Username is required"})
		return
	}

	// Không loại bỏ ký tự '@' vì usernames đã được lưu trữ với '@'
	// Tìm userID từ username
	var targetUser models.User
	if err := database.DB.Where("username = ?", username).First(&targetUser).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	targetUserID := targetUser.ID

	// Lấy danh sách user mà targetUser đang theo dõi, loại trừ bạn và những người bạn đã theo dõi
	profiles, total, err := fetchPeopleYouMayKnow(targetUserID, currentUserID, 1, 10)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Chuẩn bị dữ liệu phản hồi
	type UserResponse struct {
		ID        uuid.UUID `json:"id"`
		Name      string    `json:"name"`
		Username  string    `json:"username"`
		AvatarURL string    `json:"avatar_url"`
	}

	var userResponses []UserResponse
	for _, user := range profiles {
		userResponses = append(userResponses, UserResponse{
			ID:        user.ID,
			Name:      user.Name,
			Username:  user.Username,
			AvatarURL: user.AvatarURL,
		})
	}

	// Lấy tham số phân trang từ query
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))

	c.JSON(http.StatusOK, gin.H{
		"data":        userResponses,
		"total_count": total,
		"page":        page,
		"limit":       limit,
	})
}

func fetchPeopleYouMayKnow(viewedUserID uuid.UUID, currentUserID uuid.UUID, page int, limit int) ([]models.User, int64, error) {
	var users []models.User
	var total int64

	// Lấy danh sách user mà viewedUser đang theo dõi
	var viewedUserFollows []models.Follow
	if err := database.DB.Where("follower_id = ?", viewedUserID).Find(&viewedUserFollows).Error; err != nil {
		return nil, 0, err
	}

	var viewedUserFollowingIDs []uuid.UUID
	for _, follow := range viewedUserFollows {
		viewedUserFollowingIDs = append(viewedUserFollowingIDs, follow.FollowingID)
	}

	if len(viewedUserFollowingIDs) == 0 {
		return []models.User{}, 0, nil
	}

	// Lấy danh sách user mà currentUser đã theo dõi để loại trừ
	var currentUserFollows []models.Follow
	if err := database.DB.Where("follower_id = ?", currentUserID).Find(&currentUserFollows).Error; err != nil {
		return nil, 0, err
	}

	var currentUserFollowingIDs []uuid.UUID
	for _, follow := range currentUserFollows {
		currentUserFollowingIDs = append(currentUserFollowingIDs, follow.FollowingID)
	}

	// Truy vấn tìm những user mà viewedUser đang theo dõi,
	// nhưng bạn chưa theo dõi và không phải chính bạn
	query := database.DB.Model(&models.Follow{}).
		Select("users.*").
		Joins("JOIN users ON users.id = follows.following_id").
		Where("follows.follower_id IN (?) AND users.id NOT IN (?) AND users.id != ?", viewedUserFollowingIDs, append(currentUserFollowingIDs, currentUserID)).
		Group("users.id")

	// Đếm tổng số kết quả với COUNT(users.id) thay vì COUNT("users"."*")
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Truy vấn với phân trang
	err := query.Order("users.created_at DESC").
		Limit(limit).
		Offset((page - 1) * limit).
		Find(&users).Error

	if err != nil {
		return nil, 0, err
	}

	return users, total, nil
}
