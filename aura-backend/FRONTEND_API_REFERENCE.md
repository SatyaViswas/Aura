# Exercise API Reference - WebSocket Integration

## Overview
This document provides all unique exercise identifiers for WebSocket API integration. Use these exact IDs to connect to the exercise tracking WebSocket endpoint.

## WebSocket Connection

**Endpoint:** `ws://your-server/ws/{exercise_id}?user_id={user_id}`

**Example:**
```javascript
const ws = new WebSocket('ws://localhost:8000/ws/pushups?user_id=user123');
```

---

## Complete Exercise List (54 Exercises)

### 🔴 CHEST EXERCISES (9)

| Exercise ID | Display Name | Has Video | Coordinate Points |
|------------|--------------|-----------|-------------------|
| `pushups` | Push-ups | ✅ | shoulder, elbow, wrist |
| `incline_dumbbell_press` | Incline Dumbbell Press | ✅ | shoulder, elbow, wrist |
| `incline_barbell_bench_press` | Incline Barbell Bench Press | ✅ | shoulder, elbow, wrist |
| `flat_barbell_bench_press` | Flat Barbell Bench Press | ✅ | shoulder, elbow, wrist |
| `rope_pulldown_chest` | Rope Pulldown (Chest) | ✅ | shoulder, elbow, wrist |
| `chest_flyes` | Chest Flyes | ✅ | shoulder, elbow, wrist |
| `chest_dips` | Chest Dips | ⚠️ | shoulder, elbow, wrist |
| `benchpress` | Bench Press | ✅ | shoulder, elbow, wrist |
| `ropepulldown` | Rope Pulldown | ✅ | shoulder, elbow, wrist |

---

### 🔵 BACK & LATS EXERCISES (14)

| Exercise ID | Display Name | Has Video | Coordinate Points |
|------------|--------------|-----------|-------------------|
| `wide_grip_pullup` | Wide Grip Pull-ups | ✅ | shoulder, elbow, wrist |
| `neutral_grip_pullup` | Neutral Grip Pull-ups | ✅ | shoulder, elbow, wrist |
| `chest_supported_row` | Chest Supported Row | ✅ | shoulder, elbow, wrist |
| `cable_lat_pulldown` | Cable Lat Pulldown | ✅ | shoulder, elbow, wrist |
| `neutral_grip_pulldown` | Neutral Grip Pulldown | ✅ | shoulder, elbow, wrist |
| `horizontal_neutral_grip_row` | Horizontal Neutral Grip Row | ✅ | shoulder, elbow, wrist |
| `weighted_pullup` | Weighted Pull-ups | ✅ | shoulder, elbow, wrist |
| `barbell_bent_over_row` | Barbell Bent-over Row | ✅ | shoulder, elbow, wrist |
| `lat_pulldown` | Lat Pulldown | ✅ | shoulder, elbow, wrist |
| `pullup` | Pull-ups | ✅ | shoulder, elbow, wrist |
| `seated_cable_row` | Seated Cable Row | ✅ | shoulder, elbow, wrist |
| `deadlift` | Deadlift (Conventional) | ⚠️ | hip, knee, ankle |
| `deadlift_trap_bar` | Deadlift (Trap Bar) | ⚠️ | hip, knee, ankle |
| `widegrippulldown` | Wide Grip Pulldown | ✅ | shoulder, elbow, wrist |

---

### 🟢 LEGS EXERCISES (11)

| Exercise ID | Display Name | Has Video | Coordinate Points |
|------------|--------------|-----------|-------------------|
| `squats` | Squats | ✅ | hip, knee, ankle |
| `leg_press` | Leg Press | ✅ | hip, knee, ankle |
| `leg_press_close_stance` | Leg Press (Close Stance) | ✅ | hip, knee, ankle |
| `leg_press_wide_stance` | Leg Press (Wide Stance) | ✅ | hip, knee, ankle |
| `leg_press_feet_high` | Leg Press (Feet High) | ✅ | hip, knee, ankle |
| `back_squat` | Back Squat | ✅ | hip, knee, ankle |
| `romanian_deadlift` | Romanian Deadlift (RDL) | ⚠️ | hip, knee, ankle |
| `hip_thrust` | Hip Thrust | ⚠️ | shoulder, hip, knee |
| `bulgarian_split_squat` | Bulgarian Split Squat | ⚠️ | hip, knee, ankle |
| `light_squats` | Light Squats | ✅ | hip, knee, ankle |
| `box_jumps` | Box Jumps | ⚠️ | hip, knee, ankle |

---

### 🟡 SHOULDERS EXERCISES (10)

| Exercise ID | Display Name | Has Video | Coordinate Points |
|------------|--------------|-----------|-------------------|
| `chest_supported_shoulder_press` | Chest Supported Shoulder Press | ✅ | shoulder, elbow, wrist |
| `cable_lateral_raises` | Cable Lateral Raises | ✅ | shoulder, elbow, wrist |
| `overhead_shoulder_press` | Overhead Shoulder Press | ✅ | shoulder, elbow, wrist |
| `cable_rope_press` | Cable Rope Press | ✅ | shoulder, elbow, wrist |
| `front_raises` | Front Raises | ✅ | shoulder, elbow, wrist |
| `dumbbell_lateral_raises` | Dumbbell Lateral Raises | ✅ | shoulder, elbow, wrist |
| `rear_delt_fly` | Rear Delt Fly | ✅ | shoulder, elbow, wrist |
| `shoulder_press` | Shoulder Press | ✅ | shoulder, elbow, wrist |
| `seated_overhead_press` | Seated Overhead Press | ✅ | shoulder, elbow, wrist |
| `cable_rope_face_pull` | Cable Rope Face Pull | ✅ | shoulder, elbow, wrist |

---

### 🟠 BICEPS EXERCISES (5)

| Exercise ID | Display Name | Has Video | Coordinate Points |
|------------|--------------|-----------|-------------------|
| `ez_bar_preacher_curls` | EZ Bar Preacher Curls | ✅ | shoulder, elbow, wrist |
| `incline_dumbbell_curls` | Incline Dumbbell Curls | ✅ | shoulder, elbow, wrist |
| `hammer_curls` | Hammer Curls | ✅ | shoulder, elbow, wrist |
| `barbell_curls` | Barbell Curls | ✅ | shoulder, elbow, wrist |
| `biceps` | Bicep Curl | ✅ | shoulder, elbow, wrist |

---

### 🟣 TRICEPS EXERCISES (4)

| Exercise ID | Display Name | Has Video | Coordinate Points |
|------------|--------------|-----------|-------------------|
| `tricep_extension_pushups` | Tricep Extension Push-ups | ✅ | shoulder, elbow, wrist |
| `bent_tricep_pull` | Bent Tricep Pull | ✅ | shoulder, elbow, wrist |
| `tricep_rope_pulldown` | Tricep Rope Pulldown | ✅ | shoulder, elbow, wrist |
| `tricep_rope_pushdown` | Tricep Rope Pushdown | ✅ | shoulder, elbow, wrist |

---

### ⚫ CORE EXERCISES (2)

| Exercise ID | Display Name | Has Video | Coordinate Points |
|------------|--------------|-----------|-------------------|
| `plank` | Plank | ✅ | shoulder, hip, knee |
| `crunch` | Crunch | ✅ | shoulder, hip, knee |

---

## Frontend Integration Examples

### JavaScript/TypeScript
```javascript
// Connect to exercise
const exerciseId = 'pushups';
const userId = 'user123';
const ws = new WebSocket(`ws://your-server/ws/${exerciseId}?user_id=${userId}`);

ws.onopen = () => {
  console.log('Connected to', exerciseId);
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Reps:', data.reps);
  console.log('Feedback:', data.feedback);
  console.log('Angle:', data.angle);
  console.log('Stage:', data.stage);
};

// Send coordinates
const coordinates = {
  coordinates: {
    right_shoulder: [100, 200],
    right_elbow: [150, 250],
    right_wrist: [180, 300]
  }
};
ws.send(JSON.stringify(coordinates));
```

### React Hook Example
```typescript
import { useEffect, useState } from 'react';

function useExerciseTracking(exerciseId: string, userId: string) {
  const [reps, setReps] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [angle, setAngle] = useState(0);
  const [stage, setStage] = useState('ready');

  useEffect(() => {
    const ws = new WebSocket(`ws://your-server/ws/${exerciseId}?user_id=${userId}`);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setReps(data.reps);
      setFeedback(data.feedback);
      setAngle(data.angle);
      setStage(data.stage);
    };

    return () => ws.close();
  }, [exerciseId, userId]);

  const sendCoordinates = (coords: any) => {
    ws.send(JSON.stringify({ coordinates: coords }));
  };

  return { reps, feedback, angle, stage, sendCoordinates };
}
```

### React Native Example
```typescript
import { useEffect, useState } from 'react';

const ExerciseTracker = ({ exerciseId, userId }) => {
  const [ws, setWs] = useState(null);
  const [data, setData] = useState({ reps: 0, feedback: '', angle: 0, stage: 'ready' });

  useEffect(() => {
    const websocket = new WebSocket(`ws://your-server/ws/${exerciseId}?user_id=${userId}`);
    
    websocket.onmessage = (event) => {
      setData(JSON.parse(event.data));
    };

    setWs(websocket);
    
    return () => websocket.close();
  }, [exerciseId, userId]);

  return (
    <View>
      <Text>Reps: {data.reps}</Text>
      <Text>Feedback: {data.feedback}</Text>
      <Text>Angle: {data.angle}°</Text>
      <Text>Stage: {data.stage}</Text>
    </View>
  );
};
```

---

## API Endpoints

### Get All Exercises
```http
GET /exercises
```

**Response:**
```json
{
  "total_exercises": 54,
  "exercises": {
    "chest": [...],
    "back": [...],
    "legs": [...],
    "shoulders": [...],
    "biceps": [...],
    "triceps": [...],
    "core": [...]
  }
}
```

### Health Check
```http
GET /health
```

### Connection Stats
```http
GET /stats
```

---

## Coordinate Data Format

### Upper Body Exercises (Arms)
```json
{
  "coordinates": {
    "right_shoulder": [x, y],
    "right_elbow": [x, y],
    "right_wrist": [x, y]
  }
}
```

### Lower Body Exercises (Legs)
```json
{
  "coordinates": {
    "right_hip": [x, y],
    "right_knee": [x, y],
    "right_ankle": [x, y]
  }
}
```

### Hip Thrust
```json
{
  "coordinates": {
    "right_shoulder": [x, y],
    "right_hip": [x, y],
    "right_knee": [x, y]
  }
}
```

### Core Exercises
```json
{
  "coordinates": {
    "right_shoulder": [x, y],
    "right_hip": [x, y],
    "right_knee": [x, y]
  }
}
```

---

## Response Format

Every WebSocket message returns:
```json
{
  "exercise": "pushups",
  "reps": 5,
  "feedback": "Great rep! Push back up",
  "angle": 85,
  "stage": "down",
  "connection_id": "a3b4c5d6",
  "processed_at": 1234567890.123
}
```

---

## Exercise Categories for UI

Use these groupings for navigation:

```javascript
const exerciseCategories = {
  chest: { 
    color: '#FF6B6B', 
    icon: '💪', 
    count: 9 
  },
  back: { 
    color: '#4ECDC4', 
    icon: '🏋️', 
    count: 14 
  },
  legs: { 
    color: '#95E1D3', 
    icon: '🦵', 
    count: 11 
  },
  shoulders: { 
    color: '#F9CA24', 
    icon: '💪', 
    count: 10 
  },
  biceps: { 
    color: '#FD79A8', 
    icon: '💪', 
    count: 5 
  },
  triceps: { 
    color: '#A29BFE', 
    icon: '💪', 
    count: 4 
  },
  core: { 
    color: '#74B9FF', 
    icon: '🎯', 
    count: 2 
  }
};
```

---

## Notes

- ✅ = Video available
- ⚠️ = No video available yet
- All exercises support real-time rep counting
- State persistence via Redis (if enabled)
- User-specific tracking with `user_id` parameter

---

**Last Updated:** December 16, 2025  
**API Version:** 2.0  
**Total Exercises:** 54
