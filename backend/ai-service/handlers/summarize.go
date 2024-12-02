package handlers

import (
	"bytes"
	"encoding/json"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/pdhoang91/ai-service/models"
)

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions"

func Summarize(c *gin.Context) {
	var reqBody models.SummarizeRequest
	if err := c.ShouldBindJSON(&reqBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	if reqBody.Content == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Content is required"})
		return
	}

	fullPrompt := reqBody.Prompt + "\n\nNội dung:\n" + reqBody.Content

	openAIReq := models.OpenAIRequest{
		Model: reqBody.Model,
		Messages: []models.OpenAIMessage{
			{
				Role:    "user",
				Content: fullPrompt,
			},
		},
		Temperature: 0.7,
	}

	jsonData, err := json.Marshal(openAIReq)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create OpenAI request"})
		return
	}

	client := &http.Client{}
	httpReq, err := http.NewRequest("POST", OPENAI_API_URL, bytes.NewBuffer(jsonData))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create HTTP request"})
		return
	}

	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("Authorization", "Bearer "+os.Getenv("OPENAI_API_KEY"))

	resp, err := client.Do(httpReq)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to send request to OpenAI"})
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "OpenAI API error"})
		return
	}

	var openAIResp models.OpenAIResponse
	if err := json.NewDecoder(resp.Body).Decode(&openAIResp); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse OpenAI response"})
		return
	}

	if len(openAIResp.Choices) == 0 {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "OpenAI API returned no summary"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"summary": openAIResp.Choices[0].Message.Content})
}

func respondWithSummarizeError(w http.ResponseWriter, message string, err error) {
	response := models.SummarizeResponse{
		Error: message + ": " + err.Error(),
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusInternalServerError)
	json.NewEncoder(w).Encode(response)
}
