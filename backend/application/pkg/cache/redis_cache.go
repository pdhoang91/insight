package cache

import (
	"bytes"
	"context"
	"encoding/gob"
	"strings"
	"time"

	"github.com/redis/go-redis/v9"
)

// RedisCache is a Redis-backed cache implementation.
// Values are serialized with encoding/gob — all concrete types stored in the
// cache must be registered with gob.Register before use (see RegisterGobTypes).
type RedisCache struct {
	client *redis.Client
	prefix string
}

// NewRedisCache creates a new Redis cache.
// addr is in host:port format (e.g. "redis:6379").
func NewRedisCache(addr, prefix string) *RedisCache {
	client := redis.NewClient(&redis.Options{
		Addr: addr,
		DB:   0,
	})
	return &RedisCache{client: client, prefix: prefix}
}

func (r *RedisCache) key(k string) string {
	if r.prefix == "" {
		return k
	}
	return r.prefix + ":" + k
}

func (r *RedisCache) Set(key string, value any, ttl time.Duration) {
	var buf bytes.Buffer
	if err := gob.NewEncoder(&buf).Encode(&value); err != nil {
		return
	}
	_ = r.client.Set(context.Background(), r.key(key), buf.Bytes(), ttl).Err()
}

func (r *RedisCache) Get(key string) (any, bool) {
	data, err := r.client.Get(context.Background(), r.key(key)).Bytes()
	if err != nil {
		return nil, false
	}
	var value any
	if err := gob.NewDecoder(bytes.NewReader(data)).Decode(&value); err != nil {
		return nil, false
	}
	return value, true
}

func (r *RedisCache) Delete(key string) {
	_ = r.client.Del(context.Background(), r.key(key)).Err()
}

func (r *RedisCache) DeletePrefix(prefix string) {
	iter := r.client.Scan(context.Background(), 0, r.key(prefix)+"*", 0).Iterator()
	var keys []string
	for iter.Next(context.Background()) {
		keys = append(keys, iter.Val())
	}
	if len(keys) > 0 {
		_ = r.client.Del(context.Background(), keys...).Err()
	}
	// Also handle keys without the cache prefix for prefix-only matches
	iter2 := r.client.Scan(context.Background(), 0, prefix+"*", 0).Iterator()
	var keys2 []string
	for iter2.Next(context.Background()) {
		if strings.HasPrefix(iter2.Val(), prefix) {
			keys2 = append(keys2, iter2.Val())
		}
	}
	if len(keys2) > 0 {
		_ = r.client.Del(context.Background(), keys2...).Err()
	}
}

// Ping checks Redis connectivity.
func (r *RedisCache) Ping() error {
	return r.client.Ping(context.Background()).Err()
}
