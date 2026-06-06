"""Leg press exercise tracker"""
from utils.base_exercise import BaseExercise


class LegPressCoordinates(BaseExercise):
    def __init__(self, user_id=None):
        super().__init__(user_id)
        self.angle_buffer_left = []
        self.angle_buffer_right = []
        self.min_angle_threshold = 70   # Legs bent (knees close to chest)
        self.max_angle_threshold = 160  # Legs extended (pushed out)
        
    def process_coordinates(self, coordinates):
        """
        Process coordinates for leg press exercise
        Expected coordinates format: {
            'left_hip': [x, y],
            'left_knee': [x, y],
            'left_ankle': [x, y],
            'right_hip': [x, y],
            'right_knee': [x, y],
            'right_ankle': [x, y]
        }
        """
        required_points = ['left_hip', 'left_knee', 'left_ankle', 
                          'right_hip', 'right_knee', 'right_ankle']
        
        if not self.validate_coordinates(coordinates, required_points):
            return self.counter, "Position yourself properly", 0, "ready"
        
        # Get coordinates for both legs
        left_hip = coordinates['left_hip']
        left_knee = coordinates['left_knee']
        left_ankle = coordinates['left_ankle']
        right_hip = coordinates['right_hip']
        right_knee = coordinates['right_knee']
        right_ankle = coordinates['right_ankle']
        
        # Calculate angles for both legs (knee angles)
        left_raw_angle = self.calculate_angle(left_hip, left_knee, left_ankle)
        left_angle = self.smooth_angle_with_buffer(left_raw_angle, self.angle_buffer_left)
        
        right_raw_angle = self.calculate_angle(right_hip, right_knee, right_ankle)
        right_angle = self.smooth_angle_with_buffer(right_raw_angle, self.angle_buffer_right)
        
        # Use average of both legs for consistent tracking
        avg_angle = (left_angle + right_angle) / 2
        
        feedback = "Position detected"
        current_stage = self.stage
        
        # Leg press logic
        if avg_angle > self.max_angle_threshold:
            if self.stage != "extended":
                self.stage = "extended"
                current_stage = "extended"
            feedback = "Legs fully extended - good push!"
            
        elif avg_angle < self.min_angle_threshold and self.stage == "extended":
            if self.stage != "bent":
                self.stage = "bent"
                current_stage = "bent"
                self.counter += 1
                feedback = f"Rep {self.counter} completed! Push back out"
            else:
                feedback = "Hold the bent position"
                
        elif self.min_angle_threshold <= avg_angle <= self.max_angle_threshold:
            if self.stage == "extended":
                feedback = "Lower the weight slowly"
            elif self.stage == "bent":
                feedback = "Push the weight out"
            else:
                feedback = "Start with legs extended"
        else:
            feedback = f"Current angle: {int(avg_angle)}°"
        
        return self.counter, feedback, int(avg_angle), current_stage or "ready"
