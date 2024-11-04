package controllers

import (
	"crypto/rand"
	"encoding/hex"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/gin-gonic/gin"
)

// UploadImage .. Image upload handler
func UploadImage(c *gin.Context) {
	// Maximum upload size
	const maxUploadSize = 10 << 20 // 10 MB
	c.Request.ParseMultipartForm(maxUploadSize)

	// Get the file from the form data
	file, err := c.FormFile("image")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No image uploaded"})
		return
	}

	// Create the uploads directory if it doesn't exist
	if err := os.MkdirAll("uploads", os.ModePerm); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not create uploads directory"})
		return
	}

	// Generate a unique prefix for the filename
	b := make([]byte, 4) // Equals 8 characters
	rand.Read(b)
	prefix := hex.EncodeToString(b)

	// Replace spaces with underscores
	safeFilename := strings.ReplaceAll(file.Filename, " ", "_")

	// Define the file path
	filePath := filepath.Join("uploads", prefix+"_"+safeFilename)

	// Save the file to the uploads directory
	if err := c.SaveUploadedFile(file, filePath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not save image"})
		return
	}

	// Construct the URL for the uploaded image
	imageURL := c.Request.Host + "/uploads/" + prefix + "_" + safeFilename

	// Return the image URL as response
	c.JSON(http.StatusOK, gin.H{"url": "http://" + imageURL})
}
