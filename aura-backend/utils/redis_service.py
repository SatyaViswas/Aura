"""
Redis service layer for exercise state management
"""
import json
from typing import Optional, Dict, Any, List
from datetime import datetime
import logging
from utils.redis_client import redis_client
from config import config

logger = logging.getLogger(__name__)


class ExerciseStateService:
    """Manage exercise state in Redis"""
    
    @staticmethod
    def _user_key(user_id: str, exercise: str) -> str:
        """Generate Redis key for user exercise state"""
        return f"user:{user_id}:exercise:{exercise}"
    
    @staticmethod
    def _history_key(user_id: str) -> str:
        """Generate Redis key for workout history"""
        return f"user:{user_id}:history"
    
    @staticmethod
    def _leaderboard_key(exercise: str) -> str:
        """Generate Redis key for leaderboard"""
        return f"leaderboard:{exercise}"
    
    async def save_state(
        self,
        user_id: str,
        exercise: str,
        counter: int,
        stage: str,
        angle: int,
        additional_data: Optional[Dict] = None
    ) -> bool:
        """
        Save user's exercise state to Redis
        
        Args:
            user_id: Unique user identifier
            exercise: Exercise type (biceps, squats, etc.)
            counter: Rep counter
            stage: Current stage (up, down, ready, etc.)
            angle: Current angle
            additional_data: Extra data to store
        
        Returns:
            bool: Success status
        """
        if not redis_client.is_available():
            return False
        
        try:
            key = self._user_key(user_id, exercise)
            
            state = {
                "counter": str(counter),
                "stage": stage,
                "angle": str(angle),
                "exercise": exercise,
                "updated_at": datetime.now().isoformat()
            }
            
            if additional_data:
                state.update({k: str(v) for k, v in additional_data.items()})
            
            # Save state as hash
            await redis_client.hset(key, mapping=state)
            
            # Set TTL
            await redis_client.expire(key, config.USER_STATE_TTL)
            
            return True
            
        except Exception as e:
            logger.error(f"Error saving state: {e}")
            return False
    
    async def load_state(
        self,
        user_id: str,
        exercise: str
    ) -> Optional[Dict[str, Any]]:
        """
        Load user's exercise state from Redis
        
        Returns:
            Dict with counter, stage, angle, etc. or None if not found
        """
        if not redis_client.is_available():
            return None
        
        try:
            key = self._user_key(user_id, exercise)
            state = await redis_client.hgetall(key)
            
            if not state:
                return None
            
            # Convert string values back to appropriate types
            return {
                "counter": int(state.get("counter", 0)),
                "stage": state.get("stage", "ready"),
                "angle": int(state.get("angle", 0)),
                "exercise": state.get("exercise", exercise),
                "updated_at": state.get("updated_at")
            }
            
        except Exception as e:
            logger.error(f"Error loading state: {e}")
            return None
    
    async def delete_state(self, user_id: str, exercise: str) -> bool:
        """Delete user's exercise state"""
        if not redis_client.is_available():
            return False
        
        try:
            key = self._user_key(user_id, exercise)
            await redis_client.delete(key)
            return True
        except Exception as e:
            logger.error(f"Error deleting state: {e}")
            return False
    
    async def save_workout(
        self,
        user_id: str,
        exercise: str,
        reps: int,
        duration: float,
        avg_angle: float
    ) -> bool:
        """
        Save completed workout to history
        
        Args:
            user_id: User identifier
            exercise: Exercise type
            reps: Number of reps completed
            duration: Workout duration in seconds
            avg_angle: Average angle during workout
        """
        if not redis_client.is_available() or not config.ENABLE_WORKOUT_HISTORY:
            return False
        
        try:
            key = self._history_key(user_id)
            
            workout = {
                "exercise": exercise,
                "reps": reps,
                "duration": duration,
                "avg_angle": avg_angle,
                "timestamp": datetime.now().isoformat()
            }
            
            # Add to list (most recent first)
            workout_json = json.dumps(workout)
            
            pipeline = redis_client.pipeline()
            if pipeline:
                # Add to beginning of list
                pipeline.lpush(key, workout_json)
                # Keep only last 100 workouts
                pipeline.ltrim(key, 0, 99)
                # Set TTL
                pipeline.expire(key, config.WORKOUT_HISTORY_TTL)
                await pipeline.execute()
            
            return True
            
        except Exception as e:
            logger.error(f"Error saving workout: {e}")
            return False
    
    async def get_workout_history(
        self,
        user_id: str,
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Get user's workout history
        
        Args:
            user_id: User identifier
            limit: Number of workouts to retrieve
        
        Returns:
            List of workout dictionaries
        """
        if not redis_client.is_available():
            return []
        
        try:
            key = self._history_key(user_id)
            
            # Get recent workouts
            workouts_json = await redis_client.client.lrange(key, 0, limit - 1)
            
            workouts = []
            for workout_json in workouts_json:
                try:
                    workout = json.loads(workout_json)
                    workouts.append(workout)
                except json.JSONDecodeError:
                    continue
            
            return workouts
            
        except Exception as e:
            logger.error(f"Error getting workout history: {e}")
            return []
    
    async def update_leaderboard(
        self,
        user_id: str,
        exercise: str,
        reps: int
    ) -> bool:
        """
        Update leaderboard with user's reps
        Uses sorted set for automatic ranking
        
        Args:
            user_id: User identifier
            exercise: Exercise type
            reps: Total reps completed
        """
        if not redis_client.is_available() or not config.ENABLE_LEADERBOARDS:
            return False
        
        try:
            key = self._leaderboard_key(exercise)
            
            # Add/update score in sorted set
            await redis_client.client.zadd(
                key,
                {user_id: reps},
                gt=True  # Only update if new score is greater
            )
            
            return True
            
        except Exception as e:
            logger.error(f"Error updating leaderboard: {e}")
            return False
    
    async def get_leaderboard(
        self,
        exercise: str,
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Get top users for exercise
        
        Args:
            exercise: Exercise type
            limit: Number of top users to retrieve
        
        Returns:
            List of {user_id, reps, rank} dictionaries
        """
        if not redis_client.is_available():
            return []
        
        try:
            key = self._leaderboard_key(exercise)
            
            # Get top users with scores (reversed for highest first)
            top_users = await redis_client.client.zrevrange(
                key,
                0,
                limit - 1,
                withscores=True
            )
            
            leaderboard = []
            for rank, (user_id, reps) in enumerate(top_users, start=1):
                leaderboard.append({
                    "rank": rank,
                    "user_id": user_id,
                    "reps": int(reps)
                })
            
            return leaderboard
            
        except Exception as e:
            logger.error(f"Error getting leaderboard: {e}")
            return []
    
    async def get_user_rank(
        self,
        user_id: str,
        exercise: str
    ) -> Optional[Dict[str, Any]]:
        """
        Get user's rank and score on leaderboard
        
        Returns:
            Dict with rank, reps, and total_users or None
        """
        if not redis_client.is_available():
            return None
        
        try:
            key = self._leaderboard_key(exercise)
            
            # Get user's rank (0-based, so add 1)
            rank = await redis_client.client.zrevrank(key, user_id)
            
            if rank is None:
                return None
            
            # Get user's score
            reps = await redis_client.client.zscore(key, user_id)
            
            # Get total users on leaderboard
            total = await redis_client.client.zcard(key)
            
            return {
                "rank": rank + 1,
                "reps": int(reps) if reps else 0,
                "total_users": total
            }
            
        except Exception as e:
            logger.error(f"Error getting user rank: {e}")
            return None


# Global service instance
exercise_state_service = ExerciseStateService()
