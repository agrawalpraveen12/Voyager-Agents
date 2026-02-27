"""Redis client for state management."""
import json
from typing import Dict, Any, Optional
import redis
from app.config import get_settings

settings = get_settings()


class RedisClient:
    """Redis client for managing trip states and confirmations."""
    
    def __init__(self):
        """Initialize Redis connection with in-memory fallback."""
        self.memory = {}  # Fallback storage
        try:
            self.redis = redis.from_url(
                settings.redis_url,
                decode_responses=True,
                socket_connect_timeout=1
            )
            # Test connection
            self.redis.ping()
            self.use_redis = True
        except Exception as e:
            print(f"⚠️ Redis not available, using in-memory storage: {e}")
            self.use_redis = False

    
    async def get_trip_state(self, trip_id: str) -> Optional[Dict[str, Any]]:
        """
        Retrieve trip data from Redis.
        
        Args:
            trip_id: Trip identifier
            
        Returns:
            Trip data dict or None if not found
        """
        try:
            if self.use_redis:
                data = self.redis.get(f"trip:{trip_id}")
                if data:
                    return json.loads(data)
            else:
                return self.memory.get(f"trip:{trip_id}")
            return None
        except Exception as e:
            print(f"Redis get error: {e}")
            return self.memory.get(f"trip:{trip_id}")
    
    async def set_trip_state(
        self,
        trip_id: str,
        data: Dict[str, Any],
        ttl: Optional[int] = None
    ) -> bool:
        """
        Store trip data in Redis.
        
        Args:
            trip_id: Trip identifier
            data: Trip data to store
            ttl: Time to live in seconds (default from settings)
            
        Returns:
            True if successful
        """
        try:
            if self.use_redis:
                ttl = ttl or settings.redis_ttl
                self.redis.setex(
                    f"trip:{trip_id}",
                    ttl,
                    json.dumps(data)
                )
            # Always update local memory as backup or primary
            self.memory[f"trip:{trip_id}"] = data
            return True
        except Exception as e:
            print(f"Redis set error: {e}")
            self.memory[f"trip:{trip_id}"] = data
            return True  # Return True since it's saved in memory
    
    async def get_confirmation(self, trip_id: str) -> Optional[Dict[str, Any]]:
        """
        Get confirmation status for a trip.
        
        Args:
            trip_id: Trip identifier
            
        Returns:
            Confirmation data or None
        """
        try:
            if self.use_redis:
                data = self.redis.get(f"confirmation:{trip_id}")
                if data:
                    return json.loads(data)
            return self.memory.get(f"confirmation:{trip_id}")
        except Exception:
            return self.memory.get(f"confirmation:{trip_id}")
    
    async def set_confirmation(
        self,
        trip_id: str,
        action: str,
        method: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> bool:
        """
        Store confirmation action.
        
        Args:
            trip_id: Trip identifier
            action: CONFIRM/CANCEL/MODIFY
            method: email/sms/phone
            metadata: Additional data
            
        Returns:
            True if successful
        """
        try:
            confirmation_data = {
                "action": action,
                "method": method,
                "metadata": metadata or {}
            }
            if self.use_redis:
                self.redis.setex(
                    f"confirmation:{trip_id}",
                    300,  # 5 minutes TTL
                    json.dumps(confirmation_data)
                )
            self.memory[f"confirmation:{trip_id}"] = confirmation_data
            return True
        except Exception as e:
            print(f"Redis confirmation error: {e}")
            self.memory[f"confirmation:{trip_id}"] = confirmation_data
            return True
    
    async def map_phone_to_trip(self, phone: str, trip_id: str) -> bool:
        """
        Map phone number to trip ID for webhook lookups.
        
        Args:
            phone: Phone number
            trip_id: Trip identifier
            
        Returns:
            True if successful
        """
        try:
            self.redis.setex(
                f"phone:{phone}",
                3600,  # 1 hour
                trip_id
            )
            return True
        except Exception:
            return False
    
    async def get_trip_by_phone(self, phone: str) -> Optional[str]:
        """
        Get trip ID associated with phone number.
        
        Args:
            phone: Phone number
            
        Returns:
            Trip ID or None
        """
        try:
            if self.use_redis:
                return self.redis.get(f"phone:{phone}")
            return self.memory.get(f"phone:{phone}")
        except Exception:
            return self.memory.get(f"phone:{phone}")
    
    async def delete_trip(self, trip_id: str) -> bool:
        """
        Delete trip data from Redis.
        
        Args:
            trip_id: Trip identifier
            
        Returns:
            True if successful
        """
        try:
            self.redis.delete(f"trip:{trip_id}")
            self.redis.delete(f"confirmation:{trip_id}")
            return True
        except Exception:
            return False


# Global instance
_redis_client = None


def get_redis_client() -> RedisClient:
    """Get or create Redis client instance."""
    global _redis_client
    if _redis_client is None:
        _redis_client = RedisClient()
    return _redis_client
