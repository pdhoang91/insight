package dto

import uuid "github.com/satori/go.uuid"

// EmailVerificationStatus represents email verification status
type EmailVerificationStatus struct {
	UserID        uuid.UUID `json:"user_id"`
	Email         string    `json:"email"`
	EmailVerified bool      `json:"email_verified"`
}
