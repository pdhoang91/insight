// controller/controller_auth.go
package controller

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"golang.org/x/oauth2"
	"gorm.io/gorm"

	"github.com/pdhoang91/blog/config"
	"github.com/pdhoang91/blog/database"
	"github.com/pdhoang91/blog/middleware"
	"github.com/pdhoang91/blog/models"
)

// ===== AUTH METHODS =====

// LoginHandler handles user login
func (ctrl *Controller) LoginHandler(c *gin.Context) {
	var input struct {
		Email    string `json:"email" binding:"required,email"`
		Password string `json:"password" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Find user by email
	var user models.User
	if err := database.DB.Where("email = ?", input.Email).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	// Check password
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	// Generate JWT token
	token, err := middleware.GenerateJWT(user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not generate token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"token": token,
		"user": gin.H{
			"id":       user.ID,
			"email":    user.Email,
			"username": user.Username,
			"name":     user.Name,
		},
	})
}

// RegisterHandler handles user registration
func (ctrl *Controller) RegisterHandler(c *gin.Context) {
	var input struct {
		Email    string `json:"email" binding:"required,email"`
		Password string `json:"password" binding:"required,min=6"`
		Username string `json:"username" binding:"required"`
		Name     string `json:"name" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Check if user already exists
	var existingUser models.User
	if err := database.DB.Where("email = ? OR username = ?", input.Email, input.Username).First(&existingUser).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "User already exists"})
		return
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not hash password"})
		return
	}

	// Create user
	user := models.User{
		Email:    input.Email,
		Password: string(hashedPassword),
		Username: input.Username,
		Name:     input.Name,
	}

	if err := database.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not create user"})
		return
	}

	// Generate JWT token
	token, err := middleware.GenerateJWT(user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not generate token"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"token": token,
		"user": gin.H{
			"id":       user.ID,
			"email":    user.Email,
			"username": user.Username,
			"name":     user.Name,
		},
	})
}

// GoogleLoginHandler handles Google OAuth login
func (ctrl *Controller) GoogleLoginHandler(c *gin.Context) {
	cfg := config.Get()
	if cfg == nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "OAuth configuration not available"})
		return
	}

	url := cfg.AuthCodeURL("state", oauth2.AccessTypeOffline)
	c.Redirect(http.StatusTemporaryRedirect, url)
}

// GoogleCallbackHandler handles Google OAuth callback
func (ctrl *Controller) GoogleCallbackHandler(c *gin.Context) {
	code := c.Query("code")
	if code == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Code not provided"})
		return
	}

	cfg := config.Get()
	token, err := cfg.Exchange(context.Background(), code)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not exchange token"})
		return
	}

	// Create client from token
	client := cfg.Client(context.Background(), token)

	// Get user info from Google
	resp, err := client.Get("https://www.googleapis.com/oauth2/v2/userinfo")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not get user info"})
		return
	}
	defer resp.Body.Close()

	var googleUser struct {
		ID      string `json:"id"`
		Email   string `json:"email"`
		Name    string `json:"name"`
		Picture string `json:"picture"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&googleUser); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not decode user info"})
		return
	}

	// Find or create user
	var user models.User
	if err := database.DB.Where("google_id = ? OR email = ?", googleUser.ID, googleUser.Email).First(&user).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			// Create new user
			user = models.User{
				GoogleID:  googleUser.ID,
				Email:     googleUser.Email,
				Name:      googleUser.Name,
				Username:  strings.Split(googleUser.Email, "@")[0],
				AvatarURL: googleUser.Picture,
			}
			if err := database.DB.Create(&user).Error; err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not create user"})
				return
			}
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
			return
		}
	}

	// Generate JWT token
	jwtToken, err := middleware.GenerateJWT(user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not generate token"})
		return
	}

	// Redirect to frontend with token
	frontendURL := os.Getenv("BASE_FE_URL")
	if frontendURL == "" {
		frontendURL = "http://localhost:3000"
	}

	c.Redirect(http.StatusTemporaryRedirect, fmt.Sprintf("%s/auth/callback?token=%s", frontendURL, jwtToken))
}
