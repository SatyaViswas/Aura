"""Box Jumps exercise tracker"""
from utils.base_exercise import BaseExercise


class BoxJumpsCoordinates(BaseExercise):
    def __init__(self, user_id=None):
        super().__init__(user_id)
        self.min_angle_threshold = 90
        self.max_angle_threshold = 170
        self.jump_detected = False
        
    def process_coordinates(self, coordinates):
        """
        Process coordinates for box jumps
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
        
        # Box jump logic
        if angle > self.max_angle_threshold:
            if self.stage != "standing":
                self.stage = "standing"
                current_stage = "standing"
                if self.jump_detected:
                    self.counter += 1
                    self.jump_detected = False
            feedback = "Ready to jump"
            
        elif angle < self.min_angle_threshold:
            if self.stage != "loaded":
                self.stage = "loaded"
                current_stage = "loaded"
                self.jump_detected = True
            feedback = "Loaded - explode up!"
        else:
            feedback = "Prepare for jump"
        
        return self.counter, feedback, int(angle), current_stage if current_stage else "ready"
