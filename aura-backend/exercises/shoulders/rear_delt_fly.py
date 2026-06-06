"""Rear Delt Fly (Machine or Dumbbell) exercise tracker"""
from utils.base_exercise import BaseExercise


class RearDeltFlyCoordinates(BaseExercise):
    def __init__(self, user_id=None):
        super().__init__(user_id)
        self.min_angle_threshold = 30
        self.max_angle_threshold = 100
        
    def process_coordinates(self, coordinates):
        """
        Process coordinates for rear delt fly
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
        
        # Rear delt fly logic
        if angle < self.min_angle_threshold:
            if self.stage != "front":
                self.stage = "front"
                current_stage = "front"
            feedback = "Arms forward"
            
        elif angle > self.max_angle_threshold and self.stage == "front":
            if self.stage != "back":
                self.stage = "back"
                current_stage = "back"
                self.counter += 1
                feedback = "Great squeeze! Return"
            else:
                feedback = "Rear delts engaged"
        else:
            feedback = "Fly arms back"
        
        return self.counter, feedback, int(angle), current_stage if current_stage else "ready"
