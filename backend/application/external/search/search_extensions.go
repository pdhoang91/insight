// search/search_extensions.go
package search

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"

	"github.com/pdhoang91/blog/models"
)

// GetSearchSuggestions gets search suggestions from search service
func (c *client) GetSearchSuggestions(ctx context.Context, query string, limit int) ([]models.SearchSuggestion, error) {
	buildURL := fmt.Sprintf("%s/search/suggestions?q=%s&limit=%d", c.baseURL, query, limit)

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, buildURL, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %v", err)
	}

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("request failed: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		bodyBytes, _ := ioutil.ReadAll(resp.Body)
		return nil, fmt.Errorf("unexpected status code: %d, body: %s", resp.StatusCode, string(bodyBytes))
	}

	var response struct {
		Suggestions []models.SearchSuggestion `json:"suggestions"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
		return nil, fmt.Errorf("failed to decode response: %v", err)
	}

	return response.Suggestions, nil
}

// GetPopularSearches gets popular searches from search service
func (c *client) GetPopularSearches(ctx context.Context, limit int) ([]models.PopularSearch, error) {
	buildURL := fmt.Sprintf("%s/search/popular?limit=%d", c.baseURL, limit)

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, buildURL, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %v", err)
	}

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("request failed: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		bodyBytes, _ := ioutil.ReadAll(resp.Body)
		return nil, fmt.Errorf("unexpected status code: %d, body: %s", resp.StatusCode, string(bodyBytes))
	}

	var response struct {
		PopularSearches []models.PopularSearch `json:"popular_searches"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
		return nil, fmt.Errorf("failed to decode response: %v", err)
	}

	return response.PopularSearches, nil
}

// TrackSearch tracks search analytics to search service
func (c *client) TrackSearch(ctx context.Context, query, userID string, resultsCount int) error {
	buildURL := fmt.Sprintf("%s/search/track", c.baseURL)

	requestData := map[string]interface{}{
		"query":         query,
		"user_id":       userID,
		"results_count": resultsCount,
	}

	postData, err := json.Marshal(requestData)
	if err != nil {
		return fmt.Errorf("failed to marshal request data: %v", err)
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
