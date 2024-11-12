package middleware

import (
	"bytes"
	"io/ioutil"
	"log"
	"time"

	"github.com/gin-gonic/gin"
)

// CustomResponseWriter là một ResponseWriter tùy chỉnh để bắt dữ liệu response
type CustomResponseWriter struct {
	gin.ResponseWriter
	body *bytes.Buffer
}

// Write ghi dữ liệu vào buffer trước khi gửi đi
func (w CustomResponseWriter) Write(b []byte) (int, error) {
	w.body.Write(b)
	return w.ResponseWriter.Write(b)
}

// LoggerMiddleware là middleware ghi log request và response
func LoggerMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Bắt đầu thời gian xử lý
		startTime := time.Now()

		// --- Ghi log Request ---

		// Lấy thông tin Request
		method := c.Request.Method
		url := c.Request.URL.String()
		headers := c.Request.Header

		// Đọc và lưu trữ Request Body
		var requestBody []byte
		if c.Request.Body != nil {
			requestBody, _ = ioutil.ReadAll(c.Request.Body)
		}

		// Đặt lại Body để các handler tiếp theo có thể đọc
		c.Request.Body = ioutil.NopCloser(bytes.NewBuffer(requestBody))

		// --- Ghi log Response ---

		// Tạo CustomResponseWriter để bắt dữ liệu response
		customWriter := &CustomResponseWriter{body: bytes.NewBufferString(""), ResponseWriter: c.Writer}
		c.Writer = customWriter

		// Tiếp tục xử lý request
		c.Next()

		// Tính thời gian xử lý
		duration := time.Since(startTime)

		// Lấy thông tin Response
		statusCode := c.Writer.Status()
		responseBody := customWriter.body.String()

		// Ghi log
		log.Printf("----- Request -----\n")
		log.Printf("Method: %s\n", method)
		log.Printf("URL: %s\n", url)
		log.Printf("Headers: %v\n", headers)
		log.Printf("Body: %s\n", string(requestBody))
		log.Printf("----- Response -----\n")
		log.Printf("Status: %d\n", statusCode)
		log.Printf("Body: %s\n", responseBody)
		log.Printf("Duration: %v\n", duration)
		log.Printf("-------------------\n")
	}
}
