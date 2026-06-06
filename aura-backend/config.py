"""
Configuration management for Araise Backend
"""
import os
from typing import Optional
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


class Config:
    """Application configuration"""
    
    # Redis Configuration
    REDIS_HOST: str = os.getenv("REDIS_HOST", "localhost")
    REDIS_PORT: int = int(os.getenv("REDIS_PORT", "6379"))
    REDIS_DB: int = int(os.getenv("REDIS_DB", "0"))
    REDIS_USERNAME: Optional[str] = os.getenv("REDIS_USERNAME", None)
    REDIS_PASSWORD: Optional[str] = os.getenv("REDIS_PASSWORD", None)
    REDIS_SSL: bool = os.getenv("REDIS_SSL", "false").lower() == "true"
    REDIS_ENABLED: bool = os.getenv("REDIS_ENABLED", "true").lower() == "true"
    
    # Redis TTL (Time To Live) - Auto-expire data
    USER_STATE_TTL: int = 3600  # 1 hour - user exercise state
    WORKOUT_HISTORY_TTL: int = 86400 * 30  # 30 days - workout history
    SESSION_TTL: int = 1800  # 30 minutes - session data
    
    # Performance Settings
    REDIS_MAX_CONNECTIONS: int = int(os.getenv("REDIS_MAX_CONNECTIONS", "50"))
    REDIS_SOCKET_TIMEOUT: int = 5
    REDIS_SOCKET_CONNECT_TIMEOUT: int = 5
    
    # Feature Flags
    ENABLE_LEADERBOARDS: bool = True
    ENABLE_WORKOUT_HISTORY: bool = True
    ENABLE_ANALYTICS: bool = True
    
    # Server Settings
    SERVER_HOST: str = os.getenv("SERVER_HOST", "0.0.0.0")
    SERVER_PORT: int = int(os.getenv("SERVER_PORT", "8000"))
    
    @classmethod
    def get_redis_url(cls) -> str:
        """
        Redis Cloud–compatible URL (no database number needed)
        """
        scheme = "rediss" if cls.REDIS_SSL else "redis"

        if not cls.REDIS_PASSWORD:
            raise RuntimeError("REDIS_PASSWORD must be set")

        return (
            f"{scheme}://"
            f"{cls.REDIS_USERNAME}:{cls.REDIS_PASSWORD}"
            f"@{cls.REDIS_HOST}:{cls.REDIS_PORT}"
        )


# Global config instance
config = Config()
