"""
Unit tests for exercise classes
Run with: pytest tests/test_exercises.py
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from exercises.upper_body import BicepCurlCoordinates, PushupCoordinates
from exercises.lower_body import SquatCoordinates
from exercises.core import PlankCoordinates


def test_bicep_curl_initialization():
    """Test bicep curl initializes correctly"""
    bicep = BicepCurlCoordinates()
    assert bicep.counter == 0
    assert bicep.stage is None
    assert bicep.min_angle_threshold == 50
    assert bicep.max_angle_threshold == 140


def test_bicep_curl_valid_coordinates():
    """Test bicep curl processes valid coordinates"""
    bicep = BicepCurlCoordinates()
    coords = {
        'right_shoulder': [0.5, 0.3],
        'right_elbow': [0.5, 0.5],
        'right_wrist': [0.5, 0.7]
    }
    
    counter, feedback, angle, stage = bicep.process_coordinates(coords)
    
    assert isinstance(counter, int)
    assert isinstance(feedback, str)
    assert isinstance(angle, int)
    assert stage in ["ready", "up", "down"]


def test_bicep_curl_invalid_coordinates():
    """Test bicep curl handles invalid coordinates"""
    bicep = BicepCurlCoordinates()
    coords = {
        'wrong_point': [0.5, 0.3]
    }
    
    counter, feedback, angle, stage = bicep.process_coordinates(coords)
    
    assert feedback == "Position yourself properly"
    assert angle == 0
    assert stage == "ready"


def test_squat_initialization():
    """Test squat initializes correctly"""
    squat = SquatCoordinates()
    assert squat.counter == 0
    assert squat.stage is None
    assert squat.min_angle_threshold == 70
    assert squat.max_angle_threshold == 160


def test_squat_valid_coordinates():
    """Test squat processes valid coordinates"""
    squat = SquatCoordinates()
    coords = {
        'right_hip': [0.5, 0.4],
        'right_knee': [0.5, 0.6],
        'right_ankle': [0.5, 0.9]
    }
    
    counter, feedback, angle, stage = squat.process_coordinates(coords)
    
    assert isinstance(counter, int)
    assert isinstance(feedback, str)
    assert isinstance(angle, int)
    assert stage in ["ready", "up", "down"]


def test_pushup_initialization():
    """Test pushup initializes correctly"""
    pushup = PushupCoordinates()
    assert pushup.counter == 0
    assert pushup.stage is None


def test_plank_initialization():
    """Test plank initializes correctly"""
    plank = PlankCoordinates()
    assert plank.counter == 0
    assert plank.stage is None
    assert plank.min_hip_angle == 160
    assert plank.max_hip_angle == 190


def test_angle_smoothing():
    """Test angle smoothing function"""
    bicep = BicepCurlCoordinates()
    
    # Add angles to buffer
    angles = [45, 46, 47, 46, 45]
    smoothed = []
    
    for angle in angles:
        smoothed_angle = bicep.smooth_angle(angle)
        smoothed.append(smoothed_angle)
    
    # Smoothed angles should be closer to mean
    assert len(smoothed) == 5
    assert smoothed[-1] == sum(angles) / len(angles)  # Should be average


def test_rep_counting():
    """Test rep counting mechanism"""
    bicep = BicepCurlCoordinates()
    
    # Simulate extended arm (down position)
    coords_extended = {
        'right_shoulder': [0.5, 0.3],
        'right_elbow': [0.5, 0.5],
        'right_wrist': [0.5, 0.9]  # Arm extended
    }
    
    # Process multiple times to establish "down" stage
    for _ in range(5):
        counter, _, _, stage = bicep.process_coordinates(coords_extended)
    
    assert stage == "down"
    initial_counter = counter
    
    # Simulate flexed arm (up position)
    coords_flexed = {
        'right_shoulder': [0.5, 0.3],
        'right_elbow': [0.5, 0.5],
        'right_wrist': [0.45, 0.35]  # Arm flexed
    }
    
    # Process flexed position - should increment counter
    for _ in range(5):
        counter, _, _, stage = bicep.process_coordinates(coords_flexed)
    
    # Counter should have incremented
    assert counter > initial_counter


if __name__ == "__main__":
    print("Running unit tests...\n")
    
    test_bicep_curl_initialization()
    print("✅ Bicep curl initialization")
    
    test_bicep_curl_valid_coordinates()
    print("✅ Bicep curl valid coordinates")
    
    test_bicep_curl_invalid_coordinates()
    print("✅ Bicep curl invalid coordinates")
    
    test_squat_initialization()
    print("✅ Squat initialization")
    
    test_squat_valid_coordinates()
    print("✅ Squat valid coordinates")
    
    test_pushup_initialization()
    print("✅ Pushup initialization")
    
    test_plank_initialization()
    print("✅ Plank initialization")
    
    test_angle_smoothing()
    print("✅ Angle smoothing")
    
    test_rep_counting()
    print("✅ Rep counting")
    
    print("\n✅ All tests passed!")
