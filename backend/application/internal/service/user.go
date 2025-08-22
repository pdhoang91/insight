package service

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"mime/multipart"
	"regexp"
	"strings"
	"time"

	"github.com/pdhoang91/blog/config"
	"github.com/pdhoang91/blog/constants"
	"github.com/pdhoang91/blog/internal/dto"
	"github.com/pdhoang91/blog/internal/entities"
	"github.com/pdhoang91/blog/pkg/storage"

	jwtUtil "github.com/pdhoang91/blog/pkg/jwt"
	uuid "github.com/satori/go.uuid"
	"golang.org/x/crypto/bcrypt"
	"golang.org/x/oauth2"
	"gorm.io/gorm"
)

// ==================== USER METHODS ====================

// Register creates a new user account
func (s *InsightService) Register(req *dto.CreateUserRequest) (*dto.LoginResponse, error) {
	// Check if user already exists
	existingUser, err := s.User.FindByEmail(s.DB, req.Email)
	if err != nil && err != gorm.ErrRecordNotFound {
		return nil, errors.New("internal server error")
	}
	if existingUser != nil {
		return nil, errors.New("conflict")
	}

	// Check if username already exists
	existingUser, err = s.User.FindByUsername(s.DB, req.Username)
	if err != nil && err != gorm.ErrRecordNotFound {
		return nil, errors.New("internal server error")
	}
	if existingUser != nil {
		return nil, errors.New("conflict")
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, errors.New("internal server error")
	}

	// Create user
	user := &entities.User{
		ID:            uuid.NewV4(),
		Name:          req.Name,
		Email:         req.Email,
		Username:      req.Username,
		Password:      string(hashedPassword),
		Role:          constants.RoleUser,
		EmailVerified: false,
		CreatedAt:     time.Now(),
		UpdatedAt:     time.Now(),
	}

	log.Printf("Register: About to create user in database")
	if err := user.Create(s.DB); err != nil {
		log.Printf("Register: Failed to create user in database: %v", err)
		return nil, errors.New("internal server error")
	}
	log.Printf("Register: User created successfully in database with ID: %s", user.ID)

	// Generate JWT token for immediate login
	log.Printf("Register: About to generate JWT for user: ID=%s, Email=%s, Role=%s, Name=%s", user.ID, user.Email, user.Role, user.Name)
	log.Printf("Register: User object details: %+v", user)

	jwtToken, err := jwtUtil.GenerateJWT(user)
	if err != nil {
		log.Printf("Register: JWT generation FAILED with error: %v", err)
		log.Printf("Register: Error type: %T", err)
		return nil, errors.New("internal server error")
	}
	log.Printf("Register: JWT token generated SUCCESSFULLY: %s", jwtToken[:20]+"...")

	response := &dto.LoginResponse{
		Token: jwtToken,
		User:  dto.NewUserResponse(user),
	}

	return response, nil
}

// Login authenticates a user
func (s *InsightService) Login(req *dto.LoginRequest) (*dto.LoginResponse, error) {
	log.Printf("Login: Starting login process for email: %s", req.Email)
	user, err := s.User.FindByEmail(s.DB, req.Email)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, errors.New("unauthorized")
		}
		return nil, errors.New("internal server error")
	}

	// Check password
	log.Printf("Login: Checking password for user: %s", user.Email)
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		log.Printf("Login: Password check failed: %v", err)
		return nil, errors.New("unauthorized")
	}
	log.Printf("Login: Password check passed")

	// Generate JWT token using TokenMaker
	log.Printf("Generating JWT for user: ID=%s, Email=%s, Role=%s, Name=%s", user.ID, user.Email, user.Role, user.Name)
	log.Printf("User object: %+v", user)
	jwtToken, err := jwtUtil.GenerateJWT(user)
	if err != nil {
		log.Printf("Failed to generate token: %v", err)
		return nil, errors.New("internal server error")
	}
	log.Printf("JWT token generated successfully: %s", jwtToken[:20]+"...")

	response := &dto.LoginResponse{
		Token: jwtToken,
		User:  dto.NewUserResponse(user),
	}

	return response, nil
}

// GoogleLogin initiates Google OAuth login
func (s *InsightService) GoogleLogin() (string, error) {
	cfg := config.Get()
	if cfg == nil {
		return "", errors.New("internal server error")
	}

	url := cfg.AuthCodeURL("state", oauth2.AccessTypeOffline)
	return url, nil
}

// GoogleCallback handles Google OAuth callback
func (s *InsightService) GoogleCallback(code string) (*dto.LoginResponse, error) {
	log.Printf("GoogleCallback called with code: %s", code)

	cfg := config.Get()
	if cfg == nil {
		log.Printf("OAuth configuration not available")
		return nil, errors.New("internal server error")
	}

	// Exchange code for token
	token, err := cfg.Exchange(context.Background(), code)
	if err != nil {
		log.Printf("Could not exchange token: %v", err)
		return nil, errors.New("internal server error")
	}

	// Create client from token
	client := cfg.Client(context.Background(), token)

	// Get user info from Google
	resp, err := client.Get("https://www.googleapis.com/oauth2/v3/userinfo")
	if err != nil {
		log.Printf("Could not fetch user info: %v", err)
		return nil, errors.New("internal server error")
	}
	defer resp.Body.Close()

	var userInfo struct {
		Email string `json:"email"`
		Name  string `json:"name"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&userInfo); err != nil {
		log.Printf("Could not decode user info: %v", err)
		return nil, errors.New("internal server error")
	}

	log.Printf("User info received: email=%s, name=%s", userInfo.Email, userInfo.Name)

	// Check if user exists in database
	user, err := s.User.FindByEmail(s.DB, userInfo.Email)
	if err != nil && err != gorm.ErrRecordNotFound {
		return nil, errors.New("internal server error")
	}

	// Create user if doesn't exist
	if err == gorm.ErrRecordNotFound {
		log.Printf("Creating new user for email: %s", userInfo.Email)
		user = &entities.User{
			ID:            uuid.NewV4(),
			Email:         userInfo.Email,
			Username:      "@" + strings.Split(userInfo.Email, "@")[0],
			Name:          userInfo.Name,
			AvatarURL:     "https://www.w3schools.com/w3images/avatar2.png",
			Role:          constants.RoleUser,
			EmailVerified: true, // Google users are pre-verified
			CreatedAt:     time.Now(),
			UpdatedAt:     time.Now(),
		}

		if err := user.Create(s.DB); err != nil {
			log.Printf("Could not create user: %v", err)
			return nil, errors.New("internal server error")
		}
		log.Printf("User created successfully with ID: %s", user.ID)
	} else {
		log.Printf("User found with ID: %s", user.ID)
	}

	// Generate JWT token using TokenMaker
	jwtToken, err := jwtUtil.GenerateJWT(user)
	if err != nil {
		log.Printf("Failed to generate token: %v", err)
		return nil, errors.New("internal server error")
	}

	log.Printf("JWT token generated successfully")

	response := &dto.LoginResponse{
		Token: jwtToken,
		User:  dto.NewUserResponse(user),
	}

	return response, nil
}

// GetUserByUsername gets a user by username
func (s *InsightService) GetUserByUsername(username string) (*entities.User, error) {
	user, err := s.User.FindByUsername(s.DBR2, username)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, errors.New("not found")
		}
		return nil, errors.New("internal server error")
	}
	return user, nil
}

// Logout handles user logout
func (s *InsightService) Logout() error {
	// TODO: Implement logout logic (invalidate token)
	return nil
}

// RefreshToken handles token refresh
func (s *InsightService) RefreshToken() error {
	// TODO: Implement token refresh logic using TokenMaker
	return errors.New("bad request")
}

// GetUser retrieves a user by ID
func (s *InsightService) GetUser(id uuid.UUID) (*dto.UserResponse, error) {
	user, err := s.User.FindByID(s.DB, id)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, errors.New("not found")
		}
		return nil, errors.New("internal server error")
	}

	return dto.NewUserResponse(user), nil
}

// GetProfile retrieves the current user's profile
func (s *InsightService) GetProfile(userID uuid.UUID) (*dto.UserResponse, error) {
	user, err := s.User.FindByID(s.DB, userID)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, errors.New("not found")
		}
		return nil, errors.New("internal server error")
	}

	return dto.NewUserResponse(user), nil
}

// UpdateProfile updates the current user's profile
func (s *InsightService) UpdateProfile(userID uuid.UUID, req *dto.UpdateUserRequest) (*dto.UserResponse, error) {
	user, err := s.User.FindByID(s.DB, userID)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, errors.New("not found")
		}
		return nil, errors.New("internal server error")
	}

	// Update fields if provided
	if req.Name != "" {
		user.Name = req.Name
	}
	if req.Username != "" {
		user.Username = req.Username
	}
	if req.Bio != "" {
		user.Bio = req.Bio
	}
	if req.Phone != "" {
		user.Phone = req.Phone
	}
	if req.Dob != "" {
		user.Dob = req.Dob
	}

	user.UpdatedAt = time.Now()
	if err := user.Update(s.DB); err != nil {
		return nil, errors.New("internal server error")
	}

	return dto.NewUserResponse(user), nil
}

// UpdateProfileWithAvatar updates user profile with optional avatar upload
func (s *InsightService) UpdateProfileWithAvatar(ctx context.Context, userID uuid.UUID, req *dto.UpdateUserRequest, avatarFile *multipart.FileHeader) (*dto.UserResponse, error) {
	user, err := s.User.FindByID(s.DB, userID)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, errors.New("not found")
		}
		return nil, errors.New("internal server error")
	}

	// Handle avatar upload if provided
	if avatarFile != nil {
		// Upload new avatar using V2 system
		uploadResponse, err := s.UpdateUserAvatarV2(ctx, avatarFile, userID)
		if err != nil {
			return nil, fmt.Errorf("failed to upload avatar: %w", err)
		}
		// Update avatar URL in request
		req.AvatarURL = uploadResponse.URL
	}

	// Update user fields
	if req.Name != "" {
		user.Name = req.Name
	}
	if req.Bio != "" {
		user.Bio = req.Bio
	}
	if req.AvatarURL != "" {
		user.AvatarURL = req.AvatarURL
	}

	user.UpdatedAt = time.Now()
	if err := user.Update(s.DB); err != nil {
		return nil, errors.New("internal server error")
	}

	return dto.NewUserResponse(user), nil
}

// DeleteProfile deletes the current user's account
func (s *InsightService) DeleteProfile(userID uuid.UUID) error {
	// Get user to check if avatar exists
	user, err := s.User.FindByID(s.DB, userID)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return errors.New("not found")
		}
		return errors.New("internal server error")
	}

	// Delete avatar image if it exists and uses V2 system
	if user.AvatarURL != "" {
		if imageID := s.extractImageIDFromURL(user.AvatarURL); imageID != "" {
			// Delete avatar image from V2 system
			_ = s.DeleteImageV2(context.Background(), imageID, userID)
		}
	}

	// Cleanup all user images
	_ = s.CleanupUserImages(context.Background(), userID)

	if err := s.User.DeleteByID(s.DB, userID); err != nil {
		return errors.New("internal server error")
	}

	return nil
}

// GetAllUsers retrieves all users (admin only)
func (s *InsightService) GetAllUsers(req *dto.PaginationRequest) ([]*dto.UserResponse, int64, error) {
	if req.Limit == 0 {
		req.Limit = 50
	}

	users, err := s.User.List(s.DB, req.Limit, req.Offset)
	if err != nil {
		return nil, 0, errors.New("internal server error")
	}

	var responses []*dto.UserResponse
	for _, user := range users {
		responses = append(responses, dto.NewUserResponse(user))
	}

	return responses, int64(len(responses)), nil
}

// DeleteUser deletes a user by ID (admin only)
func (s *InsightService) DeleteUser(id uuid.UUID) error {
	if err := s.User.DeleteByID(s.DB, id); err != nil {
		return errors.New("internal server error")
	}

	return nil
}

// UploadAvatarV2 uploads user avatar using V2 system
func (s *InsightService) UploadAvatarV2(ctx context.Context, file *multipart.FileHeader, userID uuid.UUID) (*storage.UploadResponse, error) {
	return s.UploadImageV2(ctx, file, userID, "avatar")
}

// UpdateUserAvatarV2 updates user avatar using V2 system with cleanup
func (s *InsightService) UpdateUserAvatarV2(ctx context.Context, file *multipart.FileHeader, userID uuid.UUID) (*storage.UploadResponse, error) {
	// Get current user to check existing avatar
	user, err := s.User.FindByID(s.DB, userID)
	if err != nil {
		return nil, errors.New("user not found")
	}

	// Upload new avatar
	uploadResponse, err := s.UploadAvatarV2(ctx, file, userID)
	if err != nil {
		return nil, err
	}

	// Update user avatar URL
	user.AvatarURL = uploadResponse.URL
	if err := user.Update(s.DB); err != nil {
		// If user update fails, cleanup the uploaded image
		_ = s.DeleteImageV2(ctx, uploadResponse.ImageID.String(), userID)
		return nil, errors.New("failed to update user profile")
	}

	// Cleanup old avatar if it exists and uses V2 system
	if user.AvatarURL != "" && user.AvatarURL != uploadResponse.URL {
		if oldImageID := s.extractImageIDFromURL(user.AvatarURL); oldImageID != "" {
			// Delete old avatar image (ignore errors as this is cleanup)
			_ = s.DeleteImageV2(ctx, oldImageID, userID)
		}
	}

	return uploadResponse, nil
}

// extractImageIDFromURL extracts image ID from V2 image URL
func (s *InsightService) extractImageIDFromURL(imageURL string) string {
	// Pattern: /images/v2/{imageID}
	re := regexp.MustCompile(`/images/v2/([a-f0-9-]{36})`)
	matches := re.FindStringSubmatch(imageURL)
	if len(matches) > 1 {
		return matches[1]
	}
	return ""
}
