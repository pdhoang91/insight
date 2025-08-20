package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/pdhoang91/blog/internal/model"
	jwtUtil "github.com/pdhoang91/blog/pkg/jwt"
)

// AuthMiddleware validates JWT tokens
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, model.ErrorResponse{
				Status:  "error",
				Code:    http.StatusUnauthorized,
				Message: "Authorization header required",
			})
			c.Abort()
			return
		}

		// Extract token from "Bearer <token>"
		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		if tokenString == authHeader {
			c.JSON(http.StatusUnauthorized, model.ErrorResponse{
				Status:  "error",
				Code:    http.StatusUnauthorized,
				Message: "Invalid authorization format",
			})
			c.Abort()
			return
		}

		// Parse and validate token using JWT utility
		claims, err := jwtUtil.VerifyJWT(tokenString)
		if err != nil {
			c.JSON(http.StatusUnauthorized, model.ErrorResponse{
				Status:  "error",
				Code:    http.StatusUnauthorized,
				Message: "Invalid token",
			})
			c.Abort()
			return
		}

		// Set user information in context
		c.Set("user_id", claims.UserID.String())
		c.Set("user_role", claims.Role)

		c.Next()
	}
}

// AdminMiddleware checks if user has admin role
func AdminMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		role, exists := c.Get("user_role")
		if !exists {
			c.JSON(http.StatusForbidden, model.ErrorResponse{
				Status:  "error",
				Code:    http.StatusForbidden,
				Message: "User role not found",
			})
			c.Abort()
			return
		}

		if role != "admin" {
			c.JSON(http.StatusForbidden, model.ErrorResponse{
				Status:  "error",
				Code:    http.StatusForbidden,
				Message: "Admin access required",
			})
			c.Abort()
			return
		}

		c.Next()
	}
}
