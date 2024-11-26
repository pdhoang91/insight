package ttv

import (
	"fmt"
	"log"
	"os"

	htgotts "github.com/hegedustibor/htgo-tts"
	"github.com/hegedustibor/htgo-tts/handlers"
)

type ConvertRequest struct {
	Text     string `json:"text"`
	Language string `json:"language"`
}

type ConvertResponse struct {
	AudioURL string `json:"audio_url"`
}

func handleConvert(req ConvertRequest) string {

	// Kiểm tra trường Language
	if req.Language == "" {
		req.Language = "en" // Giá trị mặc định nếu không có ngôn ngữ được cung cấp
	}

	// Tạo thư mục nếu chưa tồn tại
	audioDir := "audio"
	if _, err := os.Stat(audioDir); os.IsNotExist(err) {
		log.Printf("Audio directory %s does not exist. Creating...\n", audioDir)
		err = os.Mkdir(audioDir, 0755)
		if err != nil {
			log.Printf("Failed to create audio directory: %v\n", err)
			return ""
		}
	}

	// Cập nhật task status và output_data
	audioPath := fmt.Sprintf("/static/mp3/output.mp3")
	// Chuyển đổi Text-to-Voice
	tts := htgotts.Speech{Folder: audioDir, Language: req.Language, Handler: &handlers.MPlayer{}}
	filePath, err := tts.CreateSpeechFile(req.Text, audioPath)
	if err != nil {
		log.Printf("TTS conversion failed: %v\n", err)
		return ""
	}
	log.Printf("TTS conversion succeeded. File path: %s\n", filePath)

	return audioPath
}
