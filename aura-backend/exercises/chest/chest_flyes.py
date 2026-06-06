"""Chest Flyes (Cable or Dumbbell) exercise tracker"""
from utils.base_exercise import BaseExercise


class ChestFlyesCoordinates(BaseExercise):
    def __init__(self, user_id=None):
        super().__init__(user_id)
        self.min_angle_threshold = 20
        self.max_angle_threshold = 100
        
    def process_coordinates(self, coordinates):
        """
        Process coordinates for chest flyes
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
        
        # Chest flyes logic
        if angle > self.max_angle_threshold:
            if self.stage != "stretched":
                self.stage = "stretched"
                current_stage = "stretched"
            feedback = "Arms wide - feel the stretch"
            
        elif angle < self.min_angle_threshold and self.stage == "stretched":
            if self.stage != "contracted":
                self.stage = "contracted"
                current_stage = "contracted"
                self.counter += 1
                feedback = "Great squeeze! Open up"
            else:
                feedback = "Hold the contraction"
        else:
            feedback = "Bring arms together"
        
        return self.counter, feedback, int(angle), current_stage if current_stage else "ready"
