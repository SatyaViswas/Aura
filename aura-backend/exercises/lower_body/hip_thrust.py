"""Hip Thrust exercise tracker"""
from utils.base_exercise import BaseExercise


class HipThrustCoordinates(BaseExercise):
    def __init__(self, user_id=None):
        super().__init__(user_id)
        self.min_angle_threshold = 90
        self.max_angle_threshold = 170
        
    def process_coordinates(self, coordinates):
        """
        Process coordinates for hip thrust
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
        
        # Hip thrust logic
        if angle > self.max_angle_threshold:
            if self.stage != "up":
                self.stage = "up"
                current_stage = "up"
            feedback = "Full hip extension"
            
        elif angle < self.min_angle_threshold and self.stage == "up":
            if self.stage != "down":
                self.stage = "down"
                current_stage = "down"
                self.counter += 1
                feedback = "Great! Thrust up"
            else:
                feedback = "Bottom position"
        else:
            feedback = "Squeeze glutes hard"
        
        return self.counter, feedback, int(angle), current_stage if current_stage else "ready"
