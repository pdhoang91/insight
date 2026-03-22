package cache

import "time"

// Cache is the unified cache interface used across the application.
type Cache interface {
	Set(key string, value any, ttl time.Duration)
	Get(key string) (any, bool)
	Delete(key string)
	DeletePrefix(prefix string)
}
