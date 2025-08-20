package service

import (
	"errors"
	"fmt"
	"time"

	"github.com/pdhoang91/blog/internal/dto"
	"github.com/pdhoang91/blog/internal/entities"
	uuid "github.com/satori/go.uuid"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// ==================== PASSWORD RESET METHODS ====================

// RequestPasswordReset sends password reset token
func (s *InsightService) RequestPasswordReset(req *dto.PasswordResetRequest) error {
	// Find user by email
	user, err := s.User.FindByEmail(s.DB, req.Email)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			// Don't reveal if email exists or not for security
			return nil
		}
		return errors.New("internal server error")
	}

	// Generate reset token
	token, err := generateSecureToken(32)
	if err != nil {
		return errors.New("internal server error")
	}

	// Set token expiration (1 hour)
	expiresAt := time.Now().Add(time.Hour)

	// Update user with reset token
	user.PasswordResetToken = token
	user.PasswordResetExpiresAt = expiresAt
	if err := user.Update(s.DB); err != nil {
		return errors.New("internal server error")
	}

	// Send reset email (async)
	go func() {
		if err := s.sendPasswordResetEmail(user.Email, user.Name, token); err != nil {
			// TODO: Log error
		}
	}()

	return nil
}

// ResetPassword resets password with token
func (s *InsightService) ResetPassword(req *dto.ResetPasswordRequest) (*dto.UserResponse, error) {
	// Find user by reset token
	var user entities.User
	err := s.DB.Where("password_reset_token = ? AND password_reset_token != '' AND password_reset_expires_at > ?",
		req.Token, time.Now()).First(&user).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, errors.New("bad request") // Invalid or expired token
		}
		return nil, errors.New("internal server error")
	}

	// Hash new password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		return nil, errors.New("internal server error")
	}

	// Update password and clear reset token
	user.Password = string(hashedPassword)
	user.PasswordResetToken = ""
	user.PasswordResetExpiresAt = time.Time{} // Zero time
	if err := user.Update(s.DB); err != nil {
		return nil, errors.New("internal server error")
	}

	// Send confirmation email (async)
	go func() {
		if err := s.sendPasswordResetConfirmationEmail(user.Email, user.Name); err != nil {
			// TODO: Log error
		}
	}()

	return dto.NewUserResponse(&user), nil
}

// ChangePassword changes password for authenticated user
func (s *InsightService) ChangePassword(userID uuid.UUID, req *dto.ChangePasswordRequest) error {
	// Find user
	user, err := s.User.FindByID(s.DB, userID)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return errors.New("not found")
		}
		return errors.New("internal server error")
	}

	// Verify current password
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.CurrentPassword)); err != nil {
		return errors.New("unauthorized") // Current password is incorrect
	}

	// Hash new password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		return errors.New("internal server error")
	}

	// Update password
	user.Password = string(hashedPassword)
	if err := user.Update(s.DB); err != nil {
		return errors.New("internal server error")
	}

	// Send confirmation email (async)
	go func() {
		if err := s.sendPasswordChangeConfirmationEmail(user.Email, user.Name); err != nil {
			// TODO: Log error
		}
	}()

	return nil
}

// ValidatePasswordResetToken validates if reset token is valid
func (s *InsightService) ValidatePasswordResetToken(token string) (*dto.PasswordResetTokenStatus, error) {
	var user entities.User
	err := s.DB.Where("password_reset_token = ? AND password_reset_token != ''", token).First(&user).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return &dto.PasswordResetTokenStatus{
				Valid:   false,
				Message: "Invalid token",
			}, nil
		}
		return nil, errors.New("internal server error")
	}

	// Check if token is expired
	if time.Now().After(user.PasswordResetExpiresAt) {
		return &dto.PasswordResetTokenStatus{
			Valid:   false,
			Message: "Token expired",
		}, nil
	}

	return &dto.PasswordResetTokenStatus{
		Valid:     true,
		Message:   "Token is valid",
		Email:     user.Email,
		ExpiresAt: user.PasswordResetExpiresAt,
	}, nil
}

// sendPasswordResetEmail sends password reset email (placeholder implementation)
func (s *InsightService) sendPasswordResetEmail(email, name, token string) error {
	// TODO: Implement actual email sending using SMTP or email service
	// For now, just log the reset URL

	baseURL := "http://localhost:3000" // Should come from config
	resetURL := fmt.Sprintf("%s/reset-password?token=%s", baseURL, token)

	// TODO: Use proper email template and SMTP service
	fmt.Printf("Password Reset for %s (%s):\n", name, email)
	fmt.Printf("Reset URL: %s\n", resetURL)
	fmt.Printf("Token: %s\n", token)
	fmt.Printf("This link will expire in 1 hour.\n")

	return nil
}

// sendPasswordResetConfirmationEmail sends password reset confirmation email
func (s *InsightService) sendPasswordResetConfirmationEmail(email, name string) error {
	// TODO: Implement actual email sending
	fmt.Printf("Password Reset Confirmation for %s (%s):\n", name, email)
	fmt.Printf("Your password has been successfully reset.\n")

	return nil
}

// sendPasswordChangeConfirmationEmail sends password change confirmation email
func (s *InsightService) sendPasswordChangeConfirmationEmail(email, name string) error {
	// TODO: Implement actual email sending
	fmt.Printf("Password Change Confirmation for %s (%s):\n", name, email)
	fmt.Printf("Your password has been successfully changed.\n")

	return nil
}
