package jwt

import (
	"github.com/pdhoang91/blog/internal/entities"
	"github.com/pdhoang91/blog/internal/middleware"
)

// GenerateJWT generates a JWT token for a user (delegate to middleware)
func GenerateJWT(user *entities.User) (string, error) {
	return middleware.GenerateJWT(user)
}

// VerifyJWT verifies a JWT token (delegate to middleware)
func VerifyJWT(tokenString string) (interface{}, error) {
	return middleware.VerifyJWT(tokenString)
}
