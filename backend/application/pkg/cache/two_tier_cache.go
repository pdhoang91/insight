package cache

import "time"

// TwoTierCache is an L1 (memory) + L2 (Redis) cache.
// L1 is checked first for ultra-low latency; L2 is checked on miss
// and the result is promoted to L1 automatically.
type TwoTierCache struct {
	l1 *MemoryCache
	l2 *RedisCache
}

// NewTwoTierCache creates a two-tier cache backed by the provided L2 Redis cache.
func NewTwoTierCache(l1 *MemoryCache, l2 *RedisCache) *TwoTierCache {
	return &TwoTierCache{l1: l1, l2: l2}
}

func (t *TwoTierCache) Set(key string, value any, ttl time.Duration) {
	t.l1.Set(key, value, ttl)
	t.l2.Set(key, value, ttl)
}

func (t *TwoTierCache) Get(key string) (any, bool) {
	if v, ok := t.l1.Get(key); ok {
		return v, true
	}
	v, ok := t.l2.Get(key)
	if ok {
		// Promote to L1 with a short TTL to avoid stale data accumulation
		t.l1.Set(key, v, 30*time.Second)
	}
	return v, ok
}

func (t *TwoTierCache) Delete(key string) {
	t.l1.Delete(key)
	t.l2.Delete(key)
}

func (t *TwoTierCache) DeletePrefix(prefix string) {
	t.l1.DeletePrefix(prefix)
	t.l2.DeletePrefix(prefix)
}
