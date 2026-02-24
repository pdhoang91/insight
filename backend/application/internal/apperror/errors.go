package apperror

import (
	"errors"
	"fmt"
	"net/http"
)

// AppError represents a domain-level error with HTTP status mapping
type AppError struct {
	Code    int
	Message string
	Err     error
}

func (e *AppError) Error() string {
	if e.Err != nil {
		return fmt.Sprintf("%s: %v", e.Message, e.Err)
	}
	return e.Message
}

func (e *AppError) Unwrap() error { return e.Err }

func NewNotFound(msg string) *AppError {
	return &AppError{Code: http.StatusNotFound, Message: msg}
}

func NewBadRequest(msg string) *AppError {
	return &AppError{Code: http.StatusBadRequest, Message: msg}
}

func NewUnauthorized(msg string) *AppError {
	return &AppError{Code: http.StatusUnauthorized, Message: msg}
}

func NewForbidden(msg string) *AppError {
	return &AppError{Code: http.StatusForbidden, Message: msg}
}

func NewConflict(msg string) *AppError {
	return &AppError{Code: http.StatusConflict, Message: msg}
}

func NewInternal(msg string, err error) *AppError {
	return &AppError{Code: http.StatusInternalServerError, Message: msg, Err: err}
}

// Wrap preserves the original AppError's status code while adding context
func Wrap(msg string, err error) *AppError {
	var appErr *AppError
	if errors.As(err, &appErr) {
		return &AppError{Code: appErr.Code, Message: fmt.Sprintf("%s: %s", msg, appErr.Message), Err: appErr.Err}
	}
	return NewInternal(msg, err)
}

// HTTPCode extracts HTTP status code from error; defaults to 500
func HTTPCode(err error) int {
	var appErr *AppError
	if errors.As(err, &appErr) {
		return appErr.Code
	}
	return http.StatusInternalServerError
}

// UserMessage extracts user-safe message from error
func UserMessage(err error) string {
	var appErr *AppError
	if errors.As(err, &appErr) {
		return appErr.Message
	}
	return "internal server error"
}
