// utils/errors.go
package utils

import "github.com/gin-gonic/gin"

func HandleError(c *gin.Context, err error, statusCode int, message string) {
	if err != nil {
		c.JSON(statusCode, gin.H{"error": message, "details": err.Error()})
		c.Abort()
		return
	}
	c.Next()
}
