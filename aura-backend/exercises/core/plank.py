"""Plank exercise tracker"""
import time
from utils.base_exercise import BaseExercise


class PlankCoordinates(BaseExercise):
    def __init__(self, user_id=None):
        super().__init__(user_id)
        self.min_hip_angle = 160
        self.max_hip_angle = 190
        self.start_time = None
        self.total_time = 0
        self.is_in_plank = False
        
    def process_coordinates(self, coordinates):
        """
        Process coordinates for plank
        Expected coordinates format: {
            'right_shoulder': [x, y],
            'right_hip': [x, y],
            'right_knee': [x, y]
        }
        """
        required_points = ['right_shoulder', 'right_hip', 'right_knee']
        
        if not self.validate_coordinates(coordinates, required_points):
            return self.counter, "Position yourself properly", 0, "ready"
        
        # Get coordinates
        shoulder = coordinates['right_shoulder']
        hip = coordinates['right_hip']
        knee = coordinates['right_knee']
        
        # Calculate and smooth angle
        raw_angle = self.calculate_angle(shoulder, hip, knee)
        angle = self.smooth_angle(raw_angle)
        
        feedback = "Position detected"
        current_stage = self.stage
        
        # Plank logic - check if body is straight
        if self.min_hip_angle <= angle <= self.max_hip_angle:
            if not self.is_in_plank:
                self.is_in_plank = True
                self.start_time = time.time()
                self.stage = "holding"
                current_stage = "holding"
                feedback = "Perfect plank! Hold it!"
            else:
                # Update time
                if self.start_time:
                    current_time = time.time()
                    self.counter = int(current_time - self.start_time + self.total_time)
                feedback = f"Great form! Hold for {self.counter}s"
                current_stage = "holding"
                
        else:
            if self.is_in_plank:
                # Was in plank, now out - save the time
                if self.start_time:
                    self.total_time += time.time() - self.start_time
                    self.start_time = None
                self.is_in_plank = False
                
            self.stage = "adjusting"
            current_stage = "adjusting"
            
            if angle < self.min_hip_angle:
                feedback = "Lower your hips - keep body straight"
            elif angle > self.max_hip_angle:
                feedback = "Raise your hips - keep body straight"
            else:
                feedback = "Get into plank position"
        
        return self.counter, feedback, int(angle), current_stage or "ready"
