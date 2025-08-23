package middleware

import (
	"errors"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v4"
	"github.com/pdhoang91/blog/internal/entities"
	"github.com/pdhoang91/blog/internal/dto"
)

// jwtSecret is your secret key used for signing tokens
var jwtSecret []byte

// GetJWTSecret gets JWT secret from environment or returns default
func GetJWTSecret() []byte {
	if jwtSecret == nil {
		secret := os.Getenv("JWT_SECRET")
		if secret == "" {
			// Must be at least 32 characters for HMAC-SHA256
			secret = "your-super-secret-jwt-key-here"
		}
		jwtSecret = []byte(secret)
	}
	return jwtSecret
}

// VerifyJWT verifies a given JWT token and returns the token if valid
func VerifyJWT(tokenString string) (*jwt.Token, error) {
	// Parse the token with a function that returns the secret key
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		// Ensure the token method conforms to your signing method
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return GetJWTSecret(), nil // Use the secret key to verify the token
	})

	return token, err
}

// GenerateJWT generates a JWT token for a user (like insight_bk)
func GenerateJWT(user *entities.User) (string, error) {
	// Debug logging
	if user == nil {
		return "", errors.New("user is nil")
	}

	// Create a new JWT token
	token := jwt.New(jwt.SigningMethodHS256)

	// Set claims
	claims := token.Claims.(jwt.MapClaims)
	claims["user_id"] = user.ID.String() // Convert UUID to string
	claims["email"] = user.Email
	claims["name"] = user.Name
	claims["role"] = string(user.Role)                    // Convert UserRole to string
	claims["exp"] = time.Now().Add(time.Hour * 72).Unix() // Token expiration time

	// Sign the token with the secret key
	tokenString, err := token.SignedString(GetJWTSecret())
	if err != nil {
		return "", err
	}

	return tokenString, nil
}

// AuthMiddleware validates JWT tokens (like insight_bk)
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

		token, err := VerifyJWT(tokenString)
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
			// Ensure claims contain "user_id" and "role"
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
