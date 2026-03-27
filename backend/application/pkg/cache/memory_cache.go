package cache

import (
	"container/list"
	"strings"
	"sync"
	"time"
)

const defaultMaxSize = 500

type entry struct {
	key       string
	value     any
	expiresAt time.Time
}

type MemoryCache struct {
	mu      sync.Mutex
	store   map[string]*list.Element
	lru     *list.List
	maxSize int
}

func New() *MemoryCache {
	c := &MemoryCache{
		store:   make(map[string]*list.Element),
		lru:     list.New(),
		maxSize: defaultMaxSize,
	}
	go c.janitor()
	return c
}

func (c *MemoryCache) Set(key string, value any, ttl time.Duration) {
	c.mu.Lock()
	defer c.mu.Unlock()

	e := entry{key: key, value: value, expiresAt: time.Now().Add(ttl)}

	if el, ok := c.store[key]; ok {
		c.lru.MoveToFront(el)
		el.Value = e
		return
	}

	if c.lru.Len() >= c.maxSize {
		c.evict()
	}

	el := c.lru.PushFront(e)
	c.store[key] = el
}

func (c *MemoryCache) Get(key string) (any, bool) {
	c.mu.Lock()
	defer c.mu.Unlock()

	el, ok := c.store[key]
	if !ok {
		return nil, false
	}

	e := el.Value.(entry)
	if time.Now().After(e.expiresAt) {
		c.remove(el)
		return nil, false
	}

	c.lru.MoveToFront(el)
	return e.value, true
}

func (c *MemoryCache) Delete(key string) {
	c.mu.Lock()
	defer c.mu.Unlock()
	if el, ok := c.store[key]; ok {
		c.remove(el)
	}
}

func (c *MemoryCache) DeletePrefix(prefix string) {
	c.mu.Lock()
	defer c.mu.Unlock()
	for key, el := range c.store {
		if strings.HasPrefix(key, prefix) {
			c.remove(el)
		}
	}
}

func (c *MemoryCache) remove(el *list.Element) {
	c.lru.Remove(el)
	delete(c.store, el.Value.(entry).key)
}

// evict removes expired entries first; if still at capacity, removes the LRU entry.
func (c *MemoryCache) evict() {
	now := time.Now()
	var expired []*list.Element
	for el := c.lru.Back(); el != nil; el = el.Prev() {
		if now.After(el.Value.(entry).expiresAt) {
			expired = append(expired, el)
		}
	}
	for _, el := range expired {
		c.remove(el)
	}
	if c.lru.Len() >= c.maxSize {
		if el := c.lru.Back(); el != nil {
			c.remove(el)
		}
	}
}

func (c *MemoryCache) janitor() {
	ticker := time.NewTicker(time.Minute)
	defer ticker.Stop()
	for range ticker.C {
		c.mu.Lock()
		now := time.Now()
		var expired []*list.Element
		for el := c.lru.Back(); el != nil; el = el.Prev() {
			if now.After(el.Value.(entry).expiresAt) {
				expired = append(expired, el)
			}
		}
		for _, el := range expired {
			c.remove(el)
		}
		c.mu.Unlock()
	}
}
