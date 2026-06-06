"""Pullup exercise tracker"""
from utils.base_exercise import BaseExercise


class PullupCoordinates(BaseExercise):
    def __init__(self, user_id=None):
        super().__init__(user_id)
        self.angle_buffer_left = []
        self.angle_buffer_right = []
        self.min_angle_threshold = 70   # Arms bent (pulled up position)
        self.max_angle_threshold = 160  # Arms extended (hanging position)
        
    def process_coordinates(self, coordinates):
        """
        Process coordinates for pullup exercise
        Expected coordinates format: {
            'left_shoulder': [x, y],
            'left_elbow': [x, y],
            'left_wrist': [x, y],
            'right_shoulder': [x, y],
            'right_elbow': [x, y],
            'right_wrist': [x, y]
        }
        """
        required_points = ['left_shoulder', 'left_elbow', 'left_wrist', 
                          'right_shoulder', 'right_elbow', 'right_wrist']
        
        if not self.validate_coordinates(coordinates, required_points):
            return self.counter, "Position yourself properly", 0, "ready"
        
        # Get coordinates for both arms
        left_shoulder = coordinates['left_shoulder']
        left_elbow = coordinates['left_elbow']
        left_wrist = coordinates['left_wrist']
        right_shoulder = coordinates['right_shoulder']
        right_elbow = coordinates['right_elbow']
        right_wrist = coordinates['right_wrist']
        
        # Calculate angles for both arms (elbow angles)
        left_raw_angle = self.calculate_angle(left_shoulder, left_elbow, left_wrist)
        left_angle = self.smooth_angle_with_buffer(left_raw_angle, self.angle_buffer_left)
        
        right_raw_angle = self.calculate_angle(right_shoulder, right_elbow, right_wrist)
        right_angle = self.smooth_angle_with_buffer(right_raw_angle, self.angle_buffer_right)
        
        # Use average of both arms for consistent tracking
        avg_angle = (left_angle + right_angle) / 2
        
        feedback = "Position detected"
        current_stage = self.stage
        
        # Pullup logic - opposite to pushup (start hanging, pull up)
        if avg_angle > self.max_angle_threshold:
            if self.stage != "hanging":
                self.stage = "hanging"
                current_stage = "hanging"
            feedback = "Hanging position - ready to pull up"
            
        elif avg_angle < self.min_angle_threshold and self.stage == "hanging":
            if self.stage != "up":
                self.stage = "up"
                current_stage = "up"
                self.counter += 1
                feedback = f"Rep {self.counter} completed! Lower down slowly"
            else:
                feedback = "Hold the top position"
                
        elif self.min_angle_threshold <= avg_angle <= self.max_angle_threshold:
            if self.stage == "hanging":
                feedback = "Pull yourself up"
            elif self.stage == "up":
                feedback = "Lower down slowly"
            else:
                feedback = "Start by hanging from the bar"
        else:
            feedback = f"Current angle: {int(avg_angle)}°"
        
        return self.counter, feedback, int(avg_angle), current_stage or "ready"
