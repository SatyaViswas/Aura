"""Bent tricep pull exercise tracker"""
from utils.base_exercise import BaseExercise


class BentTricepPullCoordinates(BaseExercise):
    def __init__(self, user_id=None):
        super().__init__(user_id)
        self.min_angle_threshold = 90   # Start (elbow bent)
        self.max_angle_threshold = 160  # End (arm fully extended)
        
    def process_coordinates(self, coordinates):
        """
        Process coordinates for bent tricep pull
        Expected coordinates format: {
            'right_shoulder': [x, y],
            'right_elbow': [x, y],
            'right_wrist': [x, y]
        }
        """
        required_points = ['right_shoulder', 'right_elbow', 'right_wrist']
        
        if not self.validate_coordinates(coordinates, required_points):
            return self.counter, "Position yourself properly", 0, "ready"
        
        # Get coordinates
        shoulder = coordinates['right_shoulder']
        elbow = coordinates['right_elbow']
        wrist = coordinates['right_wrist']
        
        # Calculate and smooth angle
        raw_angle = self.calculate_angle(shoulder, elbow, wrist)
        angle = self.smooth_angle(raw_angle)
        
        feedback = "Position detected"
        current_stage = self.stage
        
        # Tricep pull logic
        if angle > self.max_angle_threshold:
            if self.stage != "extended":
                self.stage = "extended"
                current_stage = "extended"
            feedback = "Arm fully extended"
            
        elif angle < self.min_angle_threshold and self.stage == "extended":
            if self.stage != "bent":
                self.stage = "bent"
                current_stage = "bent"
                self.counter += 1
                feedback = "Good rep! Extend again"
            else:
                feedback = "Hold bent position"
                
        elif self.min_angle_threshold <= angle <= self.max_angle_threshold:
            if self.stage == "extended":
                feedback = "Slowly bend elbow"
            elif self.stage == "bent":
                feedback = "Push cable down"
            else:
                feedback = "Start with elbow slightly bent"
        else:
            feedback = f"Current angle: {int(angle)}°"
        
        return self.counter, feedback, int(angle), current_stage or "ready"
