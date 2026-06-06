"""Leg Press (Wide Stance) exercise tracker"""
from utils.base_exercise import BaseExercise


class LegPressWideStanceCoordinates(BaseExercise):
    def __init__(self, user_id=None):
        super().__init__(user_id)
        self.min_angle_threshold = 70
        self.max_angle_threshold = 160
        
    def process_coordinates(self, coordinates):
        """
        Process coordinates for leg press (wide stance)
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
        
        # Wide stance leg press logic
        if angle > self.max_angle_threshold:
            if self.stage != "extended":
                self.stage = "extended"
                current_stage = "extended"
            feedback = "Legs extended"
            
        elif angle < self.min_angle_threshold and self.stage == "extended":
            if self.stage != "flexed":
                self.stage = "flexed"
                current_stage = "flexed"
                self.counter += 1
                feedback = "Great rep! Press up"
            else:
                feedback = "Deep position"
        else:
            feedback = "Wide stance - press"
        
        return self.counter, feedback, int(angle), current_stage if current_stage else "ready"
