"""Neutral Grip Pull-ups exercise tracker"""
from utils.base_exercise import BaseExercise


class NeutralGripPullupCoordinates(BaseExercise):
    def __init__(self, user_id=None):
        super().__init__(user_id)
        self.min_angle_threshold = 50
        self.max_angle_threshold = 160
        
    def process_coordinates(self, coordinates):
        """
        Process coordinates for neutral grip pull-ups
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
        
        # Neutral grip pullup logic
        if angle > self.max_angle_threshold:
            if self.stage != "down":
                self.stage = "down"
                current_stage = "down"
            feedback = "Hang ready"
            
        elif angle < self.min_angle_threshold and self.stage == "down":
            if self.stage != "up":
                self.stage = "up"
                current_stage = "up"
                self.counter += 1
                feedback = "Great pull! Lower down"
            else:
                feedback = "Hold at top"
        else:
            feedback = "Keep pulling"
        
        return self.counter, feedback, int(angle), current_stage if current_stage else "ready"
