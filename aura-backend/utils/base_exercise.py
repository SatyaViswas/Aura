"""Base class for all exercise trackers"""
from utils.coordinate_utils import CoordinateProcessor
from typing import Optional


class BaseExercise:
    """Base class with common functionality for all exercises"""
    
    def __init__(self, user_id: Optional[str] = None):
        self.user_id = user_id
        self.counter = 0
        self.stage = None
        self.angle_buffer = []
        self.min_angle_threshold = 0
        self.max_angle_threshold = 180
        self.use_redis = False  # Set by subclasses if Redis state loaded
    
    def smooth_angle(self, angle, buffer_size=5):
        """
        Smooth angle measurements using a rolling average
        
        Args:
            angle: Raw angle measurement
            buffer_size: Number of samples to average over
            
        Returns:
            float: Smoothed angle
        """
        self.angle_buffer.append(angle)
        if len(self.angle_buffer) > buffer_size:
            self.angle_buffer.pop(0)
        return sum(self.angle_buffer) / len(self.angle_buffer)
    
    def smooth_angle_with_buffer(self, angle, buffer, buffer_size=5):
        """
        Smooth angle measurements using a specific buffer (for multi-limb exercises)
        
        Args:
            angle: Raw angle measurement
            buffer: Specific buffer list to use
            buffer_size: Number of samples to average over
            
        Returns:
            float: Smoothed angle
        """
        buffer.append(angle)
        if len(buffer) > buffer_size:
            buffer.pop(0)
        return sum(buffer) / len(buffer)
    
    def validate_coordinates(self, coordinates, required_points):
        """
        Validate required coordinate points
        
        Args:
            coordinates: Dictionary of coordinate points
            required_points: List of required point names
            
        Returns:
            bool: True if valid, False otherwise
        """
        return CoordinateProcessor.validate_coordinates(coordinates, required_points)
    
    def calculate_angle(self, a, b, c):
        """
        Calculate angle between three points
        
        Args:
            a, b, c: Coordinate points [x, y]
            
        Returns:
            float: Angle in degrees
        """
        return CoordinateProcessor.calculate_angle(a, b, c)
    
    async def load_state_from_redis(self, exercise_name: str):
        """
        Load state from Redis (optional, for persistence)
        Should be called by subclasses after init if Redis is available
        
        Args:
            exercise_name: Name of the exercise (e.g., 'biceps', 'squats')
        """
        if not self.user_id:
            return
        
        try:
            from utils.redis_service import exercise_state_service
            
            state = await exercise_state_service.load_state(self.user_id, exercise_name)
            if state:
                self.counter = state.get('counter', 0)
                self.stage = state.get('stage', None)
                self.use_redis = True
        except Exception:
            # Redis not available or error, continue with in-memory state
            pass
    
    async def save_state_to_redis(self, exercise_name: str, angle: int):
        """
        Save state to Redis (optional, for persistence)
        Should be called by subclasses after processing coordinates
        
        Args:
            exercise_name: Name of the exercise
            angle: Current angle
        """
        if not self.user_id:
            return
        
        try:
            from utils.redis_service import exercise_state_service
            
            await exercise_state_service.save_state(
                user_id=self.user_id,
                exercise=exercise_name,
                counter=self.counter,
                stage=self.stage or "ready",
                angle=angle
            )
        except Exception:
            # Redis not available or error, continue
            pass
    
    def process_coordinates(self, coordinates):
        """
        Process coordinates for the exercise (to be implemented by subclasses)
        
        Args:
            coordinates: Dictionary of coordinate points
            
        Returns:
            tuple: (counter, feedback, angle, stage)
        """
        raise NotImplementedError("Subclasses must implement process_coordinates")
