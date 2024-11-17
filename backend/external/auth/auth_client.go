// auth_client_impl.go
package client

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"time"
)

type AuthClient struct {
	BaseURL    string
	HTTPClient *http.Client
}

// NewAuthClient khởi tạo một client mới.
func NewAuthClient(baseURL string) AuthClientInterface {
	return &AuthClient{
		BaseURL:    baseURL,
		HTTPClient: &http.Client{Timeout: 10 * time.Second},
	}
}

func (c *AuthClient) Login(ctx context.Context, email, password string) (string, error) {
	url := fmt.Sprintf("%s/auth/login", c.BaseURL)
	payload := map[string]string{
		"email":    email,
		"password": password,
	}
	body, _ := json.Marshal(payload)

	req, err := http.NewRequestWithContext(ctx, "POST", url, bytes.NewBuffer(body))
	if err != nil {
		return "", err
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.HTTPClient.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return "", errors.New("failed to login")
	}

	var result struct {
		Token string `json:"token"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return "", err
	}
	return result.Token, nil
}

func (c *AuthClient) Register(ctx context.Context, email, password string) (string, error) {
	url := fmt.Sprintf("%s/auth/register", c.BaseURL)
	payload := map[string]string{
		"email":    email,
		"password": password,
	}
	body, _ := json.Marshal(payload)

	req, err := http.NewRequestWithContext(ctx, "POST", url, bytes.NewBuffer(body))
	if err != nil {
		return "", err
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.HTTPClient.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return "", errors.New("failed to register")
	}

	var result struct {
		Token string `json:"token"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return "", err
	}
	return result.Token, nil
}

func (c *AuthClient) GetUserProfile(ctx context.Context, token string) (*UserProfile, error) {
	url := fmt.Sprintf("%s/api/me", c.BaseURL)

	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Authorization", "Bearer "+token)

	resp, err := c.HTTPClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, errors.New("failed to get user profile")
	}

	var userProfile UserProfile
	if err := json.NewDecoder(resp.Body).Decode(&userProfile); err != nil {
		return nil, err
	}
	return &userProfile, nil
}

// Implement các phương thức khác tương tự với logic phù hợp...

func (c *AuthClient) VerifyEmail(ctx context.Context, token string) error {
	url := fmt.Sprintf("%s/api/verify?token=%s", c.BaseURL, token)

	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return err
	}

	resp, err := c.HTTPClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return errors.New("failed to verify email")
	}
	return nil
}

func (c *AuthClient) RequestPasswordReset(ctx context.Context, email string) error {
	url := fmt.Sprintf("%s/api/password-reset/request", c.BaseURL)
	payload := map[string]string{
		"email": email,
	}
	body, _ := json.Marshal(payload)

	req, err := http.NewRequestWithContext(ctx, "POST", url, bytes.NewBuffer(body))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.HTTPClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return errors.New("failed to request password reset")
	}
	return nil
}

func (c *AuthClient) ConfirmPasswordReset(ctx context.Context, token, newPassword string) error {
	url := fmt.Sprintf("%s/api/password-reset/confirm", c.BaseURL)
	payload := map[string]string{
		"token":        token,
		"new_password": newPassword,
	}
	body, _ := json.Marshal(payload)

	req, err := http.NewRequestWithContext(ctx, "POST", url, bytes.NewBuffer(body))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.HTTPClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return errors.New("failed to confirm password reset")
	}
	return nil
}

func (c *AuthClient) AdminGetUsers(ctx context.Context, token string) ([]UserProfile, error) {
	url := fmt.Sprintf("%s/api/admin/users", c.BaseURL)

	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Authorization", "Bearer "+token)

	resp, err := c.HTTPClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, errors.New("failed to get users")
	}

	var users []UserProfile
	if err := json.NewDecoder(resp.Body).Decode(&users); err != nil {
		return nil, err
	}
	return users, nil
}

func (c *AuthClient) AdminDeleteUser(ctx context.Context, token string, userID string) error {
	url := fmt.Sprintf("%s/api/admin/users/%s", c.BaseURL, userID)

	req, err := http.NewRequestWithContext(ctx, "DELETE", url, nil)
	if err != nil {
		return err
	}
	req.Header.Set("Authorization", "Bearer "+token)

	resp, err := c.HTTPClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return errors.New("failed to delete user")
	}
	return nil
}
