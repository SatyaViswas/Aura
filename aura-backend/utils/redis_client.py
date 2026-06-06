"""
Redis client and connection pool management
"""
import redis.asyncio as redis
from redis.asyncio.connection import ConnectionPool
from typing import Optional
import logging
from config import config

logger = logging.getLogger(__name__)


class RedisClient:
    """Async Redis client with connection pooling"""
    
    def __init__(self):
        self.pool: Optional[ConnectionPool] = None
        self.client: Optional[redis.Redis] = None
        self._enabled = config.REDIS_ENABLED
        
    async def connect(self):
        if not self._enabled:
            logger.warning("Redis is disabled. Using in-memory state only.")
            return

        try:
            connection_params = {
                "max_connections": config.REDIS_MAX_CONNECTIONS,
                "socket_timeout": config.REDIS_SOCKET_TIMEOUT,
                "socket_connect_timeout": config.REDIS_SOCKET_CONNECT_TIMEOUT,
                "decode_responses": True,
            }

            self.pool = ConnectionPool.from_url(
                config.get_redis_url(),
                **connection_params
            )

            self.client = redis.Redis(connection_pool=self.pool)

            await self.client.ping()
            ssl_status = "SSL" if config.REDIS_SSL else "non-SSL"
            logger.info(f"✅ Redis connected ({ssl_status}): {config.REDIS_HOST}:{config.REDIS_PORT}")

        except Exception as e:
            logger.error(f"❌ Redis connection failed: {e}")
            # 🔴 Do NOT permanently disable Redis
            self.client = None
    
    async def disconnect(self):
        """Close Redis connection"""
        if self.client:
            await self.client.close()
            logger.info("Redis connection closed")
    
    def is_available(self) -> bool:
        """Check if Redis is available"""
        return self._enabled and self.client is not None
    
    async def get(self, key: str) -> Optional[str]:
        """Get value by key"""
        if not self.is_available():
            return None
        try:
            return await self.client.get(key)
        except Exception as e:
            logger.error(f"Redis GET error: {e}")
            return None
    
    async def set(self, key: str, value: str, ttl: Optional[int] = None) -> bool:
        """Set key-value with optional TTL"""
        if not self.is_available():
            return False
        try:
            if ttl:
                await self.client.setex(key, ttl, value)
            else:
                await self.client.set(key, value)
            return True
        except Exception as e:
            logger.error(f"Redis SET error: {e}")
            return False
    
    async def hset(self, key: str, mapping: dict) -> bool:
        """Set hash fields"""
        if not self.is_available():
            return False
        try:
            await self.client.hset(key, mapping=mapping)
            return True
        except Exception as e:
            logger.error(f"Redis HSET error: {e}")
            return False
    
    async def hgetall(self, key: str) -> dict:
        """Get all hash fields"""
        if not self.is_available():
            return {}
        try:
            return await self.client.hgetall(key)
        except Exception as e:
            logger.error(f"Redis HGETALL error: {e}")
            return {}
    
    async def hget(self, key: str, field: str) -> Optional[str]:
        """Get single hash field"""
        if not self.is_available():
            return None
        try:
            return await self.client.hget(key, field)
        except Exception as e:
            logger.error(f"Redis HGET error: {e}")
            return None
    
    async def incr(self, key: str) -> int:
        """Increment counter atomically"""
        if not self.is_available():
            return 0
        try:
            return await self.client.incr(key)
        except Exception as e:
            logger.error(f"Redis INCR error: {e}")
            return 0
    
    async def expire(self, key: str, ttl: int) -> bool:
        """Set expiration on key"""
        if not self.is_available():
            return False
        try:
            await self.client.expire(key, ttl)
            return True
        except Exception as e:
            logger.error(f"Redis EXPIRE error: {e}")
            return False
    
    async def delete(self, *keys: str) -> int:
        """Delete keys"""
        if not self.is_available():
            return 0
        try:
            return await self.client.delete(*keys)
        except Exception as e:
            logger.error(f"Redis DELETE error: {e}")
            return 0
    
    async def exists(self, *keys: str) -> int:
        """Check if keys exist"""
        if not self.is_available():
            return 0
        try:
            return await self.client.exists(*keys)
        except Exception as e:
            logger.error(f"Redis EXISTS error: {e}")
            return 0
    
    def pipeline(self):
        """Create pipeline for batch operations"""
        if not self.is_available():
            return None
        return self.client.pipeline()


# Global Redis client instance
redis_client = RedisClient()
