// utils/password_reset.go

package utils

import (
	"crypto/rand"
	"encoding/hex"
	"time"
)

func GeneratePasswordResetToken() (string, error) {
	bytes := make([]byte, 16)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes), nil
}

func GetPasswordResetExpiry() time.Time {
	return time.Now().Add(1 * time.Hour) // Token valid for 1 hour
}
