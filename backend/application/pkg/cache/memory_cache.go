package cache

import (
	"strings"
	"sync"
	"time"
)

type entry struct {
	value     interface{}
	expiresAt time.Time
}

type MemoryCache struct {
	store sync.Map
}

func New() *MemoryCache {
	c := &MemoryCache{}
	go c.janitor()
	return c
}

func (c *MemoryCache) Set(key string, value interface{}, ttl time.Duration) {
	c.store.Store(key, entry{value: value, expiresAt: time.Now().Add(ttl)})
}

func (c *MemoryCache) Get(key string) (interface{}, bool) {
	raw, ok := c.store.Load(key)
	if !ok {
		return nil, false
	}
	e := raw.(entry)
	if time.Now().After(e.expiresAt) {
		c.store.Delete(key)
		return nil, false
	}
	return e.value, true
}

func (c *MemoryCache) Delete(key string) {
	c.store.Delete(key)
}

func (c *MemoryCache) DeletePrefix(prefix string) {
	c.store.Range(func(k, _ interface{}) bool {
		if strings.HasPrefix(k.(string), prefix) {
			c.store.Delete(k)
		}
		return true
	})
}

func (c *MemoryCache) janitor() {
	ticker := time.NewTicker(time.Minute)
	defer ticker.Stop()
	for range ticker.C {
		c.store.Range(func(k, v interface{}) bool {
			if time.Now().After(v.(entry).expiresAt) {
				c.store.Delete(k)
			}
			return true
		})
	}
}
