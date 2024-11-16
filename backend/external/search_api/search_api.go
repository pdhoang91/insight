// package search_api

// import (
// 	"bytes"
// 	"encoding/json"
// 	"fmt"
// 	"io/ioutil"
// 	"log"
// 	"net/http"
// 	"os"

// 	"github.com/pdhoang91/blog/models"
// )

// // A Response struct to map the Entire Response
// type Response struct {
// 	Name    string    `json:"name"`
// 	Pokemon []Pokemon `json:"pokemon_entries"`
// }

// // A Pokemon Struct to map every pokemon to.
// type Pokemon struct {
// 	EntryNo int            `json:"entry_number"`
// 	Species PokemonSpecies `json:"pokemon_species"`
// }

// // A struct to map our Pokemon's Species which includes it's name
// type PokemonSpecies struct {
// 	Name string `json:"name"`
// }

// // SearchPost calls KeyAPI to authorize api key with request info
// func SearchPost(query string, page int, limit int) ([]byte, int, error) {

// 	searchURL := os.Getenv("BASE_SEARCH_API_URL")
// 	buildURL := fmt.Sprintf("%s/search/posts?q=%s&page=%d&limit=%d", searchURL, query, page, limit)
// 	response, err := http.Get(buildURL)
// 	if err != nil {
// 		fmt.Print(err.Error())
// 		//os.Exit(1)
// 	}

// 	responseData, err := ioutil.ReadAll(response.Body)
// 	if err != nil {
// 		log.Fatal(err)
// 	}

// 	return responseData, 0, nil
// }

// search_api/search_client.go
package search_api

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"

	"github.com/pdhoang91/blog/models"
	uuid "github.com/satori/go.uuid"
)

// client implements ISearchClient interface
type client struct {
	baseURL    string
	httpClient *http.Client
}

// Option defines a function type for configuring the client
type Option func(*client)

// WithHTTPClient allows setting a custom HTTP client
func WithHTTPClient(httpClient *http.Client) Option {
	return func(c *client) {
		c.httpClient = httpClient
	}
}

// New creates a new instance of ISearchClient
func New(opts ...Option) ISearchClient {
	baseURL := os.Getenv("BASE_SEARCH_API_URL")
	if baseURL == "" {
		baseURL = "http://localhost:83" // Default base URL
	}

	c := &client{
		baseURL: baseURL,
		httpClient: &http.Client{
			Timeout: 30 * 1000, // 30 seconds timeout
		},
	}

	for _, opt := range opts {
		opt(c)
	}

	return c
}

// search_api/search_client.go
func (c *client) SearchPost(ctx context.Context, query string, page int, limit int) ([]models.SearchPost, int, error) {
	buildURL := fmt.Sprintf("%s/search/posts?q=%s&page=%d&limit=%d", c.baseURL, query, page, limit)

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, buildURL, nil)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to create request: %v", err)
	}

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, 0, fmt.Errorf("request failed: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		bodyBytes, _ := ioutil.ReadAll(resp.Body)
		return nil, 0, fmt.Errorf("unexpected status code: %d, body: %s", resp.StatusCode, string(bodyBytes))
	}

	var response struct {
		Data       []models.SearchPost `json:"data"`
		TotalCount int                 `json:"total_count"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
		return nil, 0, fmt.Errorf("failed to decode response: %v", err)
	}

	return response.Data, response.TotalCount, nil
}

// search_api/search_client.go
func (c *client) IndexPost(ctx context.Context, post models.SearchPost) error {
	buildURL := fmt.Sprintf("%s/search/posts/index", c.baseURL)

	postData, err := json.Marshal(post)
	if err != nil {
		return fmt.Errorf("failed to marshal post data: %v", err)
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, buildURL, bytes.NewBuffer(postData))
	if err != nil {
		return fmt.Errorf("failed to create request: %v", err)
	}

	req.Header.Set("Content-Type", "application/json")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("request failed: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		bodyBytes, _ := ioutil.ReadAll(resp.Body)
		return fmt.Errorf("unexpected status code: %d, body: %s", resp.StatusCode, string(bodyBytes))
	}

	return nil
}

// search_api/search_client.go
func (c *client) DeletePostFromIndex(ctx context.Context, postID uuid.UUID) error {
	buildURL := fmt.Sprintf("%s/search/posts/%s", c.baseURL, postID.String())

	req, err := http.NewRequestWithContext(ctx, http.MethodDelete, buildURL, nil)
	if err != nil {
		return fmt.Errorf("failed to create request: %v", err)
	}

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("request failed: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		bodyBytes, _ := ioutil.ReadAll(resp.Body)
		return fmt.Errorf("unexpected status code: %d, body: %s", resp.StatusCode, string(bodyBytes))
	}

	return nil
}
