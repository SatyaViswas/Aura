"""Bench press exercise tracker"""
from utils.base_exercise import BaseExercise


class BenchPressCoordinates(BaseExercise):
    def __init__(self, user_id=None):
        super().__init__(user_id)
        self.angle_buffer_left = []
        self.angle_buffer_right = []
        self.min_angle_threshold = 70   # Bottom position (elbows bent)
        self.max_angle_threshold = 160  # Top position (arms extended)
        
    def process_coordinates(self, coordinates):
        """
        Process coordinates for bench press exercise
        Expected coordinates format: {
            'left_shoulder': [x, y],
            'left_elbow': [x, y],
            'right_shoulder': [x, y],
            'right_elbow': [x, y]
        }
        """
        required_points = ['left_shoulder', 'left_elbow', 'right_shoulder', 'right_elbow']
        
        if not self.validate_coordinates(coordinates, required_points):
            return self.counter, "Position yourself properly", 0, "ready"
        
        # Get coordinates for both arms
        left_shoulder = coordinates['left_shoulder']
        left_elbow = coordinates['left_elbow']
        right_shoulder = coordinates['right_shoulder']
        right_elbow = coordinates['right_elbow']
        
        # Calculate angles for both arms
        # For left arm: shoulder -> elbow -> virtual point extending from elbow
        left_dx = left_elbow[0] - left_shoulder[0]
        left_dy = left_elbow[1] - left_shoulder[1]
        left_virtual_wrist = [left_elbow[0] + left_dx, left_elbow[1] + left_dy]
        left_raw_angle = self.calculate_angle(left_shoulder, left_elbow, left_virtual_wrist)
        left_angle = self.smooth_angle_with_buffer(left_raw_angle, self.angle_buffer_left)
        
        # For right arm: shoulder -> elbow -> virtual point extending from elbow
        right_dx = right_elbow[0] - right_shoulder[0]
        right_dy = right_elbow[1] - right_shoulder[1]
        right_virtual_wrist = [right_elbow[0] + right_dx, right_elbow[1] + right_dy]
        right_raw_angle = self.calculate_angle(right_shoulder, right_elbow, right_virtual_wrist)
        right_angle = self.smooth_angle_with_buffer(right_raw_angle, self.angle_buffer_right)
        
        # Use average of both arms for consistent tracking
        avg_angle = (left_angle + right_angle) / 2
        
        feedback = "Position detected"
        current_stage = self.stage
        
        # Bench press logic
        if avg_angle > self.max_angle_threshold:
            if self.stage != "up":
                self.stage = "up"
                current_stage = "up"
            feedback = "Arms fully extended - good!"
            
        elif avg_angle < self.min_angle_threshold and self.stage == "up":
            self.stage = "down"
            current_stage = "down"
            self.counter += 1
            feedback = f"Rep {self.counter} completed! Press back up"
                
        elif self.min_angle_threshold <= avg_angle <= self.max_angle_threshold:
            if self.stage == "up":
                feedback = "Lower the weight slowly"
            elif self.stage == "down":
                feedback = "Press the weight up"
            else:
                feedback = "Start with arms extended"
        else:
            feedback = f"Current angle: {int(avg_angle)}°"
        
        return self.counter, feedback, int(avg_angle), current_stage or "ready"
