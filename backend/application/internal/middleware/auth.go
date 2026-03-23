package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v4"
	"github.com/pdhoang91/blog/internal/dto"
	pkgjwt "github.com/pdhoang91/blog/pkg/jwt"
)

// AuthMiddleware validates JWT tokens
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		tokenString := c.GetHeader("Authorization")
		if tokenString == "" {
			c.JSON(http.StatusUnauthorized, dto.ErrorResponse{
				Status:  "error",
				Code:    http.StatusUnauthorized,
				Message: "Authorization header required",
			})
			c.Abort()
			return
		}

		// Bearer token format
		tokenString = strings.TrimPrefix(tokenString, "Bearer ")

		token, err := pkgjwt.VerifyJWT(tokenString)
		if err != nil || !token.Valid {
			c.JSON(http.StatusUnauthorized, dto.ErrorResponse{
				Status:  "error",
				Code:    http.StatusUnauthorized,
				Message: "Invalid token",
			})
			c.Abort()
			return
		}

		// Extract claims
		if claims, ok := token.Claims.(jwt.MapClaims); ok {
			userID, userIDExists := claims["user_id"]
			role, roleExists := claims["role"]
			if !userIDExists || !roleExists {
				c.JSON(http.StatusUnauthorized, dto.ErrorResponse{
					Status:  "error",
					Code:    http.StatusUnauthorized,
					Message: "Invalid token claims",
				})
				c.Abort()
				return
			}

			c.Set("userID", userID)
			c.Set("role", role)
			c.Set("exp", claims["exp"])
			c.Set("iat", claims["iat"])
		} else {
			c.JSON(http.StatusUnauthorized, dto.ErrorResponse{
				Status:  "error",
				Code:    http.StatusUnauthorized,
				Message: "Invalid token claims",
			})
			c.Abort()
			return
		}

		c.Next()
	}
}

// AdminMiddleware checks if user has admin role
func AdminMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		role, exists := c.Get("role")
		if !exists {
			c.JSON(http.StatusUnauthorized, dto.ErrorResponse{
				Status:  "error",
				Code:    http.StatusUnauthorized,
				Message: "User role not found",
			})
			c.Abort()
			return
		}

		if role != "admin" {
			c.JSON(http.StatusForbidden, dto.ErrorResponse{
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
