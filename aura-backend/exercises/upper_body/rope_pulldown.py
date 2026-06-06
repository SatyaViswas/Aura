"""Rope pulldown exercise tracker"""
from utils.base_exercise import BaseExercise


class RopePulldownCoordinates(BaseExercise):
    def __init__(self, user_id=None):
        super().__init__(user_id)
        self.min_angle_threshold = 60   # Arms fully brought together (contraction)
        self.max_angle_threshold = 150  # Arms open (start position)
        
    def process_coordinates(self, coordinates):
        """
        Process coordinates for rope pulldown (cable crossover)
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
        
        # Rope pulldown / cable fly logic
        if angle > self.max_angle_threshold:
            if self.stage != "open":
                self.stage = "open"
                current_stage = "open"
            feedback = "Arms open - starting position"
            
        elif angle < self.min_angle_threshold and self.stage == "open":
            if self.stage != "close":
                self.stage = "close"
                current_stage = "close"
                self.counter += 1
                feedback = "Good contraction! Return slowly"
            else:
                feedback = "Hold contraction"
                
        elif self.min_angle_threshold <= angle <= self.max_angle_threshold:
            if self.stage == "open":
                feedback = "Bring arms together"
            elif self.stage == "close":
                feedback = "Control back to start"
            else:
                feedback = "Start with arms open"
        else:
            feedback = f"Current angle: {int(angle)}°"
        
        return self.counter, feedback, int(angle), current_stage or "ready"
