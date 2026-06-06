"""Coordinate processing utilities for exercise tracking"""
import numpy as np


class CoordinateProcessor:
    """Lightweight processor that works with coordinates instead of video frames"""
    
    @staticmethod
    def calculate_angle(a, b, c):
        """
        Calculate angle between three points
        
        Args:
            a: First point [x, y]
            b: Middle point (vertex) [x, y]
            c: Third point [x, y]
            
        Returns:
            float: Angle in degrees
        """
        a = np.array(a)
        b = np.array(b)
        c = np.array(c)
        
        radians = np.arctan2(c[1]-b[1], c[0]-b[0]) - np.arctan2(a[1]-b[1], a[0]-b[0])
        angle = np.abs(radians*180.0/np.pi)
        
        if angle > 180.0:
            angle = 360 - angle
            
        return angle
    
    @staticmethod
    def validate_coordinates(coords_dict, required_points):
        """
        Validate that required coordinate points are present and valid
        
        Args:
            coords_dict: Dictionary of coordinate points
            required_points: List of required point names
            
        Returns:
            bool: True if all required points are valid, False otherwise
        """
        for point in required_points:
            if point not in coords_dict:
                return False
            coord = coords_dict[point]
            if not coord or len(coord) < 2:
                return False
            if coord[0] is None or coord[1] is None:
                return False
        return True
