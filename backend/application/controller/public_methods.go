// controller/public_methods.go
package controller

import (
	"github.com/gin-gonic/gin"
)

// GetPosts handles getting posts (public endpoint)
func (ctrl *Controller) GetPosts(c *gin.Context) {
	// Delegate to existing function for now
	GetPosts(c)
}

// GetPopularPosts handles getting popular posts
func (ctrl *Controller) GetPopularPosts(c *gin.Context) {
	// Delegate to existing function for now
	GetPopularPosts(c)
}

// GetLatestPosts handles getting latest posts
func (ctrl *Controller) GetLatestPosts(c *gin.Context) {
	// Delegate to existing function for now
	GetLatestPosts(c)
}

// GetPostByName handles getting post by title name
func (ctrl *Controller) GetPostByName(c *gin.Context) {
	// Delegate to existing function for now
	GetPostByName(c)
}

// NOTE: GetComments has been moved to comment.go as a method of unified Controller

// GetRatingForPost handles getting ratings for a post
func (ctrl *Controller) GetRatingForPost(c *gin.Context) {
	// Delegate to existing function for now
	GetRatingForPost(c)
}

// CreateCategory handles creating a new category
func (ctrl *Controller) CreateCategory(c *gin.Context) {
	// Delegate to existing function for now
	CreateCategory(c)
}

// GetPostsByCategory handles getting posts by category
func (ctrl *Controller) GetPostsByCategory(c *gin.Context) {
	// Delegate to existing function for now
	GetPostsByCategory(c)
}

// GetTopCategories handles getting top categories
func (ctrl *Controller) GetTopCategories(c *gin.Context) {
	// Delegate to existing function for now
	GetTopCategories(c)
}

// GetPopularCategories handles getting popular categories
func (ctrl *Controller) GetPopularCategories(c *gin.Context) {
	// Delegate to existing function for now
	GetPopularCategories(c)
}

// GetPopularTags handles getting popular tags
func (ctrl *Controller) GetPopularTags(c *gin.Context) {
	// Delegate to existing function for now
	GetPopularTags(c)
}

// CreateTag handles creating a new tag
func (ctrl *Controller) CreateTag(c *gin.Context) {
	// Delegate to existing function for now
	CreateTag(c)
}

// AddTagToPost handles adding tag to post
func (ctrl *Controller) AddTagToPost(c *gin.Context) {
	// Delegate to existing function for now
	AddTagToPost(c)
}

// RemoveTagFromPost handles removing tag from post
func (ctrl *Controller) RemoveTagFromPost(c *gin.Context) {
	// Delegate to existing function for now
	RemoveTagFromPost(c)
}

// GetClapsCount handles getting claps count
func (ctrl *Controller) GetClapsCount(c *gin.Context) {
	// Delegate to existing function for now
	GetClapsCount(c)
}

// GetRecommendedTopics handles getting recommended topics
func (ctrl *Controller) GetRecommendedTopics(c *gin.Context) {
	// Delegate to existing function for now
	GetRecommendedTopics(c)
}

// SearchPostsHandler handles post search
func (ctrl *Controller) SearchPostsHandler(c *gin.Context) {
	// Delegate to existing function for now
	SearchPostsHandler(c)
}

// SearchSuggestionsHandler handles search suggestions
func (ctrl *Controller) SearchSuggestionsHandler(c *gin.Context) {
	// Delegate to existing function for now
	SearchSuggestionsHandler(c)
}

// PopularSearchesHandler handles popular searches
func (ctrl *Controller) PopularSearchesHandler(c *gin.Context) {
	// Delegate to existing function for now
	PopularSearchesHandler(c)
}

// TrackSearchHandler handles search tracking
func (ctrl *Controller) TrackSearchHandler(c *gin.Context) {
	// Delegate to existing function for now
	TrackSearchHandler(c)
}

// SearchUsers handles user search
func (ctrl *Controller) SearchUsers(c *gin.Context) {
	// Delegate to existing function for now
	SearchUsers(c)
}

// GetTabs handles getting tabs (public)
func (ctrl *Controller) GetTabs(c *gin.Context) {
	// Delegate to existing function for now
	GetTabs(c)
}

// GetTopWriters handles getting top writers
func (ctrl *Controller) GetTopWriters(c *gin.Context) {
	// Delegate to existing function for now
	GetTopWriters(c)
}

// GetTopTopics handles getting top topics
func (ctrl *Controller) GetTopTopics(c *gin.Context) {
	// Delegate to existing function for now
	GetTopTopics(c)
}
