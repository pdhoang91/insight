package dto

// VerifyEmailRequest represents a request to verify email
type VerifyEmailRequest struct {
	Token string `json:"token" binding:"required"`
}

// ResendVerificationRequest represents a request to resend verification email
type ResendVerificationRequest struct {
	Email string `json:"email" binding:"required,email"`
}
