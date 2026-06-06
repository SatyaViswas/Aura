"""Crunch exercise tracker"""
from utils.base_exercise import BaseExercise


class CrunchCoordinates(BaseExercise):
    def __init__(self, user_id=None):
        super().__init__(user_id)
        self.min_angle_threshold = 80   # Crunch position (torso bent forward)
        self.max_angle_threshold = 160  # Upright position
        
    def process_coordinates(self, coordinates):
        """
        Process coordinates for kneeling cable crunch
        Expected coordinates format: {
            'right_knee': [x, y],
            'right_hip': [x, y],
            'right_shoulder': [x, y]
        }
        """
        required_points = ['right_knee', 'right_hip', 'right_shoulder']
        
        if not self.validate_coordinates(coordinates, required_points):
            return self.counter, "Position yourself properly", 0, "ready"
        
        # Get coordinates
        knee = coordinates['right_knee']
        hip = coordinates['right_hip']
        shoulder = coordinates['right_shoulder']
        
        # Calculate and smooth torso angle
        raw_angle = self.calculate_angle(knee, hip, shoulder)
        angle = self.smooth_angle(raw_angle)
        
        feedback = "Position detected"
        current_stage = self.stage
        
        # Crunch logic
        if angle > self.max_angle_threshold:
            if self.stage != "up":
                self.stage = "up"
                current_stage = "up"
            feedback = "Torso upright - start position"
            
        elif angle < self.min_angle_threshold and self.stage == "up":
            if self.stage != "down":
                self.stage = "down"
                current_stage = "down"
                self.counter += 1
                feedback = "Good crunch! Return slowly"
            else:
                feedback = "Hold crunch position"
                
        elif self.min_angle_threshold <= angle <= self.max_angle_threshold:
            if self.stage == "up":
                feedback = "Bend forward"
            elif self.stage == "down":
                feedback = "Return to upright"
            else:
                feedback = "Start in upright position"
        else:
            feedback = f"Current angle: {int(angle)}°"
        
        return self.counter, feedback, int(angle), current_stage or "ready"
