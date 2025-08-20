package jwt

import (
	"errors"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v4"
	"github.com/pdhoang91/blog/internal/entities"
	uuid "github.com/satori/go.uuid"
)

// Claims represents the JWT claims
type Claims struct {
	UserID uuid.UUID `json:"user_id"`
	Email  string    `json:"email"`
	Name   string    `json:"name"`
	Role   string    `json:"role"`
	jwt.RegisteredClaims
}

// TokenMaker interface for creating and verifying tokens
type TokenMaker interface {
	CreateToken(user *entities.User, duration time.Duration) (string, error)
	VerifyToken(token string) (*Claims, error)
}

// JWTMaker is a JSON Web Token maker
type JWTMaker struct {
	secretKey string
}

// NewJWTMaker creates a new JWTMaker
func NewJWTMaker(secretKey string) (TokenMaker, error) {
	if len(secretKey) < 32 {
		return nil, errors.New("invalid key size: must be at least 32 characters")
	}
	return &JWTMaker{secretKey}, nil
}

// CreateToken creates a new token for a specific user and duration
func (maker *JWTMaker) CreateToken(user *entities.User, duration time.Duration) (string, error) {
	claims := &Claims{
		UserID: user.ID,
		Email:  user.Email,
		Name:   user.Name,
		Role:   string(user.Role),
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(duration)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
			Subject:   user.ID.String(),
		},
	}

	jwtToken := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return jwtToken.SignedString([]byte(maker.secretKey))
}

// VerifyToken checks if the token is valid or not
func (maker *JWTMaker) VerifyToken(token string) (*Claims, error) {
	keyFunc := func(token *jwt.Token) (interface{}, error) {
		_, ok := token.Method.(*jwt.SigningMethodHMAC)
		if !ok {
			return nil, errors.New("unexpected signing method")
		}
		return []byte(maker.secretKey), nil
	}

	jwtToken, err := jwt.ParseWithClaims(token, &Claims{}, keyFunc)
	if err != nil {
		return nil, err
	}

	claims, ok := jwtToken.Claims.(*Claims)
	if !ok {
		return nil, errors.New("invalid token claims")
	}

	return claims, nil
}

// GetJWTSecret gets JWT secret from environment or returns default
func GetJWTSecret() string {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		// Must be at least 32 characters for HMAC-SHA256
		secret = "your-super-secret-jwt-key-change-this-in-production-must-be-at-least-32-characters-long"
	}
	return secret
}

// GenerateJWT generates a JWT token for a user (backward compatibility)
func GenerateJWT(user *entities.User) (string, error) {
	secretKey := GetJWTSecret()
	maker, err := NewJWTMaker(secretKey)
	if err != nil {
		return "", err
	}

	return maker.CreateToken(user, time.Hour*72) // 72 hours expiration
}

// VerifyJWT verifies a JWT token (backward compatibility)
func VerifyJWT(tokenString string) (*Claims, error) {
	secretKey := GetJWTSecret()
	maker, err := NewJWTMaker(secretKey)
	if err != nil {
		return nil, err
	}

	return maker.VerifyToken(tokenString)
}
