"""Light Squats exercise tracker"""
from utils.base_exercise import BaseExercise


class LightSquatsCoordinates(BaseExercise):
    def __init__(self, user_id=None):
        super().__init__(user_id)
        self.min_angle_threshold = 85
        self.max_angle_threshold = 170
        
    def process_coordinates(self, coordinates):
        """
        Process coordinates for light squats
        Expected coordinates format: {
            'right_hip': [x, y],
            'right_knee': [x, y],
            'right_ankle': [x, y]
        }
        """
        required_points = ['right_hip', 'right_knee', 'right_ankle']
        
        if not self.validate_coordinates(coordinates, required_points):
            return self.counter, "Position yourself properly", 0, "ready"
        
        # Get coordinates
        hip = coordinates['right_hip']
        knee = coordinates['right_knee']
        ankle = coordinates['right_ankle']
        
        # Calculate and smooth angle
        raw_angle = self.calculate_angle(hip, knee, ankle)
        angle = self.smooth_angle(raw_angle)
        
        feedback = "Position detected"
        current_stage = self.stage
        
        # Light squats logic
        if angle > self.max_angle_threshold:
            if self.stage != "up":
                self.stage = "up"
                current_stage = "up"
            feedback = "Standing"
            
        elif angle < self.min_angle_threshold and self.stage == "up":
            if self.stage != "down":
                self.stage = "down"
                current_stage = "down"
                self.counter += 1
                feedback = "Good rep! Stand up"
            else:
                feedback = "Quarter squat depth"
        else:
            feedback = "Keep moving"
        
        return self.counter, feedback, int(angle), current_stage if current_stage else "ready"
