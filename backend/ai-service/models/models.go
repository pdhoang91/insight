package models

type ArticleRequest struct {
	URL string `json:"url"`
}

type SummarizeRequest struct {
	Content string `json:"content"`
	Model   string `json:"model"`
	Prompt  string `json:"prompt"`
}

type ArticleResponse struct {
	Content string `json:"content"`
	Error   string `json:"error,omitempty"`
}

type SummarizeResponse struct {
	Summary string `json:"summary"`
	Error   string `json:"error,omitempty"`
}

type OpenAIRequest struct {
	Model       string          `json:"model"`
	Messages    []OpenAIMessage `json:"messages"`
	Temperature float64         `json:"temperature"`
}

type OpenAIMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type OpenAIResponse struct {
	Choices []struct {
		Message struct {
			Content string `json:"content"`
		} `json:"message"`
	} `json:"choices"`
	Error *struct {
		Message string `json:"message"`
	} `json:"error,omitempty"`
}
