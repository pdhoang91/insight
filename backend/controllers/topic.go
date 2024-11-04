// controllers/author.go
package controllers

import (
	"net/http"
	"sort"

	"github.com/gin-gonic/gin"

	"github.com/pdhoang91/blog/database"
	"github.com/pdhoang91/blog/models"
)

// controllers/topic.go
func GetRecommendedTopics(c *gin.Context) {
	var categories []models.Category
	database.DB.Preload("Posts").Find(&categories)
	sort.Slice(categories, func(i, j int) bool {
		return len(categories[i].Posts) > len(categories[j].Posts)
	})
	c.JSON(http.StatusOK, gin.H{"data": categories})
}
