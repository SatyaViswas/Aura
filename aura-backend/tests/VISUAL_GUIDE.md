# 🎯 How to Use - Visual Guide

## Setup (One Time)

```
┌─────────────────────────────────────────────────┐
│  1. Your server is already set up! ✅          │
│  2. Dependencies installed ✅                   │
│  3. Tests ready to run ✅                       │
└─────────────────────────────────────────────────┘
```

---

## Testing Workflow

```
┌──────────────┐
│  Terminal 1  │ 
│              │
│  Start       │──┐
│  Server      │  │
└──────────────┘  │
                  │
                  ├─→  Server runs on localhost:8000
                  │
┌──────────────┐  │
│  Terminal 2  │  │
│              │  │
│  Run Tests   │←─┘
└──────────────┘
```

---

## Step-by-Step Visual

### 🔵 Step 1: Start Server

```powershell
PS> cd C:\Users\chinn\OneDrive\Desktop\Araise_be\araise_backend_code
PS> uvicorn main:app --reload

INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.  ← Wait for this!
```

---

### 🟢 Step 2: Quick Test (Open New Terminal)

```powershell
PS> cd C:\Users\chinn\OneDrive\Desktop\Araise_be\araise_backend_code
PS> python tests/quick_test.py

🧪 Quick WebSocket Test

Connecting to ws://localhost:8000/ws/biceps...
✅ Connected successfully!

Sending test coordinates...
✅ Received response

✅ Single connection test PASSED!

Testing multiple exercise endpoints...
==================================================
✅ BICEPS: Connected and responding
✅ SQUATS: Connected and responding
✅ PUSHUPS: Connected and responding
✅ PLANK: Connected and responding
==================================================
```

---

### 🔴 Step 3: Load Test - 100 Users

```powershell
PS> python tests/load_test.py

🔥 Araise Backend Load Tester 🔥
============================================================
LOAD TEST CONFIGURATION
============================================================
Server URL: ws://localhost:8000
Concurrent Clients: 100
Test Duration: 60 seconds
Frame Rate: 30 FPS
Expected Total Messages: ~180,000
============================================================

Starting 100 clients...

[Client 1] Connected to biceps
[Client 2] Connected to squats
...
[Client 100] Connected to plank

[Progress happening in real-time...]

[Client 1] Completed 1800 frames
[Client 2] Completed 1800 frames
...

============================================================
LOAD TEST RESULTS
============================================================

Overall Performance:
  Total Runtime: 60.23 seconds
  Total Messages Sent: 179,850
  Total Errors: 0
  Success Rate: 100.00%  ← Should be 99%+
  Messages/Second: 2,986.15  ← Higher is better

Response Time Statistics:
  Average: 12.34ms  ← Should be < 50ms
  Median: 11.20ms
  95th Percentile: 23.45ms  ← Should be < 100ms

============================================================
VERDICT:
  ✅ EXCELLENT - Server handles load very well!
============================================================
```

---

## Test Result Interpretation

```
┌─────────────────────────────────────────────┐
│  Success Rate    │  Response Time │ Verdict │
├─────────────────────────────────────────────┤
│  99-100%         │  < 50ms        │ ✅ EXCELLENT │
│  95-99%          │  50-100ms      │ ✅ GOOD      │
│  90-95%          │  100-200ms     │ ⚠️ OK        │
│  < 90%           │  > 200ms       │ ❌ POOR      │
└─────────────────────────────────────────────┘
```

---

## Different Test Scenarios

### 🟢 Quick Test (50 users, 30 sec)
```powershell
python tests/load_test.py 50 30
```
**Use when:** Quick validation, rapid testing

---

### 🟡 Standard Test (100 users, 60 sec)
```powershell
python tests/load_test.py
```
**Use when:** Standard load testing, typical peak hours

---

### 🟠 Heavy Test (150 users, 120 sec)
```powershell
python tests/load_test.py 150 120
```
**Use when:** Testing higher capacity, future-proofing

---

### 🔴 Stress Test (10 → 200 users)
```powershell
python tests/stress_test.py
# Select option 1
```
**Use when:** Finding maximum capacity, identifying breaking point

---

## Test Data Flow

```
Client 1 ─┐
Client 2 ─┤
Client 3 ─┤
   ...    ├──→ WebSocket ──→ Server ──→ Exercise Class ──→ Response
Client 98 ─┤                                │
Client 99 ─┤                                ├→ Calculate angle
Client 100 ┘                                ├→ Count reps
                                            └→ Generate feedback

At 30 FPS (Frames Per Second)
↓
100 clients × 30 FPS = 3,000 messages/second
                       ↓
                 Server must process all in real-time!
```

---

## What Each Test Does

### `quick_test.py`
```
┌──────────────┐
│ Quick Test   │
├──────────────┤
│ Connects: 1  │
│ Duration: 5s │
│ Purpose:     │
│ - Verify     │
│ - Validate   │
│ - Smoke test │
└──────────────┘
```

### `load_test.py`
```
┌──────────────────┐
│ Load Test        │
├──────────────────┤
│ Connects: 100    │
│ Duration: 60s    │
│ Messages: 180k   │
│ Purpose:         │
│ - Performance    │
│ - Concurrency    │
│ - Real-world sim │
└──────────────────┘
```

### `stress_test.py`
```
┌──────────────────────┐
│ Stress Test          │
├──────────────────────┤
│ Progressive:         │
│ 10→25→50→100→150→200│
│ Duration: 15min      │
│ Purpose:             │
│ - Find limits        │
│ - Breaking point     │
│ - Max capacity       │
└──────────────────────┘
```

---

## Expected Timeline

```
Time    | Action
─────────┼────────────────────────────
0:00    │ Start server
0:10    │ Server ready
0:15    │ Run quick_test.py
0:45    │ Quick test passes ✅
1:00    │ Run load_test.py (100 users)
2:00    │ Load test completes
2:05    │ Review results
2:10    │ All tests passed! 🎉
```

---

## Real-World Comparison

### Your Test
```
100 users × 30 FPS × 60 seconds = 180,000 messages
```

### Real Gym App
```
Peak hour: 50-100 users exercising
Each sends: 30 coordinates/second
Server processes: Same as your test! ✅
```

**If test passes → Production ready!**

---

## Command Cheat Sheet

```powershell
# Start server
uvicorn main:app --reload

# Quick test (30 sec)
python tests/quick_test.py

# Standard load test (60 sec, 100 users)
python tests/load_test.py

# Custom load test
python tests/load_test.py [users] [seconds]

# Examples:
python tests/load_test.py 50 30      # 50 users, 30 sec
python tests/load_test.py 150 120    # 150 users, 120 sec
python tests/load_test.py 200 60     # 200 users, 60 sec

# Stress test
python tests/stress_test.py

# Unit tests
python tests/test_exercises.py
pytest tests/test_exercises.py
```

---

## Success Indicators

### ✅ All Good!
```
Success Rate: 100.00% ✅
Average Response: 12.34ms ✅
95th Percentile: 23.45ms ✅
No errors ✅
VERDICT: EXCELLENT ✅
```

### ⚠️ Needs Attention
```
Success Rate: 92% ⚠️
Average Response: 150ms ⚠️
Some timeouts ⚠️
VERDICT: ACCEPTABLE ⚠️
```

### ❌ Issues
```
Success Rate: 85% ❌
Average Response: 300ms ❌
Many errors ❌
VERDICT: POOR ❌
```

---

## Quick Troubleshooting

```
Problem                  → Solution
──────────────────────────────────────────────
Connection refused       → Start server
High response times      → Reduce load
Many errors              → Check server logs
Test crashes             → Reduce clients
"Module not found"       → pip install websockets
```

---

## Final Checklist

```
□ Server started
□ Quick test passed
□ Load test run
□ Results reviewed
□ Success rate > 99%
□ Response time < 50ms
□ Ready for production! 🚀
```

---

## Visual Summary

```
        Start Server
             │
             ▼
        Quick Test ──→ PASS ✅
             │
             ▼
      Load Test (100) ──→ EXCELLENT ✅
             │
             ▼
     (Optional) Stress Test
             │
             ▼
    ✅ PRODUCTION READY! 🎉
```

---

**You're all set!** 🚀 Your testing infrastructure is ready to validate that your server can handle 100+ concurrent users in real-time!
