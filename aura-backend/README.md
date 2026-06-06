# Aura Backend - Exercise Tracking System

## Project Structure

This codebase is organized into a clean, modular structure for maintainability and scalability.

```
aura-backend/
├── main.py                      # FastAPI application entry point
├── exercises/                   # Exercise trackers organized by body part
│   ├── __init__.py             # Exports all exercise classes
│   ├── upper_body/             # Upper body exercises
│   │   ├── __init__.py
│   │   ├── bicep_curl.py
│   │   ├── pushup.py
│   │   ├── bench_press.py
│   │   ├── rope_pulldown.py
│   │   ├── bent_tricep_pull.py
│   │   ├── pullup.py
│   │   ├── chest_supported_row.py
│   │   └── wide_grip_pulldown.py
│   ├── lower_body/             # Lower body exercises
│   │   ├── __init__.py
│   │   ├── squat.py
│   │   └── leg_press.py
│   ├── core/                   # Core exercises
│   │   ├── __init__.py
│   │   ├── plank.py
│   │   └── crunch.py
│   └── shoulders/              # Shoulder exercises
│       ├── __init__.py
│       ├── chest_supported_shoulder_press.py
│       └── overhead_shoulder_press.py
├── utils/                      # Reusable utilities
│   ├── __init__.py
│   ├── coordinate_utils.py     # CoordinateProcessor for angle calculations
│   └── base_exercise.py        # BaseExercise class with common methods
├── requirements.txt
├── Procfile
├── render.yaml
└── runtime.txt
```

## Architecture

### Utilities (`utils/`)

**CoordinateProcessor** (`coordinate_utils.py`)
- Static methods for coordinate validation and angle calculation
- Used across all exercises for consistent math operations

**BaseExercise** (`base_exercise.py`)
- Base class for all exercise trackers
- Provides common functionality:
  - `smooth_angle()` - Smooths angle measurements using rolling average
  - `smooth_angle_with_buffer()` - For multi-limb exercises (both arms/legs)
  - `validate_coordinates()` - Validates required coordinate points
  - `calculate_angle()` - Calculates angle between three points
  - `process_coordinates()` - Abstract method implemented by each exercise

### Exercises (`exercises/`)

Each exercise is in its own file and inherits from `BaseExercise`, implementing:
- Custom angle thresholds
- Exercise-specific logic
- Rep counting and feedback generation

**Organization by body part:**
- **upper_body/** - Arms, chest, back exercises
- **lower_body/** - Leg exercises
- **core/** - Core and abs exercises
- **shoulders/** - Shoulder-specific exercises

### Main Application (`main.py`)

FastAPI WebSocket server that:
- Manages real-time connections
- Creates exercise instances per connection
- Processes coordinate data from clients
- Returns feedback and rep counts

## Adding New Exercises

1. Choose the appropriate category folder (upper_body, lower_body, core, shoulders)
2. Create a new file: `exercises/<category>/<exercise_name>.py`
3. Import and inherit from `BaseExercise`
4. Implement `process_coordinates()` method
5. Export the class in `exercises/<category>/__init__.py`
6. Export in main `exercises/__init__.py`
7. Add to exercise instances in `main.py`

### Example:

```python
"""New exercise tracker"""
from utils.base_exercise import BaseExercise

class NewExerciseCoordinates(BaseExercise):
    def __init__(self):
        super().__init__()
        self.min_angle_threshold = 60
        self.max_angle_threshold = 160
        
    def process_coordinates(self, coordinates):
        required_points = ['point1', 'point2', 'point3']
        
        if not self.validate_coordinates(coordinates, required_points):
            return self.counter, "Position yourself properly", 0, "ready"
        
        # Get coordinates
        p1 = coordinates['point1']
        p2 = coordinates['point2']
        p3 = coordinates['point3']
        
        # Calculate angle
        raw_angle = self.calculate_angle(p1, p2, p3)
        angle = self.smooth_angle(raw_angle)
        
        # Exercise logic here...
        
        return self.counter, feedback, int(angle), current_stage or "ready"
```

## Benefits of This Structure

1. **Modularity** - Each exercise is self-contained and easy to modify
2. **Reusability** - Common code is in utilities, reducing duplication
3. **Maintainability** - Clear organization makes code easy to find and update
4. **Scalability** - Easy to add new exercises or categories
5. **Testability** - Each component can be tested independently
6. **Clean Imports** - Well-organized `__init__.py` files make imports clean

## Running the Application

```bash
# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn main:app --reload
```

## API Endpoints

- `GET /` - Server info
- `GET /health` - Health check
- `GET /stats` - Connection statistics
- `WebSocket /ws/{exercise}` - Exercise tracking connection
