// package middleware

// import (
// 	"bytes"
// 	"io/ioutil"
// 	"log"
// 	"time"

// 	"github.com/gin-gonic/gin"
// )

// // CustomResponseWriter là một ResponseWriter tùy chỉnh để bắt dữ liệu response
// type CustomResponseWriter struct {
// 	gin.ResponseWriter
// 	body *bytes.Buffer
// }

// // Write ghi dữ liệu vào buffer trước khi gửi đi
// func (w CustomResponseWriter) Write(b []byte) (int, error) {
// 	w.body.Write(b)
// 	return w.ResponseWriter.Write(b)
// }

// // LoggerMiddleware là middleware ghi log request và response
// func LoggerMiddleware() gin.HandlerFunc {
// 	return func(c *gin.Context) {
// 		// Bắt đầu thời gian xử lý
// 		startTime := time.Now()

// 		// --- Ghi log Request ---

// 		// Lấy thông tin Request
// 		method := c.Request.Method
// 		url := c.Request.URL.String()
// 		headers := c.Request.Header

// 		// Đọc và lưu trữ Request Body
// 		var requestBody []byte
// 		if c.Request.Body != nil {
// 			requestBody, _ = ioutil.ReadAll(c.Request.Body)
// 		}

// 		// Đặt lại Body để các handler tiếp theo có thể đọc
// 		c.Request.Body = ioutil.NopCloser(bytes.NewBuffer(requestBody))

// 		// --- Ghi log Response ---

// 		// Tạo CustomResponseWriter để bắt dữ liệu response
// 		customWriter := &CustomResponseWriter{body: bytes.NewBufferString(""), ResponseWriter: c.Writer}
// 		c.Writer = customWriter

// 		// Tiếp tục xử lý request
// 		c.Next()

// 		// Tính thời gian xử lý
// 		duration := time.Since(startTime)

// 		// Lấy thông tin Response
// 		statusCode := c.Writer.Status()
// 		responseBody := customWriter.body.String()

// 		// Ghi log
// 		log.Printf("----- Request -----\n")
// 		log.Printf("Method: %s\n", method)
// 		log.Printf("URL: %s\n", url)
// 		log.Printf("Headers: %v\n", headers)
// 		log.Printf("Body: %s\n", string(requestBody))
// 		log.Printf("----- Response -----\n")
// 		log.Printf("Status: %d\n", statusCode)
// 		log.Printf("Body: %s\n", responseBody)
// 		log.Printf("Duration: %v\n", duration)
// 		log.Printf("-------------------\n")
// 	}
// }

package middleware

import (
	"bytes"
	"io/ioutil"
	"log"
	"os"
	"time"

	"github.com/gin-gonic/gin"
)

// LogLevel định nghĩa mức độ log
type LogLevel int

const (
	DEBUG LogLevel = iota
	INFO
	WARN
	ERROR
)

// CurrentLogLevel là mức log hiện tại, có thể được thiết lập qua biến môi trường
var CurrentLogLevel = parseLogLevel(os.Getenv("LOG_LEVEL"))

// parseLogLevel chuyển đổi chuỗi mức log thành enum LogLevel
func parseLogLevel(level string) LogLevel {
	switch level {
	case "DEBUG":
		return DEBUG
	case "INFO":
		return INFO
	case "WARN":
		return WARN
	case "ERROR":
		return ERROR
	default:
		return INFO // Mặc định là INFO
	}
}

// logIf kiểm tra log level trước khi ghi log
func logIf(level LogLevel, format string, args ...interface{}) {
	if level >= CurrentLogLevel {
		log.Printf(format, args...)
	}
}

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

func LoggerMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Bắt đầu thời gian xử lý
		startTime := time.Now()

		// --- Ghi log Request ---
		method := c.Request.Method
		url := c.Request.URL.String()
		headers := c.Request.Header

		var requestBody []byte
		if c.Request.Body != nil {
			requestBody, _ = ioutil.ReadAll(c.Request.Body)
		}
		c.Request.Body = ioutil.NopCloser(bytes.NewBuffer(requestBody))

		// --- Ghi log Response ---
		customWriter := &CustomResponseWriter{body: bytes.NewBufferString(""), ResponseWriter: c.Writer}
		c.Writer = customWriter

		c.Next()

		duration := time.Since(startTime)
		statusCode := c.Writer.Status()
		responseBody := customWriter.body.String()

		// Ghi log chi tiết theo mức log
		logIf(DEBUG, "----- Request -----\n")
		logIf(DEBUG, "Method: %s\n", method)
		logIf(DEBUG, "URL: %s\n", url)
		logIf(DEBUG, "Headers: %v\n", headers)
		logIf(DEBUG, "Body: %s\n", string(requestBody))
		logIf(DEBUG, "----- Response -----\n")
		logIf(DEBUG, "Status: %d\n", statusCode)
		logIf(DEBUG, "Body: %s\n", responseBody)
		logIf(INFO, "Duration: %v\n", duration)
		logIf(DEBUG, "-------------------\n")
	}
}

// // LoggerMiddleware là middleware ghi log request và response
// func LoggerMiddleware() gin.HandlerFunc {
// 	return func(c *gin.Context) {
// 		// Bắt đầu thời gian xử lý
// 		startTime := time.Now()

// 		// --- Ghi log Request ---

// 		// Lấy thông tin Request
// 		method := c.Request.Method
// 		url := c.Request.URL.String()
// 		headers := c.Request.Header

// 		// Đọc và lưu trữ Request Body
// 		var requestBody []byte
// 		if c.Request.Body != nil {
// 			requestBody, _ = ioutil.ReadAll(c.Request.Body)
// 		}

// 		// Đặt lại Body để các handler tiếp theo có thể đọc
// 		c.Request.Body = ioutil.NopCloser(bytes.NewBuffer(requestBody))

// 		// --- Ghi log Response ---

// 		// Tạo CustomResponseWriter để bắt dữ liệu response
// 		customWriter := &CustomResponseWriter{body: bytes.NewBufferString(""), ResponseWriter: c.Writer}
// 		c.Writer = customWriter

// 		// Tiếp tục xử lý request
// 		c.Next()

// 		// Tính thời gian xử lý
// 		duration := time.Since(startTime)

// 		// Lấy thông tin Response
// 		statusCode := c.Writer.Status()
// 		responseBody := customWriter.body.String()

// 		// Ghi log
// 		log.Printf("----- Request -----\n")
// 		log.Printf("Method: %s\n", method)
// 		log.Printf("URL: %s\n", url)
// 		log.Printf("Headers: %v\n", headers)
// 		log.Printf("Body: %s\n", string(requestBody))
// 		log.Printf("----- Response -----\n")
// 		log.Printf("Status: %d\n", statusCode)
// 		log.Printf("Body: %s\n", responseBody)
// 		log.Printf("Duration: %v\n", duration)
// 		log.Printf("-------------------\n")
// 	}
// }
