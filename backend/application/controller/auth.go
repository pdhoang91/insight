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

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"golang.org/x/oauth2"
	"gorm.io/gorm"

	"github.com/pdhoang91/blog/config"
	"github.com/pdhoang91/blog/database"
	"github.com/pdhoang91/blog/middleware"
	"github.com/pdhoang91/blog/models"
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

	// Verification token generation disabled - utils removed

	// Kiểm tra xem người dùng đã tồn tại trong cơ sở dữ liệu hay chưa
	var user models.User
	if err := database.DB.Where("email = ?", input.Email).First(&user).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			// Người dùng chưa tồn tại, tạo mới
			newUser := models.User{
				Email:             input.Email,
				Password:          string(hashedPassword),
				VerificationToken: "", // Verification disabled
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
	// Email verification feature disabled - utils removed
	c.JSON(http.StatusNotImplemented, gin.H{"error": "Email verification feature not implemented"})
}

func RequestPasswordReset(c *gin.Context) {
	// Password reset feature disabled - utils removed
	c.JSON(http.StatusNotImplemented, gin.H{"error": "Password reset feature not implemented"})
}

func ConfirmPasswordReset(c *gin.Context) {
	// Password reset feature disabled - utils removed
	c.JSON(http.StatusNotImplemented, gin.H{"error": "Password reset feature not implemented"})
}
