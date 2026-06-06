# Tests Directory

This directory contains load testing and stress testing tools for the Araise backend server.

## Test Files

### 1. `quick_test.py` - Quick Validation
Run this first to verify your server is working correctly.

```bash
# Start server first
uvicorn main:app --reload

# In another terminal, run quick test
python tests/quick_test.py
```

**What it tests:**
- Single WebSocket connection
- Basic coordinate sending/receiving
- All exercise endpoints

---

### 2. `load_test.py` - Main Load Testing Tool
Comprehensive load testing with 100+ concurrent users.

```bash
# Default: 100 clients, 60 seconds
python tests/load_test.py

# Custom: 150 clients, 120 seconds
python tests/load_test.py 150 120
```

**Features:**
- Simulates realistic coordinate data for each exercise
- Maintains 30 FPS per client
- Measures response times, success rates
- Detailed performance metrics
- Per-exercise breakdown

**Metrics Provided:**
- Total messages sent/received
- Success rate %
- Average/median/min/max response times
- 95th and 99th percentile latency
- Messages per second
- Per-exercise statistics

---

### 3. `stress_test.py` - Progressive Stress Testing
Tests server limits with increasing load levels.

```bash
python tests/stress_test.py
```

**Test Modes:**

**1. Progressive Load**
- Starts at 10 users
- Increases to 25, 50, 100, 150, 200 users
- Identifies breaking point

**2. Spike Test**
- Sudden load spike to 200 users
- Tests server resilience

**3. Sustained Load**
- 100 users for 5 minutes
- Tests long-term stability

**4. All Tests**
- Runs all three modes sequentially
- ~15 minutes total

---

## Requirements

Install dependencies:
```bash
pip install websockets
```

(Already included in your requirements.txt if you have websockets)

---

## Usage Guide

### Step 1: Start Server
```bash
cd C:\Users\chinn\OneDrive\Desktop\Araise_be\araise_backend_code
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Step 2: Quick Validation
```bash
python tests/quick_test.py
```

Expected output:
```
✅ Connected successfully!
✅ Received response
✅ Single connection test PASSED!
```

### Step 3: Run Load Test
```bash
# Test with 100 concurrent users
python tests/load_test.py

# Or custom load
python tests/load_test.py 200 60
```

### Step 4: Stress Test (Optional)
```bash
python tests/stress_test.py
# Select test type from menu
```

---

## Understanding Results

### Good Performance Indicators
✅ Success rate > 99%
✅ Average response time < 50ms
✅ 95th percentile < 100ms
✅ No connection errors

### Warning Signs
⚠️ Success rate 90-95%
⚠️ Average response time 50-200ms
⚠️ Occasional timeouts

### Poor Performance
❌ Success rate < 90%
❌ Average response time > 200ms
❌ Frequent connection failures

---

## Coordinate Data

The test scripts simulate realistic exercise movements:

**Bicep Curl**: Arm flexion/extension cycle
**Squat**: Up/down motion with knee angle changes
**Pushup**: Plank to lowered position
**Plank**: Mostly static with minor natural wobble

Each client sends coordinates at 30 FPS (frames per second), matching real-world webcam frame rates.

---

## Troubleshooting

### "Connection refused"
- Make sure server is running: `uvicorn main:app --reload`
- Check server URL in test script (default: ws://localhost:8000)

### High response times
- Check server CPU usage
- Reduce concurrent clients
- Check network latency

### Test crashes
- Reduce number of clients
- Increase duration between test levels
- Check available memory

---

## Performance Tuning

If tests show poor performance:

1. **Check Server Resources**
   - CPU usage
   - Memory usage
   - Network bandwidth

2. **Optimize Server**
   - Use production ASGI server (Gunicorn + Uvicorn workers)
   - Enable asyncio optimizations
   - Scale horizontally with load balancer

3. **Adjust Test Parameters**
   - Reduce FPS (e.g., 15 FPS instead of 30)
   - Shorter test duration
   - Fewer concurrent clients

---

## Example Output

```
============================================================
LOAD TEST CONFIGURATION
============================================================
Server URL: ws://localhost:8000
Concurrent Clients: 100
Test Duration: 60 seconds
Frame Rate: 30 FPS
Exercises: biceps, squats, pushups, plank
Expected Total Messages: ~180,000
============================================================

[Client 1] Connected to biceps
[Client 2] Connected to squats
...

============================================================
LOAD TEST RESULTS
============================================================

Overall Performance:
  Total Runtime: 60.23 seconds
  Total Messages Sent: 179,850
  Total Errors: 0
  Success Rate: 100.00%
  Messages/Second: 2986.15

Response Time Statistics:
  Average: 12.34ms
  Median: 11.20ms
  Min: 5.10ms
  Max: 45.67ms
  95th Percentile: 23.45ms
  99th Percentile: 38.90ms

============================================================
VERDICT:
  ✅ EXCELLENT - Server handles load very well!
============================================================
```

---

## CI/CD Integration

Add to your CI/CD pipeline:

```yaml
# Example GitHub Actions
- name: Run Load Tests
  run: |
    uvicorn main:app &
    sleep 5
    python tests/load_test.py 50 30
```

---

## Advanced Usage

### Custom Coordinate Generator
Modify `CoordinateGenerator` class in `load_test.py` to add new exercise patterns.

### Custom Test Scenarios
Create new test files using `LoadTester` class as a base.

### Monitoring Integration
Export results to monitoring systems (Prometheus, Grafana, etc.) by parsing the statistics output.
