package config

import (
	"os"
	"strconv"
)

func GetString(key string, defaultValue string) string {
	result := os.Getenv(key)
	if len(result) > 0 {
		return result
	}
	return defaultValue
}

func GetInt64(key string, defaultValue int64) int64 {
	v := os.Getenv(key)
	if result, err := strconv.ParseInt(v, 10, 64); err == nil {
		return result
	}
	return defaultValue
}

func GetInt(key string, defaultValue int) int {
	v := os.Getenv(key)
	if result, err := strconv.Atoi(v); err == nil {
		return result
	}
	return defaultValue
}
