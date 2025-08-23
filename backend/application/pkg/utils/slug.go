package utils

import (
	"crypto/rand"
	"encoding/hex"
	"regexp"
	"strings"
)

// removeDiacritics removes Vietnamese diacritics from text
func removeDiacritics(input string) string {
	var output []rune
	for _, r := range input {
		switch r {
		case 'à', 'á', 'ả', 'ã', 'ạ', 'â', 'ầ', 'ấ', 'ẩ', 'ẫ', 'ậ', 'ă', 'ằ', 'ắ', 'ẳ', 'ẵ', 'ặ':
			r = 'a'
		case 'è', 'é', 'ẻ', 'ẽ', 'ẹ', 'ê', 'ề', 'ế', 'ể', 'ễ', 'ệ':
			r = 'e'
		case 'ì', 'í', 'ỉ', 'ĩ', 'ị':
			r = 'i'
		case 'ò', 'ó', 'ỏ', 'õ', 'ọ', 'ô', 'ồ', 'ố', 'ổ', 'ỗ', 'ộ', 'ơ', 'ờ', 'ớ', 'ở', 'ỡ', 'ợ':
			r = 'o'
		case 'ù', 'ú', 'ủ', 'ũ', 'ụ', 'ư', 'ừ', 'ứ', 'ử', 'ữ', 'ự':
			r = 'u'
		case 'ỳ', 'ý', 'ỷ', 'ỹ', 'ỵ':
			r = 'y'
		case 'đ':
			r = 'd'
		case 'À', 'Á', 'Ả', 'Ã', 'Ạ', 'Â', 'Ầ', 'Ấ', 'Ẩ', 'Ẫ', 'Ậ', 'Ă', 'Ằ', 'Ắ', 'Ẳ', 'Ẵ', 'Ặ':
			r = 'A'
		case 'È', 'É', 'Ẻ', 'Ẽ', 'Ẹ', 'Ê', 'Ề', 'Ế', 'Ể', 'Ễ', 'Ệ':
			r = 'E'
		case 'Ì', 'Í', 'Ỉ', 'Ĩ', 'Ị':
			r = 'I'
		case 'Ò', 'Ó', 'Ỏ', 'Õ', 'Ọ', 'Ô', 'Ồ', 'Ố', 'Ổ', 'Ỗ', 'Ộ', 'Ơ', 'Ờ', 'Ớ', 'Ở', 'Ỡ', 'Ợ':
			r = 'O'
		case 'Ù', 'Ú', 'Ủ', 'Ũ', 'Ụ', 'Ư', 'Ừ', 'Ứ', 'Ử', 'Ữ', 'Ự':
			r = 'U'
		case 'Ỳ', 'Ý', 'Ỷ', 'Ỹ', 'Ỵ':
			r = 'Y'
		case 'Đ':
			r = 'D'
		}
		output = append(output, r)
	}
	return string(output)
}

// CreateSlug creates a URL-friendly slug from title
func CreateSlug(title string) string {
	// Remove diacritics
	title = removeDiacritics(title)
	// Convert to lowercase and replace spaces with hyphens
	slug := strings.ToLower(title)
	slug = strings.ReplaceAll(slug, " ", "-")

	// Remove special characters, keep only alphanumeric and hyphens
	re := regexp.MustCompile(`[^a-z0-9\-]`)
	slug = re.ReplaceAllString(slug, "")

	// Remove multiple consecutive hyphens
	re = regexp.MustCompile(`-+`)
	slug = re.ReplaceAllString(slug, "-")

	// Trim hyphens from start and end
	slug = strings.Trim(slug, "-")

	return slug
}

// GetUniquePrefix generates a unique prefix for ensuring uniqueness
func GetUniquePrefix() string {
	b := make([]byte, 4)
	rand.Read(b)
	return hex.EncodeToString(b)
}

// CleanHTMLTags removes HTML tags from content
func CleanHTMLTags(content string) string {
	re := regexp.MustCompile(`<[^>]*>`)
	return re.ReplaceAllString(content, "")
}

// ExtractPreviewContent extracts first N words for preview
func ExtractPreviewContent(content string, wordLimit int) string {
	cleanContent := CleanHTMLTags(content)
	words := strings.Fields(cleanContent)

	if len(words) > wordLimit {
		return strings.Join(words[:wordLimit], " ") + "..."
	}

	return cleanContent
}
