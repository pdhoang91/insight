package dto

import "time"

// PasswordResetTokenStatus represents password reset token validation status
type PasswordResetTokenStatus struct {
	Valid     bool      `json:"valid"`
	Message   string    `json:"message"`
	Email     string    `json:"email,omitempty"`
	ExpiresAt time.Time `json:"expires_at,omitempty"`
}
