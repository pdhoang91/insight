package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/PuerkitoBio/goquery"
	"github.com/chromedp/chromedp"
	"github.com/gin-gonic/gin"
	"github.com/pdhoang91/ai-service/models"
)

// FetchArticle handles fetching content from any website
// FetchArticle handles fetching content from any website
func FetchArticle(c *gin.Context) {
	var req models.ArticleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	if req.URL == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "URL is required"})
		return
	}

	// Thử tải nội dung tĩnh
	content, err := fetchStaticContent(req.URL)
	if err != nil {
		log.Printf("Static fetch failed: %v", err)
		// Thử tải nội dung động
		content, err = fetchDynamicContent(req.URL)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch content"})
			return
		}
	}

	response := models.ArticleResponse{
		Content: content,
	}
	c.JSON(http.StatusOK, response)
}

func respondWithError(w http.ResponseWriter, s string, err error) {
	panic("unimplemented")
}

// fetchStaticContent attempts to fetch content from static HTML
func fetchStaticContent(url string) (string, error) {
	client := &http.Client{
		Timeout: 10 * time.Second,
	}

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return "", fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
	req.Header.Set("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8")

	resp, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("failed to fetch URL: %w", err)
	}
	defer resp.Body.Close()

	bodyBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("failed to read body: %w", err)
	}

	// Check if it's JSON response
	var jsonContent map[string]interface{}
	if err := json.Unmarshal(bodyBytes, &jsonContent); err == nil {
		// Handle JSON response
		jsonStr, _ := json.MarshalIndent(jsonContent, "", "  ")
		return string(jsonStr), nil
	}

	// Parse HTML
	doc, err := goquery.NewDocumentFromReader(strings.NewReader(string(bodyBytes)))
	if err != nil {
		return "", fmt.Errorf("failed to parse HTML: %w", err)
	}

	var content strings.Builder

	// Try meta description
	if metaDesc, exists := doc.Find("meta[name='description']").Attr("content"); exists {
		content.WriteString(metaDesc)
		content.WriteString("\n\n")
	}

	// Try article title
	title := doc.Find("h1").First().Text()
	if title != "" {
		content.WriteString(title)
		content.WriteString("\n\n")
	}

	// Common content selectors
	selectors := []string{
		"article", "main", "[role='main']",
		".post-content", ".article-content", ".entry-content",
		".content", "#content", ".main-content",
		".article", ".post", ".entry",
		"article[role='article']", "[itemprop='articleBody']",
	}

	// Try each selector
	contentFound := false
	for _, selector := range selectors {
		selection := doc.Find(selector)
		if selection.Length() > 0 {
			selection.Find("script, style, nav, header, footer, .ads, .comments").Remove()
			text := cleanText(selection.Text())
			if len(text) > 100 { // Minimum content length
				content.WriteString(text)
				contentFound = true
				break
			}
		}
	}

	// If no content found, try paragraphs
	if !contentFound {
		doc.Find("p").Each(func(_ int, s *goquery.Selection) {
			text := cleanText(s.Text())
			if len(text) > 50 {
				content.WriteString(text)
				content.WriteString("\n\n")
				contentFound = true
			}
		})
	}

	finalContent := content.String()
	if len(finalContent) < 100 {
		return "", fmt.Errorf("no meaningful content found")
	}

	return finalContent, nil
}

func fetchDynamicContent(url string) (string, error) {
	// Create context with timeout
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	// Options cho Chrome trong container
	opts := append(chromedp.DefaultExecAllocatorOptions[:],
		chromedp.Flag("no-sandbox", true),
		chromedp.Flag("disable-setuid-sandbox", true),
		chromedp.Flag("headless", true),
		chromedp.Flag("disable-gpu", true),
		chromedp.Flag("disable-dev-shm-usage", true),
		chromedp.Flag("disable-software-rasterizer", true),
		chromedp.Flag("remote-debugging-port", "9222"),
		chromedp.Flag("disable-web-security", true),
		chromedp.Flag("disable-extensions", true),
		chromedp.Flag("disable-notifications", true),
		chromedp.Flag("ignore-certificate-errors", true),
		// Thêm User-Agent để tránh bị chặn
		chromedp.UserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"),
	)

	allocCtx, cancel := chromedp.NewExecAllocator(ctx, opts...)
	defer cancel()

	// Thêm logging để debug
	chromeCtx, cancel := chromedp.NewContext(allocCtx,
		chromedp.WithLogf(log.Printf),
		chromedp.WithErrorf(log.Printf),
	)
	defer cancel()

	var htmlContent string
	err := chromedp.Run(chromeCtx,
		// Set viewport
		chromedp.EmulateViewport(1280, 720),
		// Navigate với timeout
		chromedp.Navigate(url),
		// Wait for body
		chromedp.WaitVisible("body", chromedp.ByQuery),
		// Thêm delay để đợi content load
		chromedp.Sleep(3*time.Second),
		// Get HTML content
		chromedp.OuterHTML("body", &htmlContent, chromedp.ByQuery),
	)

	if err != nil {
		return "", fmt.Errorf("chromedp error: %w", err)
	}

	// Process HTML content như cũ
	doc, err := goquery.NewDocumentFromReader(strings.NewReader(htmlContent))
	if err != nil {
		return "", fmt.Errorf("failed to parse dynamic HTML: %w", err)
	}

	// Remove unwanted elements
	doc.Find("script, style, nav, header, footer, .ads, .comments").Remove()

	var content strings.Builder
	contentFound := false

	// Try article title first
	if title := doc.Find("h1").First().Text(); title != "" {
		content.WriteString(title + "\n\n")
	}

	// Try meta description
	if metaDesc, exists := doc.Find("meta[name='description']").Attr("content"); exists {
		content.WriteString(metaDesc + "\n\n")
	}

	// Common content selectors with logging
	selectors := []string{
		"article", "main", "[role='main']",
		".post-content", ".article-content", ".entry-content",
		".content", "#content", ".main-content",
		"article[role='article']", "[itemprop='articleBody']",
		// Add more selectors based on common patterns
		".story-content", ".post-body", ".entry-body",
		".article-body", ".story-body", ".news-content",
	}

	// Log all found selectors
	for _, selector := range selectors {
		count := doc.Find(selector).Length()
		if count > 0 {
			log.Printf("Found %d elements with selector: %s", count, selector)
		}
	}

	// Try each selector
	for _, selector := range selectors {
		selection := doc.Find(selector)
		if selection.Length() > 0 {
			text := cleanText(selection.Text())
			if len(text) > 100 {
				content.WriteString(text + "\n\n")
				contentFound = true
				break
			}
		}
	}

	// If no content found with selectors, try paragraphs
	if !contentFound {
		var paragraphCount int
		doc.Find("p").Each(func(_ int, s *goquery.Selection) {
			text := cleanText(s.Text())
			if len(text) > 50 {
				content.WriteString(text + "\n\n")
				contentFound = true
				paragraphCount++
			}
		})
		log.Printf("Found %d meaningful paragraphs", paragraphCount)
	}

	finalContent := content.String()
	if len(finalContent) < 100 {
		// Log the HTML for debugging
		log.Printf("Raw HTML content: %s", htmlContent)
		return "", fmt.Errorf("no meaningful content found in dynamic page (content length: %d)", len(finalContent))
	}

	return finalContent, nil
}

// cleanText removes extra whitespace and normalizes text
func cleanText(text string) string {
	// Replace multiple spaces and newlines with single space
	text = strings.Join(strings.Fields(text), " ")
	return strings.TrimSpace(text)
}
