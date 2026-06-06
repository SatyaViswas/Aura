# Frontend-Backend Exercise Mapping

## ✅ Matching Exercises (47 matches)

These frontend exercises have corresponding backend implementations. **Use these exact backend IDs** for `pose_analyzer: true` exercises:

| Frontend uniqueName | Backend ID | Match Status |
|---------------------|------------|--------------|
| `push-ups` | `pushups` | ✅ Matched |
| `incline-dumbbell-press` | `incline_dumbbell_press` | ✅ Matched |
| `incline-barbell-bench-press` | `incline_barbell_bench_press` | ✅ Matched |
| `flat-barbell-bench-press` | `flat_barbell_bench_press` | ✅ Matched |
| `rope-pulldown-chest` | `rope_pulldown_chest` | ✅ Matched |
| `chest-flyes` | `chest_flyes` | ✅ Matched |
| `chest-dips` | `chest_dips` | ✅ Matched |
| `tricep-extension-push-ups` | `tricep_extension_pushups` | ✅ Matched |
| `bent-tricep-pull` | `bent_tricep_pull` | ✅ Matched |
| `tricep-rope-pulldown` | `tricep_rope_pulldown` | ✅ Matched |
| `crunches` | `crunch` | ✅ Matched (singular in backend) |
| `plank` | `plank` | ✅ Matched |
| `wide-grip-pull-ups` | `wide_grip_pullup` | ✅ Matched |
| `neutral-grip-pull-ups` | `neutral_grip_pullup` | ✅ Matched |
| `chest-supported-rows` | `chest_supported_row` | ✅ Matched (singular) |
| `cable-lat-pulldown` | `cable_lat_pulldown` | ✅ Matched |
| `neutral-grip-pulldown` | `neutral_grip_pulldown` | ✅ Matched |
| `horizontal-neutral-grip-row` | `horizontal_neutral_grip_row` | ✅ Matched |
| `ezbar-preacher-curls` | `ez_bar_preacher_curls` | ✅ Matched |
| `incline-dumbbell-curls` | `incline_dumbbell_curls` | ✅ Matched |
| `hammer-curls` | `hammer_curls` | ✅ Matched |
| `barbell-curls` | `barbell_curls` | ✅ Matched |
| `squats` | `squats` | ✅ Matched |
| `leg-press` | `leg_press` | ✅ Matched |
| `chest-supported-shoulder-press` | `chest_supported_shoulder_press` | ✅ Matched |
| `cable-lateral-raises` | `cable_lateral_raises` | ✅ Matched |
| `overhead-shoulder-press` | `overhead_shoulder_press` | ✅ Matched |
| `cable-rope-press` | `cable_rope_press` | ✅ Matched |
| `front-raises` | `front_raises` | ✅ Matched |
| `weighted-pull-ups` | `weighted_pullup` | ✅ Matched |
| `barbell-bent-over-row` | `barbell_bent_over_row` | ✅ Matched |
| `dumbbell-lateral-raises` | `dumbbell_lateral_raises` | ✅ Matched |
| `rear-delt-fly` | `rear_delt_fly` | ✅ Matched |
| `back-squat` | `back_squat` | ✅ Matched |
| `romanian-deadlift` | `romanian_deadlift` | ✅ Matched |
| `hip-thrust` | `hip_thrust` | ✅ Matched |
| `bulgarian-split-squat` | `bulgarian_split_squat` | ✅ Matched |
| `pull-ups` | `pullup` | ✅ Matched |
| `lat-pulldown` | `lat_pulldown` | ✅ Matched |
| `shoulder-press` | `shoulder_press` | ✅ Matched |
| `deadlifts` | `deadlift` | ✅ Matched |
| `seated-cable-row` | `seated_cable_row` | ✅ Matched |
| `seated-overhead-press` | `seated_overhead_press` | ✅ Matched |
| `box-jumps` | `box_jumps` | ✅ Matched |
| `light-squats` | `light_squats` | ✅ Matched |

---

## ❌ Missing from Backend (5 exercises)

**These frontend exercises need to be implemented in the backend OR handled differently in frontend:**

| Frontend uniqueName | Exercise Name | Reason |
|---------------------|---------------|--------|
| `reverse-crunches` | Reverse Crunches | Not implemented in backend |
| `core-stability` | Core Stability (Plank / Pallof Press) | Not implemented (could map to `plank`?) |
| `burpees` | Burpees | Not implemented in backend |
| `mountain-climbers` | Mountain Climbers | Not implemented in backend |
| `kettlebell-swings` | Kettlebell Swings | Not implemented in backend |

**Recommendation for these 5 exercises:**
```javascript
// Option 1: Disable pose analyzer for these exercises
{
  id: 'reverse-crunches',
  exerciseName: 'Reverse Crunches',
  uniqueName: 'reverse-crunches',
  pose_analyzer: false, // ❌ Change to false
  // ... rest of config
}

// Option 2: Map to similar exercise
{
  id: 'core-stability',
  exerciseName: 'Core Stability',
  uniqueName: 'plank', // Map to existing plank exercise
  pose_analyzer: true,
  // ... rest of config
}
```

---

## 📊 Summary

- **Total Frontend Exercises**: 52
- **✅ Matched with Backend**: 47 (90%)
- **❌ Missing from Backend**: 5 (10%)

---

## 🔧 Frontend Implementation Guide

### Step 1: Update uniqueName to match backend IDs

**Convert kebab-case to snake_case:**
```javascript
// ❌ Before (kebab-case)
uniqueName: 'push-ups'

// ✅ After (snake_case - matches backend)
uniqueName: 'pushups'
```

### Step 2: Handle singular vs plural differences

```javascript
// Frontend: 'crunches' → Backend: 'crunch'
// Frontend: 'chest-supported-rows' → Backend: 'chest_supported_row'
// Frontend: 'squats' → Backend: 'squats' (both plural ✓)
```

### Step 3: WebSocket Connection Pattern

```javascript
const connectToExercise = (exerciseUniqueName, userId) => {
  // Use the backend ID directly (from uniqueName column in mapping table)
  const ws = new WebSocket(
    `ws://your-backend-url/ws/${exerciseUniqueName}?user_id=${userId}`
  );
  
  ws.onopen = () => {
    console.log(`Connected to ${exerciseUniqueName}`);
  };
  
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log('Reps:', data.counter);
    console.log('Feedback:', data.feedback);
    console.log('Angle:', data.angle);
  };
  
  return ws;
};

// Example usage
const ws = connectToExercise('pushups', 'user123');

// Send coordinates
ws.send(JSON.stringify({
  keypoints: {
    left_shoulder: { x: 0.5, y: 0.3, confidence: 0.9 },
    left_elbow: { x: 0.4, y: 0.5, confidence: 0.9 },
    left_wrist: { x: 0.35, y: 0.7, confidence: 0.9 },
    // ... other keypoints
  }
}));
```

---

## 🎯 Recommended Frontend Changes

### For the 47 matched exercises:

Update your frontend exercise definitions to use the **Backend ID** column from the mapping table:

```javascript
export const exercises = {
  // ✅ Change this
  'push-ups': {
    id: 'push-ups',
    exerciseName: 'Push-ups',
    uniqueName: 'pushups', // ✅ Changed from 'push-ups' to 'pushups'
    pose_analyzer: true,
    // ... rest
  },
  
  // ✅ Change this
  'crunches': {
    id: 'crunches',
    exerciseName: 'Crunches',
    uniqueName: 'crunch', // ✅ Changed from 'crunches' to 'crunch' (singular)
    pose_analyzer: true,
    // ... rest
  },
  
  // ✅ Change this
  'wide-grip-pull-ups': {
    id: 'wide-grip-pull-ups',
    exerciseName: 'Wide Grip Pull-ups',
    uniqueName: 'wide_grip_pullup', // ✅ Changed to snake_case
    pose_analyzer: true,
    // ... rest
  },
  
  // ❌ Disable pose analyzer for missing exercises
  'reverse-crunches': {
    id: 'reverse-crunches',
    exerciseName: 'Reverse Crunches',
    uniqueName: 'reverse-crunches',
    pose_analyzer: false, // ❌ Not implemented in backend
    // ... rest
  },
  
  'burpees': {
    id: 'burpees',
    exerciseName: 'Burpees',
    uniqueName: 'burpees',
    pose_analyzer: false, // ❌ Not implemented in backend
    // ... rest
  },
  
  'mountain-climbers': {
    id: 'mountain-climbers',
    exerciseName: 'Mountain Climbers',
    uniqueName: 'mountain-climbers',
    pose_analyzer: false, // ❌ Not implemented in backend
    // ... rest
  },
  
  'kettlebell-swings': {
    id: 'kettlebell-swings',
    exerciseName: 'Kettlebell Swings',
    uniqueName: 'kettlebell-swings',
    pose_analyzer: false, // ❌ Not implemented in backend
    // ... rest
  },
  
  // 'core-stability' could map to existing 'plank'
  'core-stability': {
    id: 'core-stability',
    exerciseName: 'Core Stability',
    uniqueName: 'plank', // ✅ Map to existing plank exercise
    pose_analyzer: true,
    // ... rest
  }
};
```

---

## 📋 Complete Naming Convention Reference

**Pattern**: `kebab-case` (frontend display) → `snake_case` (backend API)

**Rules:**
1. Replace hyphens `-` with underscores `_`
2. Keep all lowercase
3. Watch for singular/plural differences (e.g., `crunches` → `crunch`)
4. Remove `s` from end when backend uses singular form

**Examples:**
- `push-ups` → `pushups`
- `ez-bar-preacher-curls` → `ez_bar_preacher_curls`
- `cable-lat-pulldown` → `cable_lat_pulldown`
- `bulgarian-split-squat` → `bulgarian_split_squat`
