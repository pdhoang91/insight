// utils/email.go

package utils

import (
	"crypto/rand"
	"encoding/hex"
)

func GenerateVerificationToken() (string, error) {
	bytes := make([]byte, 16)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes), nil
}

func SendVerificationEmail(email, token string) error {
	//verificationURL := fmt.Sprintf("http://localhost:3000/verify?token=%s", token)
	// Implement email sending logic here
	// Example: SendGrid API, SMTP, etc.
	return nil
}

func SendPasswordResetEmail(email, resetURL string) error {
	// Implement email sending logic here
	// Example: SendGrid API, SMTP, etc.
	return nil
}
