package jwt

import (
	"errors"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v4"
	"github.com/pdhoang91/blog/internal/entities"
)

var jwtSecret []byte

// GetJWTSecret returns the JWT signing secret from env or a default fallback.
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

// GenerateJWT creates a signed JWT token for the given user.
func GenerateJWT(user *entities.User) (string, error) {
	if user == nil {
		return "", errors.New("user is nil")
	}

	token := jwt.New(jwt.SigningMethodHS256)
	claims := token.Claims.(jwt.MapClaims)
	claims["user_id"] = user.ID.String()
	claims["email"] = user.Email
	claims["name"] = user.Name
	claims["role"] = string(user.Role)
	claims["exp"] = time.Now().Add(time.Hour * 72).Unix()

	return token.SignedString(GetJWTSecret())
}

// VerifyJWT validates a JWT token string and returns the parsed token.
func VerifyJWT(tokenString string) (*jwt.Token, error) {
	return jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return GetJWTSecret(), nil
	})
}
