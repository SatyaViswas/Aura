# Code Structure Diagram

## Before Refactoring
```
araise_backend_code/
├── main.py                           # All imports from single file
└── coordinate_exercises.py           # 1111 lines - ALL exercises + utilities
```
**Problems:**
- Single 1111-line file with all exercises
- Duplicated code (smooth_angle, validate_coordinates in every class)
- Hard to maintain and find specific exercises
- No organization by category

---

## After Refactoring
```
araise_backend_code/
├── main.py                           # Clean imports from exercises package
├── README.md                         # Complete documentation
├── exercises/                        # Organized by body part
│   ├── __init__.py                  # Central export point
│   ├── upper_body/                  # 8 exercises
│   │   ├── __init__.py
│   │   ├── bicep_curl.py           # ~70 lines each
│   │   ├── pushup.py
│   │   ├── bench_press.py
│   │   ├── rope_pulldown.py
│   │   ├── bent_tricep_pull.py
│   │   ├── pullup.py
│   │   ├── chest_supported_row.py
│   │   └── wide_grip_pulldown.py
│   ├── lower_body/                  # 2 exercises
│   │   ├── __init__.py
│   │   ├── squat.py
│   │   └── leg_press.py
│   ├── core/                        # 2 exercises
│   │   ├── __init__.py
│   │   ├── plank.py
│   │   └── crunch.py
│   └── shoulders/                   # 2 exercises
│       ├── __init__.py
│       ├── chest_supported_shoulder_press.py
│       └── overhead_shoulder_press.py
└── utils/                           # Reusable components
    ├── __init__.py
    ├── coordinate_utils.py          # CoordinateProcessor (angle math)
    └── base_exercise.py             # BaseExercise (common methods)
```

---

## Class Hierarchy

```
BaseExercise (utils/base_exercise.py)
    ├── Common attributes:
    │   ├── counter
    │   ├── stage
    │   ├── angle_buffer
    │   ├── min_angle_threshold
    │   └── max_angle_threshold
    │
    ├── Common methods:
    │   ├── smooth_angle()
    │   ├── smooth_angle_with_buffer()
    │   ├── validate_coordinates()
    │   ├── calculate_angle()
    │   └── process_coordinates() [abstract]
    │
    └── Inherited by all exercises:
        ├── BicepCurlCoordinates
        ├── PushupCoordinates
        ├── SquatCoordinates
        ├── PlankCoordinates
        ├── ... and 10 more
```

---

## Key Improvements

### 1. **Reusable Utilities**
- `CoordinateProcessor`: Shared angle calculation and validation
- `BaseExercise`: Eliminates code duplication across 14 exercises

### 2. **Modular Organization**
- Each exercise in its own file (~50-80 lines)
- Categorized by body part (upper_body, lower_body, core, shoulders)
- Easy to locate and modify specific exercises

### 3. **Clean Import Structure**
```python
# Before
from coordinate_exercises import BicepCurlCoordinates, SquatCoordinates, ...

# After
from exercises import BicepCurlCoordinates, SquatCoordinates, ...
# or
from exercises.upper_body import BicepCurlCoordinates
```

### 4. **Maintainability**
- Single Responsibility Principle: Each file has one job
- Easy to add new exercises without touching existing code
- Clear structure makes onboarding new developers easier

### 5. **Testing**
- Each component can be unit tested independently
- Utilities can be tested separately from exercises
- Mock dependencies easily

---

## Code Metrics

| Metric | Before | After |
|--------|--------|-------|
| Largest file | 1111 lines | ~100 lines |
| Code duplication | High (14 copies of smooth_angle) | None (inherited) |
| Files | 2 | 24 |
| Organization | Flat | Hierarchical |
| Maintainability | Low | High |

---

## Adding a New Exercise (Example)

**File:** `exercises/upper_body/dumbbell_curl.py`

```python
from utils.base_exercise import BaseExercise

class DumbbellCurlCoordinates(BaseExercise):
    def __init__(self):
        super().__init__()  # Inherits all common attributes
        self.min_angle_threshold = 50
        self.max_angle_threshold = 140
        
    def process_coordinates(self, coordinates):
        # Validate
        if not self.validate_coordinates(coordinates, ['shoulder', 'elbow', 'wrist']):
            return self.counter, "Position properly", 0, "ready"
        
        # Calculate angle using inherited method
        angle = self.smooth_angle(
            self.calculate_angle(
                coordinates['shoulder'],
                coordinates['elbow'],
                coordinates['wrist']
            )
        )
        
        # Exercise logic...
        return self.counter, feedback, int(angle), stage
```

**Then:**
1. Add to `exercises/upper_body/__init__.py`
2. Add to `exercises/__init__.py`
3. Add to `main.py` exercise_instances

**Done!** No need to rewrite common code.
