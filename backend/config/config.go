// config.go
package config

import (
	"fmt"
	"os"

	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
)

var GoogleOauthConfig *oauth2.Config

func Init() error {
	GoogleOauthConfig = &oauth2.Config{
		RedirectURL: os.Getenv("GOOGLE_REDIRECT_URL"), // Change to your redirect URL
		//RedirectURL:  "http://localhost:81/auth/google/callback", // Change to your redirect URL
		ClientID:     os.Getenv("GOOGLE_CLIENT_ID"),     // Set your Google Client ID
		ClientSecret: os.Getenv("GOOGLE_CLIENT_SECRET"), // Set your Google Client Secret
		Scopes:       []string{"email", "profile"},
		Endpoint:     google.Endpoint,
	}

	fmt.Printf("Configuration: %+v\n", GoogleOauthConfig)
	return nil
}

// Get -
func Get() *oauth2.Config {
	if GoogleOauthConfig == nil {
		panic("Config was not initialized")
	}
	return GoogleOauthConfig
}
