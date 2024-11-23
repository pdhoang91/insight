// middleware/auth.go
package middleware

import (
	"errors"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt" // or the alternative package you're using

	"github.com/pdhoang91/blog/models"
)

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		tokenString := c.GetHeader("Authorization")
		if tokenString == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header required"})
			c.Abort()
			return
		}

		// Bearer token format
		tokenString = strings.TrimPrefix(tokenString, "Bearer ")

		token, err := VerifyJWT(tokenString)
		if err != nil || !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			c.Abort()
			return
		}

		// Extract claims
		if claims, ok := token.Claims.(jwt.MapClaims); ok {
			// Ensure claims contain "user_id" and "role"
			userID, userIDExists := claims["user_id"]
			role, roleExists := claims["role"]
			if !userIDExists || !roleExists {
				c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token claims"})
				c.Abort()
				return
			}

			c.Set("userID", userID)
			c.Set("role", role)
			c.Set("exp", claims["exp"])
			c.Set("iat", claims["iat"])
		} else {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token claims"})
			c.Abort()
			return
		}

		c.Next()
	}
}

func AuthMiddleware2() gin.HandlerFunc {
	return func(c *gin.Context) {
		tokenString := c.GetHeader("Authorization")
		if tokenString == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header required"})
			c.Abort()
			return
		}

		// Bearer token format
		tokenString = strings.TrimPrefix(tokenString, "Bearer ")

		token, err := VerifyJWT(tokenString)
		if err != nil || !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			c.Abort()
			return
		}

		// Extract claims
		if claims, ok := token.Claims.(jwt.MapClaims); ok {
			// Set only the user ID in context
			c.Set("userID", claims["user_id"])
			c.Set("role", claims["user_id"])
			c.Set("exp", claims["exp"])
			c.Set("iat", claims["iat"])
		}
		//c.Set("userID", userID)
		//c.Set("role", role)
		c.Next()
	}
}

// jwtSecret is your secret key used for signing tokens
var jwtSecret = []byte("your_secret_key") // Make sure to replace this with your environment variable

// VerifyJWT verifies a given JWT token and returns the token if valid
func VerifyJWT(tokenString string) (*jwt.Token, error) {
	// Parse the token with a function that returns the secret key
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		// Ensure the token method conforms to your signing method
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return jwtSecret, nil // Use the secret key to verify the token
	})

	return token, err
}

type Claims struct {
	UserID uint   `json:"user_id"`
	Role   string `json:"role"`
	jwt.StandardClaims
}

type CustomClaims struct {
	UserID uint   `json:"user_id"`
	Role   string `json:"role"`
	jwt.StandardClaims
}

//var jwtSecret = []byte("your_secret_key") // Replace with your secret key

func GenerateJWT(user models.User) (string, error) {
	// Create a new JWT token
	token := jwt.New(jwt.SigningMethodHS256)

	// Set claims
	claims := token.Claims.(jwt.MapClaims)
	claims["user_id"] = user.ID // Changed from "id" to "user_id"
	claims["email"] = user.Email
	claims["name"] = user.Name
	claims["role"] = user.Role                            // Ensure role is included if used
	claims["exp"] = time.Now().Add(time.Hour * 72).Unix() // Token expiration time

	// Sign the token with the secret key
	tokenString, err := token.SignedString(jwtSecret)
	if err != nil {
		return "", err
	}

	return tokenString, nil
}
