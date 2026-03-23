package service

import (
	"context"
	"encoding/json"
	"errors"
	"mime/multipart"
	"regexp"
	"strings"
	"time"

	"github.com/pdhoang91/blog/constants"
	"github.com/pdhoang91/blog/internal/apperror"
	"github.com/pdhoang91/blog/internal/dto"
	"github.com/pdhoang91/blog/internal/entities"
	"github.com/pdhoang91/blog/pkg/storage"

	jwtUtil "github.com/pdhoang91/blog/pkg/jwt"
	uuid "github.com/satori/go.uuid"
	"golang.org/x/crypto/bcrypt"
	"golang.org/x/oauth2"
	"gorm.io/gorm"
)

// Register creates a new user account
func (s *InsightService) Register(req *dto.CreateUserRequest) (*dto.LoginResponse, error) {
	existing, err := s.userRepo.FindByEmail(req.Email)
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, apperror.NewInternal("failed to check email", err)
	}
	if existing != nil && existing.ID != uuid.Nil {
		return nil, apperror.NewConflict("email already registered")
	}

	existing, err = s.userRepo.FindByUsername(req.Username)
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, apperror.NewInternal("failed to check username", err)
	}
	if existing != nil && existing.ID != uuid.Nil {
		return nil, apperror.NewConflict("username already taken")
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, apperror.NewInternal("failed to hash password", err)
	}

	user := &entities.User{
		ID: uuid.NewV4(), Name: req.Name, Email: req.Email,
		Username: req.Username, Password: string(hashedPassword),
		Role: constants.RoleUser, EmailVerified: false,
		CreatedAt: time.Now(), UpdatedAt: time.Now(),
	}

	if err := s.userRepo.Create(user); err != nil {
		return nil, apperror.NewInternal("failed to create user", err)
	}

	jwtToken, err := jwtUtil.GenerateJWT(user)
	if err != nil {
		return nil, apperror.NewInternal("failed to generate token", err)
	}

	return &dto.LoginResponse{Token: jwtToken, User: dto.NewUserResponse(user)}, nil
}

// Login authenticates a user
func (s *InsightService) Login(req *dto.LoginRequest) (*dto.LoginResponse, error) {
	user, err := s.userRepo.FindByEmail(req.Email)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apperror.NewUnauthorized("invalid credentials")
		}
		return nil, apperror.NewInternal("failed to find user", err)
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		return nil, apperror.NewUnauthorized("invalid credentials")
	}

	jwtToken, err := jwtUtil.GenerateJWT(user)
	if err != nil {
		return nil, apperror.NewInternal("failed to generate token", err)
	}

	return &dto.LoginResponse{Token: jwtToken, User: dto.NewUserResponse(user)}, nil
}

// GoogleLogin initiates Google OAuth login
func (s *InsightService) GoogleLogin() (string, error) {
	if s.googleOauthConfig == nil {
		return "", apperror.NewInternal("OAuth configuration not available", nil)
	}
	return s.googleOauthConfig.AuthCodeURL("state", oauth2.AccessTypeOffline), nil
}

// GoogleCallback handles Google OAuth callback
func (s *InsightService) GoogleCallback(code string) (*dto.LoginResponse, error) {
	if s.googleOauthConfig == nil {
		return nil, apperror.NewInternal("OAuth configuration not available", nil)
	}

	token, err := s.googleOauthConfig.Exchange(context.Background(), code)
	if err != nil {
		return nil, apperror.NewInternal("failed to exchange token", err)
	}

	client := s.googleOauthConfig.Client(context.Background(), token)
	resp, err := client.Get("https://www.googleapis.com/oauth2/v3/userinfo")
	if err != nil {
		return nil, apperror.NewInternal("failed to fetch user info", err)
	}
	defer resp.Body.Close()

	var userInfo struct {
		Email   string `json:"email"`
		Name    string `json:"name"`
		Picture string `json:"picture"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&userInfo); err != nil {
		return nil, apperror.NewInternal("failed to decode user info", err)
	}

	user, err := s.userRepo.FindByEmail(userInfo.Email)
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, apperror.NewInternal("failed to find user", err)
	}

	if errors.Is(err, gorm.ErrRecordNotFound) {
		avatarURL := userInfo.Picture
		if avatarURL == "" {
			avatarURL = "https://www.w3schools.com/w3images/avatar2.png"
		}
		user = &entities.User{
			ID:               uuid.NewV4(),
			Email:            userInfo.Email,
			Username:         "@" + strings.Split(userInfo.Email, "@")[0],
			Name:             userInfo.Name,
			AvatarURL:        avatarURL,
			GooglePictureURL: userInfo.Picture,
			Role:             constants.RoleUser,
			EmailVerified:    true,
			CreatedAt:        time.Now(),
			UpdatedAt:        time.Now(),
		}
		if err := s.userRepo.Create(user); err != nil {
			return nil, apperror.NewInternal("failed to create user", err)
		}
	} else if userInfo.Picture != "" && user.GooglePictureURL != userInfo.Picture {
		// Keep Google picture URL up to date for existing users
		user.GooglePictureURL = userInfo.Picture
		if err := s.userRepo.Update(user); err != nil {
			return nil, apperror.NewInternal("failed to update user", err)
		}
	}

	jwtToken, err := jwtUtil.GenerateJWT(user)
	if err != nil {
		return nil, apperror.NewInternal("failed to generate token", err)
	}

	return &dto.LoginResponse{Token: jwtToken, User: dto.NewUserResponse(user)}, nil
}

// GetUserByUsername gets a user by username
func (s *InsightService) GetUserByUsername(username string) (*entities.User, error) {
	user, err := s.userRepo.FindByUsername(username)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apperror.NewNotFound("user not found")
		}
		return nil, apperror.NewInternal("failed to find user", err)
	}
	return user, nil
}

// Logout handles user logout
func (s *InsightService) Logout() error { return nil }

// RefreshToken handles token refresh
func (s *InsightService) RefreshToken() error {
	return apperror.NewBadRequest("not implemented")
}

// GetUser retrieves a user by ID
func (s *InsightService) GetUser(id uuid.UUID) (*dto.UserResponse, error) {
	user, err := s.userRepo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apperror.NewNotFound("user not found")
		}
		return nil, apperror.NewInternal("failed to find user", err)
	}
	return dto.NewUserResponse(user), nil
}

// GetUserByID retrieves a user entity by ID (for internal use)
func (s *InsightService) GetUserByID(id uuid.UUID) (*entities.User, error) {
	user, err := s.userRepo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apperror.NewNotFound("user not found")
		}
		return nil, apperror.NewInternal("failed to find user", err)
	}
	return user, nil
}

// GetProfile retrieves the current user's profile
func (s *InsightService) GetProfile(userID uuid.UUID) (*dto.UserResponse, error) {
	return s.GetUser(userID)
}

// UpdateProfile updates the current user's profile
func (s *InsightService) UpdateProfile(userID uuid.UUID, req *dto.UpdateUserRequest) (*dto.UserResponse, error) {
	user, err := s.userRepo.FindByID(userID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apperror.NewNotFound("user not found")
		}
		return nil, apperror.NewInternal("failed to find user", err)
	}

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
	if err := s.userRepo.Update(user); err != nil {
		return nil, apperror.NewInternal("failed to update user", err)
	}
	return dto.NewUserResponse(user), nil
}

// UpdateProfileWithAvatar updates user profile with optional avatar upload
func (s *InsightService) UpdateProfileWithAvatar(ctx context.Context, userID uuid.UUID, req *dto.UpdateUserRequest, avatarFile *multipart.FileHeader) (*dto.UserResponse, error) {
	user, err := s.userRepo.FindByID(userID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apperror.NewNotFound("user not found")
		}
		return nil, apperror.NewInternal("failed to find user", err)
	}

	if avatarFile != nil {
		uploadResponse, err := s.UpdateUserAvatarV2(ctx, avatarFile, userID)
		if err != nil {
			return nil, apperror.Wrap("failed to upload avatar", err)
		}
		req.AvatarURL = uploadResponse.URL
	}

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
	if err := s.userRepo.Update(user); err != nil {
		return nil, apperror.NewInternal("failed to update user", err)
	}
	return dto.NewUserResponse(user), nil
}

// DeleteProfile deletes the current user's account
func (s *InsightService) DeleteProfile(userID uuid.UUID) error {
	user, err := s.userRepo.FindByID(userID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return apperror.NewNotFound("user not found")
		}
		return apperror.NewInternal("failed to find user", err)
	}

	if user.AvatarURL != "" {
		if imageID := s.extractImageIDFromURL(user.AvatarURL); imageID != "" {
			_ = s.DeleteImageV2(context.Background(), imageID, userID)
		}
	}

	_ = s.CleanupUserImages(context.Background(), userID)

	if err := s.userRepo.Delete(userID); err != nil {
		return apperror.NewInternal("failed to delete user", err)
	}
	return nil
}

// UploadAvatarV2 uploads user avatar using V2 system
func (s *InsightService) UploadAvatarV2(ctx context.Context, file *multipart.FileHeader, userID uuid.UUID) (*storage.UploadResponse, error) {
	return s.UploadImageV2(ctx, file, userID, "avatar")
}

// UpdateUserAvatarV2 updates user avatar using V2 system with cleanup of old avatar.
func (s *InsightService) UpdateUserAvatarV2(ctx context.Context, file *multipart.FileHeader, userID uuid.UUID) (*storage.UploadResponse, error) {
	user, err := s.userRepo.FindByID(userID)
	if err != nil {
		return nil, apperror.NewNotFound("user not found")
	}

	oldAvatarURL := user.AvatarURL

	uploadResponse, err := s.UploadAvatarV2(ctx, file, userID)
	if err != nil {
		return nil, err
	}

	user.AvatarURL = uploadResponse.URL
	if err := s.userRepo.Update(user); err != nil {
		_ = s.DeleteImageV2(ctx, uploadResponse.ImageID.String(), userID)
		return nil, apperror.NewInternal("failed to update user profile", err)
	}

	// Delete old avatar if it was a V2 image
	if oldAvatarURL != "" && oldAvatarURL != uploadResponse.URL {
		if oldImageID := s.extractImageIDFromURL(oldAvatarURL); oldImageID != "" {
			_ = s.DeleteImageV2(ctx, oldImageID, userID)
		}
	}

	return uploadResponse, nil
}

// extractImageIDFromURL extracts image ID from V2 image URL
func (s *InsightService) extractImageIDFromURL(imageURL string) string {
	re := regexp.MustCompile(`/images/v2/([a-f0-9-]{36})`)
	matches := re.FindStringSubmatch(imageURL)
	if len(matches) > 1 {
		return matches[1]
	}
	return ""
}
