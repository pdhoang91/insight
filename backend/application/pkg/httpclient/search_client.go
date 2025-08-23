package httpclient

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"time"
)

// SearchClient handles HTTP requests to the search service
type SearchClient struct {
	baseURL    string
	httpClient *http.Client
}

// SearchPostsResponse represents the response from search service
type SearchPostsResponse struct {
	Data       []SearchPostResult `json:"data"`
	TotalCount int                `json:"total_count"`
}

// SearchPostResult represents a single post result from search service
type SearchPostResult struct {
	ID             string     `json:"id"`
	Title          string     `json:"title"`
	TitleName      string     `json:"title_name"`
	PreviewContent string     `json:"preview_content"`
	Content        string     `json:"content"`
	Tags           []string   `json:"tags"`
	Categories     []string   `json:"categories"`
	UserID         string     `json:"user_id"`
	User           SearchUser `json:"user"`
	CreatedAt      time.Time  `json:"created_at"`
	ClapCount      uint64     `json:"claps"`
	Views          uint64     `json:"views"`
	CommentsCount  uint64     `json:"comments_count"`
	AverageRating  float64    `json:"average_rating"`
}

// SearchUser represents user info in search results
type SearchUser struct {
	ID        string    `json:"id"`
	Email     string    `json:"email"`
	Name      string    `json:"name"`
	Username  string    `json:"username"`
	AvatarURL string    `json:"avatar_url"`
	Bio       string    `json:"bio"`
	Phone     string    `json:"phone"`
	Dob       string    `json:"dob"`
	Role      string    `json:"role"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// NewSearchClient creates a new search service client
func NewSearchClient() *SearchClient {
	baseURL := os.Getenv("BASE_SEARCH_API_URL")
	if baseURL == "" {
		baseURL = "http://search_service:83" // Default for docker compose
	}

	return &SearchClient{
		baseURL: baseURL,
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

// SearchPosts calls the search service to search for posts
func (c *SearchClient) SearchPosts(query string, page, limit int) (*SearchPostsResponse, error) {
	// Build URL with query parameters
	u, err := url.Parse(c.baseURL + "/search/posts")
	if err != nil {
		return nil, fmt.Errorf("failed to parse search service URL: %v", err)
	}

	params := url.Values{}
	params.Add("q", query)
	params.Add("page", fmt.Sprintf("%d", page))
	params.Add("limit", fmt.Sprintf("%d", limit))
	u.RawQuery = params.Encode()

	// Make HTTP request
	resp, err := c.httpClient.Get(u.String())
	if err != nil {
		return nil, fmt.Errorf("failed to call search service: %v", err)
	}
	defer resp.Body.Close()

	// Read response body
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read search service response: %v", err)
	}

	// Check HTTP status
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("search service returned error: %d - %s", resp.StatusCode, string(body))
	}

	// Parse JSON response
	var searchResp SearchPostsResponse
	if err := json.Unmarshal(body, &searchResp); err != nil {
		return nil, fmt.Errorf("failed to parse search service response: %v", err)
	}

	// Handle null data from search service
	if searchResp.Data == nil {
		searchResp.Data = []SearchPostResult{}
	}

	return &searchResp, nil
}

// TrackSearch calls the search service to track search analytics
func (c *SearchClient) TrackSearch(query, userID string, resultsCount int) error {
	trackData := map[string]interface{}{
		"query":         query,
		"user_id":       userID,
		"results_count": resultsCount,
	}

	jsonData, err := json.Marshal(trackData)
	if err != nil {
		return fmt.Errorf("failed to marshal track data: %v", err)
	}

	resp, err := c.httpClient.Post(
		c.baseURL+"/search/track",
		"application/json",
		bytes.NewBuffer(jsonData),
	)
	if err != nil {
		return fmt.Errorf("failed to track search: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("search tracking failed: %d - %s", resp.StatusCode, string(body))
	}

	return nil
}
