package service

import (
	"crypto/rand"
	"encoding/hex"
	"errors"
	"fmt"

	"github.com/pdhoang91/blog/internal/dto"
	"github.com/pdhoang91/blog/internal/entities"
	uuid "github.com/satori/go.uuid"
	"gorm.io/gorm"
)

// ==================== EMAIL VERIFICATION METHODS ====================

// SendEmailVerification sends email verification token
func (s *InsightService) SendEmailVerification(userID uuid.UUID) error {
	// Find user
	user, err := s.User.FindByID(s.DB, userID)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return errors.New("not found")
		}
		return errors.New("internal server error")
	}

	// Check if already verified
	if user.EmailVerified {
		return errors.New("bad request") // Email already verified
	}

	// Generate verification token
	token, err := generateSecureToken(32)
	if err != nil {
		return errors.New("internal server error")
	}

	// Update user with verification token
	user.VerificationToken = token
	if err := user.Update(s.DB); err != nil {
		return errors.New("internal server error")
	}

	// Send email (async)
	go func() {
		if err := s.sendVerificationEmail(user.Email, user.Name, token); err != nil {
			// TODO: Log error
		}
	}()

	return nil
}

// VerifyEmail verifies email with token
func (s *InsightService) VerifyEmail(req *dto.VerifyEmailRequest) (*dto.UserResponse, error) {
	// Find user by verification token
	var user entities.User
	err := s.DB.Where("verification_token = ? AND verification_token != ''", req.Token).First(&user).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, errors.New("bad request") // Invalid token
		}
		return nil, errors.New("internal server error")
	}

	// Check if already verified
	if user.EmailVerified {
		return nil, errors.New("bad request") // Already verified
	}

	// Mark as verified and clear token
	user.EmailVerified = true
	user.VerificationToken = ""
	if err := user.Update(s.DB); err != nil {
		return nil, errors.New("internal server error")
	}

	return dto.NewUserResponse(&user), nil
}

// ResendEmailVerification resends verification email
func (s *InsightService) ResendEmailVerification(email string) error {
	// Find user by email
	user, err := s.User.FindByEmail(s.DB, email)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return errors.New("not found")
		}
		return errors.New("internal server error")
	}

	// Check if already verified
	if user.EmailVerified {
		return errors.New("bad request") // Email already verified
	}

	// Generate new verification token
	token, err := generateSecureToken(32)
	if err != nil {
		return errors.New("internal server error")
	}

	// Update user with new verification token
	user.VerificationToken = token
	if err := user.Update(s.DB); err != nil {
		return errors.New("internal server error")
	}

	// Send email (async)
	go func() {
		if err := s.sendVerificationEmail(user.Email, user.Name, token); err != nil {
			// TODO: Log error
		}
	}()

	return nil
}

// CheckEmailVerificationStatus checks if email is verified
func (s *InsightService) CheckEmailVerificationStatus(userID uuid.UUID) (*dto.EmailVerificationStatus, error) {
	user, err := s.User.FindByID(s.DBR2, userID)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, errors.New("not found")
		}
		return nil, errors.New("internal server error")
	}

	return &dto.EmailVerificationStatus{
		UserID:        user.ID,
		Email:         user.Email,
		EmailVerified: user.EmailVerified,
	}, nil
}

// sendVerificationEmail sends verification email (placeholder implementation)
func (s *InsightService) sendVerificationEmail(email, name, token string) error {
	// TODO: Implement actual email sending using SMTP or email service
	// For now, just log the verification URL

	baseURL := "http://localhost:3000" // Should come from config
	verificationURL := fmt.Sprintf("%s/verify-email?token=%s", baseURL, token)

	// TODO: Use proper email template and SMTP service
	fmt.Printf("Email Verification for %s (%s):\n", name, email)
	fmt.Printf("Verification URL: %s\n", verificationURL)
	fmt.Printf("Token: %s\n", token)

	return nil
}

// generateSecureToken generates a cryptographically secure random token
func generateSecureToken(length int) (string, error) {
	bytes := make([]byte, length)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes), nil
}
