# Migration Guide - Code Restructuring

## Summary of Changes

The codebase has been restructured from a single monolithic file into a clean, modular architecture. All functionality remains the same, but the code is now better organized.

## What Changed

### Files Renamed/Moved
- ❌ `coordinate_exercises.py` → ✅ Archived as `coordinate_exercises.py.old`
- ✅ All classes split into individual files under `exercises/` and `utils/`

### Import Changes

**Old imports in main.py:**
```python
from coordinate_exercises import (
    BicepCurlCoordinates, 
    SquatCoordinates, 
    PushupCoordinates, 
    # ... etc
)
```

**New imports in main.py:**
```python
from exercises import (
    BicepCurlCoordinates,
    SquatCoordinates,
    PushupCoordinates,
    # ... etc
)
```

### Class Changes

**All exercise classes now:**
1. Inherit from `BaseExercise` (instead of duplicating code)
2. Are in their own files organized by category
3. Use inherited methods for common operations

**Example - BicepCurlCoordinates:**

**Before:**
```python
# In coordinate_exercises.py (lines 1-111)
class BicepCurlCoordinates:
    def __init__(self):
        self.counter = 0
        self.stage = None
        self.angle_buffer = []
        # ... thresholds
    
    def smooth_angle(self, angle, buffer_size=5):
        """Smooth angle measurements using a rolling average"""
        self.angle_buffer.append(angle)
        if len(self.angle_buffer) > buffer_size:
            self.angle_buffer.pop(0)
        return sum(self.angle_buffer) / len(self.angle_buffer)
    
    def process_coordinates(self, coordinates):
        # ... implementation
        if not CoordinateProcessor.validate_coordinates(coordinates, required_points):
            # ...
        angle = CoordinateProcessor.calculate_angle(shoulder, elbow, wrist)
        # ...
```

**After:**
```python
# In exercises/upper_body/bicep_curl.py
from utils.base_exercise import BaseExercise

class BicepCurlCoordinates(BaseExercise):
    def __init__(self):
        super().__init__()  # Inherits common attributes
        self.min_angle_threshold = 50
        self.max_angle_threshold = 140
    
    def process_coordinates(self, coordinates):
        # ... implementation
        if not self.validate_coordinates(coordinates, required_points):
            # ... inherited method
        angle = self.calculate_angle(shoulder, elbow, wrist)
        # ... inherited method
```

## What Stayed the Same

✅ All exercise logic is identical  
✅ All class names are unchanged  
✅ All method signatures are the same  
✅ The API endpoints work exactly as before  
✅ WebSocket connections work the same way  
✅ No changes to client-side code needed  

## New Features

### 1. Utilities Module (`utils/`)
Reusable components extracted for use across all exercises:

- **CoordinateProcessor**: Static methods for math operations
  - `calculate_angle(a, b, c)` - Calculate angle between 3 points
  - `validate_coordinates(coords, required_points)` - Validate coordinate data

- **BaseExercise**: Base class for all exercises
  - Provides common attributes (counter, stage, buffers, thresholds)
  - Provides common methods (smooth_angle, validation, calculation)

### 2. Organized Structure
Exercises are now categorized:
- `exercises/upper_body/` - Arms, chest, back
- `exercises/lower_body/` - Legs
- `exercises/core/` - Core and abs
- `exercises/shoulders/` - Shoulders

### 3. Documentation
- `README.md` - Complete project documentation
- `STRUCTURE.md` - Visual structure diagram and metrics
- `MIGRATION.md` - This guide

## Testing After Migration

### 1. Import Test
```bash
python -c "from exercises import BicepCurlCoordinates; print('✓ Success')"
```

### 2. Main App Test
```bash
python -c "import main; print('✓ Success')"
```

### 3. Full Server Test
```bash
uvicorn main:app --reload
```

Then verify:
- ✅ Server starts without errors
- ✅ GET / returns server info
- ✅ GET /health returns healthy status
- ✅ WebSocket connections work

## For Developers

### Adding New Exercises
1. Create new file in appropriate category folder
2. Inherit from `BaseExercise`
3. Override `process_coordinates()` method
4. Export in `__init__.py` files
5. Add to `main.py` exercise_instances

### Modifying Existing Exercises
1. Find exercise in `exercises/<category>/<exercise_name>.py`
2. Edit the `process_coordinates()` method
3. No need to touch utilities or other exercises

### Modifying Common Behavior
1. Edit `utils/base_exercise.py` to affect all exercises
2. Edit `utils/coordinate_utils.py` for angle calculations

## Rollback (if needed)

If you need to rollback to the old structure:

```bash
# Restore old file
mv coordinate_exercises.py.old coordinate_exercises.py

# Update main.py imports (revert to old import statement)
# Then restart server
```

## Benefits Summary

| Aspect | Before | After |
|--------|--------|-------|
| **Maintainability** | Hard to find/modify exercises | Easy to locate specific exercises |
| **Code Duplication** | High (repeated in 14 classes) | None (inherited from base) |
| **Testing** | Hard to test individually | Easy to unit test |
| **Onboarding** | Overwhelming 1111-line file | Clear structure, easy to understand |
| **Scalability** | Adding exercises = longer file | Adding exercises = new file |
| **Organization** | Flat, no categories | Hierarchical, categorized |

## Questions?

The restructuring maintains 100% backward compatibility while improving code quality. All tests should pass, and the API remains unchanged.

If you encounter any issues:
1. Check that all files are in the correct locations
2. Verify Python can find the `exercises` and `utils` packages
3. Ensure `__init__.py` files are present in all package directories
4. Check import statements in `main.py`
