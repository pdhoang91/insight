package utils

import (
	"fmt"
	"strconv"

	"github.com/gin-gonic/gin"
	uuid "github.com/satori/go.uuid"
)

// GetUserIDFromContext lấy userID từ context và trả về kiểu uuid.UUID
func GetUserIDFromContext(c *gin.Context) (uuid.UUID, error) {
	userIDInterface, exists := c.Get("userID")
	if !exists {
		return uuid.Nil, fmt.Errorf("user not authenticated")
	}

	var userID uuid.UUID
	switch v := userIDInterface.(type) {
	case string:
		parsedUUID, err := uuid.FromString(v)
		if err != nil {
			return uuid.Nil, fmt.Errorf("invalid user ID format: %w", err)
		}
		userID = parsedUUID
	case uuid.UUID:
		userID = v
	default:
		return uuid.Nil, fmt.Errorf("invalid user ID")
	}
	return userID, nil
}

// PagingParams chứa thông tin về phân trang
type PagingParams struct {
	Page  int
	Limit int
}

// GetPagingParams xử lý tham số phân trang từ query params
func GetPagingParams(c *gin.Context) (PagingParams, error) {
	page, err := strconv.Atoi(c.DefaultQuery("page", "1"))
	if err != nil || page < 1 {
		page = 1
	}

	limit, err := strconv.Atoi(c.DefaultQuery("limit", "10"))
	if err != nil || limit < 1 {
		limit = 10
	}

	return PagingParams{
		Page:  page,
		Limit: limit,
	}, nil
}
