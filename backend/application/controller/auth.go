// controllers/author.go
package controller

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"golang.org/x/oauth2"
	"gorm.io/gorm"

	"github.com/pdhoang91/blog/config"
	"github.com/pdhoang91/blog/database"
	"github.com/pdhoang91/blog/middleware"
	"github.com/pdhoang91/blog/models"
	"github.com/pdhoang91/blog/utils"
)

func GoogleLoginHandler(c *gin.Context) {
	cfg := config.Get()
	if cfg == nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "OAuth configuration not available"})
		return
	}

	url := cfg.AuthCodeURL("state", oauth2.AccessTypeOffline)
	c.Redirect(http.StatusTemporaryRedirect, url)
}

func GoogleCallbackHandler(c *gin.Context) {
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

	// Tạo client từ token
	client := cfg.Client(context.Background(), token)
	// Lấy thông tin người dùng từ Google
	resp, err := client.Get("https://www.googleapis.com/oauth2/v3/userinfo")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not fetch user info"})
		return
	}
	defer resp.Body.Close()

	var userInfo struct {
		Email string `json:"email"`
		Name  string `json:"name"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&userInfo); err != nil {
		log.Println("Error decoding user info:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not decode user info"})
		return
	}

	// Kiểm tra xem người dùng đã tồn tại trong cơ sở dữ liệu hay chưa
	var user models.User
	if err := database.DB.Where("email = ?", userInfo.Email).First(&user).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			// Người dùng chưa tồn tại, tạo mới
			newUser := models.User{
				Email:     userInfo.Email,
				Username:  "@" + strings.Split(userInfo.Email, "@")[0],
				Name:      userInfo.Name,
				AvatarURL: "https://www.w3schools.com/w3images/avatar2.png",
			}
			if err := database.DB.Create(&newUser).Error; err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not create user"})
				return
			}
			user = newUser
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not check user"})
			return
		}
	}

	// Tạo JWT token cho người dùng
	tokenString, err := middleware.GenerateJWT(user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error generating token"})
		return
	}

	baseFeURL := os.Getenv("BASE_FE_URL")
	frontendURL := fmt.Sprintf("%s/#token=%s", baseFeURL, tokenString)
	fmt.Println("frontendURL", frontendURL)
	c.Redirect(http.StatusTemporaryRedirect, frontendURL)
}

// LoginHandler handles user login
func LoginHandler(c *gin.Context) {
	var input struct {
		Email    string `json:"email" binding:"required"`
		Password string `json:"password" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	var user models.User
	if err := database.DB.Where("email = ?", input.Email).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	// Generate JWT token and send it back
	token, err := middleware.GenerateJWT(user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error generating token"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"token": token})
}

// RegisterHandler handles user registration
func RegisterHandler(c *gin.Context) {
	var input struct {
		Email    string `json:"email" binding:"required,email"`
		Password string `json:"password" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), 10)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error hashing password"})
		return
	}

	// Generate verification token
	token, err := utils.GenerateVerificationToken()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error generating verification token"})
		return
	}

	// Kiểm tra xem người dùng đã tồn tại trong cơ sở dữ liệu hay chưa
	var user models.User
	if err := database.DB.Where("email = ?", input.Email).First(&user).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			// Người dùng chưa tồn tại, tạo mới
			newUser := models.User{
				Email:             input.Email,
				Password:          string(hashedPassword),
				VerificationToken: token,
				Username:          "@" + strings.Split(input.Email, "@")[0],
				Name:              strings.Split(input.Email, "@")[0],
				AvatarURL:         "https://www.w3schools.com/w3images/avatar2.png",
			}
			if err := database.DB.Create(&newUser).Error; err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not create user"})
				return
			}
			user = newUser
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not check user"})
			return
		}
	} else {
		c.JSON(http.StatusConflict, gin.H{"error": "User already exists"})
		return
	}

	// Send verification email
	//if err := utils.SendVerificationEmail(user.Email, token); err != nil {
	//	c.JSON(http.StatusInternalServerError, gin.H{"error": "Error sending verification email"})
	//	return
	//}

	// Optionally, return a JWT token for immediate login
	tokenString, err := middleware.GenerateJWT(user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error generating token"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"token": tokenString, "message": "Registration successful. Please verify your email."})
}

func VerifyEmail(c *gin.Context) {
	token := c.Query("token")
	if token == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Token is required"})
		return
	}

	var user models.User
	if err := database.DB.Where("verification_token = ?", token).First(&user).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid token"})
		return
	}

	user.EmailVerified = true
	user.VerificationToken = "" // Clear token
	if err := database.DB.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to verify email"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Email verified successfully"})
}

func RequestPasswordReset(c *gin.Context) {
	var input struct {
		Email string `json:"email" binding:"required,email"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	var user models.User
	if err := database.DB.Where("email = ?", input.Email).First(&user).Error; err != nil {
		// To prevent email enumeration, respond with success even if user not found
		c.JSON(http.StatusOK, gin.H{"message": "If the email exists, a reset link has been sent"})
		return
	}

	// Generate reset token
	token, err := utils.GeneratePasswordResetToken()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error generating reset token"})
		return
	}

	user.PasswordResetToken = token
	user.PasswordResetExpiresAt = utils.GetPasswordResetExpiry()

	if err := database.DB.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save reset token"})
		return
	}

	baseFeURL := os.Getenv("BASE_FE_URL")
	// Send reset email
	resetURL := fmt.Sprintf("%s/password-reset?token=%s", baseFeURL, token)
	if err := utils.SendPasswordResetEmail(user.Email, resetURL); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to send reset email"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "If the email exists, a reset link has been sent"})
}

func ConfirmPasswordReset(c *gin.Context) {
	var input struct {
		Token       string `json:"token" binding:"required"`
		NewPassword string `json:"new_password" binding:"required,min=6"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	var user models.User
	if err := database.DB.Where("password_reset_token = ?", input.Token).First(&user).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid or expired token"})
		return
	}

	if time.Now().After(user.PasswordResetExpiresAt) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Token has expired"})
		return
	}

	// Hash new password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.NewPassword), 10)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error hashing password"})
		return
	}

	user.Password = string(hashedPassword)
	user.PasswordResetToken = ""
	user.PasswordResetExpiresAt = time.Time{}

	if err := database.DB.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to reset password"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Password reset successfully"})
}
