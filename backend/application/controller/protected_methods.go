// controller/protected_methods.go
package controller

import (
	"github.com/gin-gonic/gin"
)

// CreateComment handles creating a comment
func (ctrl *Controller) CreateComment(c *gin.Context) {
	// Delegate to existing function for now
	CreateComment(c)
}

// CreateRating handles creating a rating
func (ctrl *Controller) CreateRating(c *gin.Context) {
	// Delegate to existing function for now
	CreateRating(c)
}

// CreateBookmark handles creating a bookmark
func (ctrl *Controller) CreateBookmark(c *gin.Context) {
	// Delegate to existing function for now
	CreateBookmark(c)
}

// Unbookmark handles removing a bookmark
func (ctrl *Controller) Unbookmark(c *gin.Context) {
	// Delegate to existing function for now
	Unbookmark(c)
}

// IsBookmarked handles checking if post is bookmarked
func (ctrl *Controller) IsBookmarked(c *gin.Context) {
	// Delegate to existing function for now
	IsBookmarked(c)
}

// FollowUser handles following a user
func (ctrl *Controller) FollowUser(c *gin.Context) {
	// Delegate to existing function for now
	FollowUser(c)
}

// UnfollowUser handles unfollowing a user
func (ctrl *Controller) UnfollowUser(c *gin.Context) {
	// Delegate to existing function for now
	UnfollowUser(c)
}

// CheckFollowingStatus handles checking follow status
func (ctrl *Controller) CheckFollowingStatus(c *gin.Context) {
	// Delegate to existing function for now
	CheckFollowingStatus(c)
}

// GetSuggestedProfiles handles getting suggested profiles
func (ctrl *Controller) GetSuggestedProfiles(c *gin.Context) {
	// Delegate to existing function for now
	GetSuggestedProfiles(c)
}

// GetPeopleYouMayKnow handles getting people you may know
func (ctrl *Controller) GetPeopleYouMayKnow(c *gin.Context) {
	// Delegate to existing function for now
	GetPeopleYouMayKnow(c)
}

// MarkNotificationAsRead handles marking notification as read
func (ctrl *Controller) MarkNotificationAsRead(c *gin.Context) {
	// Delegate to existing function for now
	MarkNotificationAsRead(c)
}

// AddFollowCategory handles adding follow category
func (ctrl *Controller) AddFollowCategory(c *gin.Context) {
	// Delegate to existing function for now
	AddFollowCategory(c)
}

// RemoveFollowCategory handles removing follow category
func (ctrl *Controller) RemoveFollowCategory(c *gin.Context) {
	// Delegate to existing function for now
	RemoveFollowCategory(c)
}
