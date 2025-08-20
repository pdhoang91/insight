// controller/auth_methods.go
package controller

import (
	"github.com/gin-gonic/gin"
)

// LoginHandler handles user login
func (ctrl *Controller) LoginHandler(c *gin.Context) {
	// Delegate to existing function for now
	LoginHandler(c)
}

// RegisterHandler handles user registration
func (ctrl *Controller) RegisterHandler(c *gin.Context) {
	// Delegate to existing function for now
	RegisterHandler(c)
}

// GoogleLoginHandler handles Google OAuth login
func (ctrl *Controller) GoogleLoginHandler(c *gin.Context) {
	// Delegate to existing function for now
	GoogleLoginHandler(c)
}

// GoogleCallbackHandler handles Google OAuth callback
func (ctrl *Controller) GoogleCallbackHandler(c *gin.Context) {
	// Delegate to existing function for now
	GoogleCallbackHandler(c)
}

// VerifyEmail handles email verification
func (ctrl *Controller) VerifyEmail(c *gin.Context) {
	// Delegate to existing function for now
	VerifyEmail(c)
}

// RequestPasswordReset handles password reset request
func (ctrl *Controller) RequestPasswordReset(c *gin.Context) {
	// Delegate to existing function for now
	RequestPasswordReset(c)
}

// ConfirmPasswordReset handles password reset confirmation
func (ctrl *Controller) ConfirmPasswordReset(c *gin.Context) {
	// Delegate to existing function for now
	ConfirmPasswordReset(c)
}
