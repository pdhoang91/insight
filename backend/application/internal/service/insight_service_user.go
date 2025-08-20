package service

import (
	"time"

	"github.com/pdhoang91/blog/constants"
	"github.com/pdhoang91/blog/internal/entities"
	"github.com/pdhoang91/blog/internal/model"
	appError "github.com/pdhoang91/blog/pkg/error"
	uuid "github.com/satori/go.uuid"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// ==================== USER METHODS ====================

// Register creates a new user account
func (s *InsightService) Register(req *model.CreateUserRequest) (*model.UserResponse, error) {
	// Check if user already exists
	existingUser, err := s.User.FindByEmail(s.DB, req.Email)
	if err != nil && err != gorm.ErrRecordNotFound {
		return nil, appError.InternalServerError("Failed to check existing user", err)
	}
	if existingUser != nil {
		return nil, appError.Conflict("User with this email already exists", nil)
	}

	// Check if username already exists
	existingUser, err = s.User.FindByUsername(s.DB, req.Username)
	if err != nil && err != gorm.ErrRecordNotFound {
		return nil, appError.InternalServerError("Failed to check existing username", err)
	}
	if existingUser != nil {
		return nil, appError.Conflict("Username already taken", nil)
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, appError.InternalServerError("Failed to hash password", err)
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

	if err := user.Create(s.DB); err != nil {
		return nil, appError.InternalServerError("Failed to create user", err)
	}

	return model.NewUserResponse(user), nil
}

// Login authenticates a user
func (s *InsightService) Login(req *model.LoginRequest) (*model.LoginResponse, error) {
	user, err := s.User.FindByEmail(s.DB, req.Email)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, appError.Unauthorized("Invalid credentials", nil)
		}
		return nil, appError.InternalServerError("Failed to find user", err)
	}

	// Check password
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		return nil, appError.Unauthorized("Invalid credentials", nil)
	}

	// TODO: Generate JWT token using TokenMaker
	response := &model.LoginResponse{
		Token: "jwt-token-here", // Placeholder
		User:  model.NewUserResponse(user),
	}

	return response, nil
}

// GoogleAuth handles Google OAuth authentication
func (s *InsightService) GoogleAuth() error {
	// TODO: Implement Google OAuth flow
	return appError.BadRequest("Google auth not implemented yet", nil)
}

// Logout handles user logout
func (s *InsightService) Logout() error {
	// TODO: Implement logout logic (invalidate token)
	return nil
}

// RefreshToken handles token refresh
func (s *InsightService) RefreshToken() error {
	// TODO: Implement token refresh logic using TokenMaker
	return appError.BadRequest("Token refresh not implemented yet", nil)
}

// GetUser retrieves a user by ID
func (s *InsightService) GetUser(id uuid.UUID) (*model.UserResponse, error) {
	user, err := s.User.FindByID(s.DB, id)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, appError.NotFound("User not found", err)
		}
		return nil, appError.InternalServerError("Failed to get user", err)
	}

	return model.NewUserResponse(user), nil
}

// GetProfile retrieves the current user's profile
func (s *InsightService) GetProfile(userID uuid.UUID) (*model.UserResponse, error) {
	user, err := s.User.FindByID(s.DB, userID)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, appError.NotFound("User not found", err)
		}
		return nil, appError.InternalServerError("Failed to get user", err)
	}

	return model.NewUserResponse(user), nil
}

// UpdateProfile updates the current user's profile
func (s *InsightService) UpdateProfile(userID uuid.UUID, req *model.UpdateUserRequest) (*model.UserResponse, error) {
	user, err := s.User.FindByID(s.DB, userID)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, appError.NotFound("User not found", err)
		}
		return nil, appError.InternalServerError("Failed to get user", err)
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
		return nil, appError.InternalServerError("Failed to update user", err)
	}

	return model.NewUserResponse(user), nil
}

// DeleteProfile deletes the current user's account
func (s *InsightService) DeleteProfile(userID uuid.UUID) error {
	// Check if user exists
	_, err := s.User.FindByID(s.DB, userID)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return appError.NotFound("User not found", err)
		}
		return appError.InternalServerError("Failed to check user", err)
	}

	if err := s.User.DeleteByID(s.DB, userID); err != nil {
		return appError.InternalServerError("Failed to delete user", err)
	}

	return nil
}

// GetAllUsers retrieves all users (admin only)
func (s *InsightService) GetAllUsers(req *model.PaginationRequest) ([]*model.UserResponse, int64, error) {
	if req.Limit == 0 {
		req.Limit = 50
	}

	users, err := s.User.List(s.DB, req.Limit, req.Offset)
	if err != nil {
		return nil, 0, appError.InternalServerError("Failed to get users", err)
	}

	var responses []*model.UserResponse
	for _, user := range users {
		responses = append(responses, model.NewUserResponse(user))
	}

	return responses, int64(len(responses)), nil
}

// DeleteUser deletes a user by ID (admin only)
func (s *InsightService) DeleteUser(id uuid.UUID) error {
	if err := s.User.DeleteByID(s.DB, id); err != nil {
		return appError.InternalServerError("Failed to delete user", err)
	}

	return nil
}
