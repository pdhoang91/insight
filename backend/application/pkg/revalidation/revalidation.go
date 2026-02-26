package revalidation

import (
	"bytes"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"time"
)

var client = &http.Client{Timeout: 5 * time.Second}

type revalidateRequest struct {
	Slug   string `json:"slug"`
	Type   string `json:"type"`
	Secret string `json:"secret"`
}

// TriggerPostRevalidation tells the frontend to revalidate a post page.
// Runs in a goroutine so it doesn't block the caller.
func TriggerPostRevalidation(slug string) {
	go func() {
		feURL := os.Getenv("BASE_FE_URL")
		secret := os.Getenv("REVALIDATION_SECRET")
		if feURL == "" || secret == "" {
			return
		}

		body, _ := json.Marshal(revalidateRequest{
			Slug:   slug,
			Type:   "post",
			Secret: secret,
		})

		resp, err := client.Post(feURL+"/api/revalidate", "application/json", bytes.NewReader(body))
		if err != nil {
			log.Printf("revalidation: failed to call frontend: %v", err)
			return
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			log.Printf("revalidation: frontend returned %d", resp.StatusCode)
		}
	}()
}
