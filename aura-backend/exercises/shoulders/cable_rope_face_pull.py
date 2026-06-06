"""Cable Rope Face Pull exercise tracker"""
from utils.base_exercise import BaseExercise


class CableRopeFacePullCoordinates(BaseExercise):
    def __init__(self, user_id=None):
        super().__init__(user_id)
        self.min_angle_threshold = 45
        self.max_angle_threshold = 140
        
    def process_coordinates(self, coordinates):
        """
        Process coordinates for cable rope face pull
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
        
        # Face pull logic
        if angle > self.max_angle_threshold:
            if self.stage != "extended":
                self.stage = "extended"
                current_stage = "extended"
            feedback = "Arms extended forward"
            
        elif angle < self.min_angle_threshold and self.stage == "extended":
            if self.stage != "contracted":
                self.stage = "contracted"
                current_stage = "contracted"
                self.counter += 1
                feedback = "Perfect! Extend back"
            else:
                feedback = "Rope at face level"
        else:
            feedback = "Pull to face"
        
        return self.counter, feedback, int(angle), current_stage if current_stage else "ready"
