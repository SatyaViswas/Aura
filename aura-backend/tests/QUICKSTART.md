# 🧪 Quick Start - Load Testing Guide

## Prerequisites
✅ Server running on port 8000
✅ Test dependencies installed

---

## Step-by-Step Testing

### 1️⃣ Start Your Server
Open a terminal:
```powershell
cd C:\Users\chinn\OneDrive\Desktop\Araise_be\araise_backend_code
uvicorn main:app --reload
```

Wait for: `Application startup complete.`

---

### 2️⃣ Quick Validation Test (30 seconds)
Open a **NEW** terminal:
```powershell
cd C:\Users\chinn\OneDrive\Desktop\Araise_be\araise_backend_code
python tests/quick_test.py
```

**Expected Output:**
```
✅ Connected successfully!
✅ Received response
✅ Single connection test PASSED!
✅ BICEPS: Connected and responding
✅ SQUATS: Connected and responding
✅ PUSHUPS: Connected and responding
✅ PLANK: Connected and responding
```

---

### 3️⃣ Load Test - 100 Concurrent Users (1 minute)
```powershell
python tests/load_test.py
```

This simulates **100 real users** sending coordinates at **30 FPS** for **60 seconds**.

**What happens:**
- Creates 100 WebSocket connections
- Sends ~180,000 coordinate messages
- Measures response times
- Calculates success rate

**Expected Output:**
```
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
  ...

VERDICT:
  ✅ EXCELLENT - Server handles load very well!
============================================================
```

---

### 4️⃣ Custom Load Test
Test with different parameters:

```powershell
# 150 users for 2 minutes
python tests/load_test.py 150 120

# 50 users for 30 seconds
python tests/load_test.py 50 30

# 200 users for 1 minute
python tests/load_test.py 200 60
```

---

### 5️⃣ Stress Test (Optional - 15 minutes)
Progressive test from 10 to 200 users:

```powershell
python tests/stress_test.py
```

Select option:
- **1** - Progressive Load (recommended)
- **2** - Spike Test (sudden 200 users)
- **3** - Sustained Load (5 minutes)
- **4** - All tests

---

## Interpreting Results

### 🟢 Excellent Performance
```
Success Rate: 99%+
Avg Response: < 50ms
95th Percentile: < 100ms
VERDICT: ✅ EXCELLENT
```
**Meaning:** Your server can easily handle 100+ concurrent users!

### 🟡 Good Performance
```
Success Rate: 95-99%
Avg Response: 50-100ms
95th Percentile: 100-200ms
VERDICT: ✅ GOOD
```
**Meaning:** Server performs well, minor optimization possible.

### 🟠 Acceptable Performance
```
Success Rate: 90-95%
Avg Response: 100-200ms
95th Percentile: 200-500ms
VERDICT: ⚠️ ACCEPTABLE
```
**Meaning:** Server handles load but could use optimization.

### 🔴 Poor Performance
```
Success Rate: < 90%
Avg Response: > 200ms
Many timeouts/errors
VERDICT: ❌ POOR
```
**Meaning:** Server struggles. Reduce load or optimize code.

---

## What Each Metric Means

### Success Rate
- Percentage of messages successfully processed
- **Target:** 99%+ 
- Below 95% indicates issues

### Average Response Time
- How long server takes to respond
- **Target:** < 50ms
- Above 200ms indicates slowness

### 95th Percentile
- 95% of requests are faster than this
- **Target:** < 100ms
- Indicates "worst case" performance

### Messages/Second
- Throughput of server
- Higher is better
- Shows processing capacity

---

## Troubleshooting

### "Connection refused"
**Problem:** Server not running
**Solution:** Start server with `uvicorn main:app --reload`

### High Response Times
**Problem:** Server overloaded
**Solutions:**
- Reduce concurrent users
- Check CPU/memory usage
- Use production ASGI server

### Many Errors/Timeouts
**Problem:** Server can't handle load
**Solutions:**
- Reduce test duration
- Lower FPS from 30 to 15
- Optimize exercise processing code

### Test Crashes
**Problem:** Out of resources
**Solutions:**
- Close other applications
- Reduce number of clients
- Add delays between tests

---

## Real-World Comparison

**Test Scenario:** 100 users, 30 FPS, 60 seconds

This simulates:
- 100 people using your app simultaneously
- Each tracking exercise in real-time
- Sending webcam data 30 times per second
- For 1 minute straight

**Real App Usage:**
- Peak hours: ~50-100 concurrent users expected
- Average: ~20-30 concurrent users
- Test passes = production ready! ✅

---

## Next Steps After Testing

### If Tests Pass ✅
1. Your server is production-ready!
2. Consider horizontal scaling for 200+ users
3. Add monitoring (Grafana, Prometheus)
4. Set up load balancer for high availability

### If Tests Fail ❌
1. Profile code to find bottlenecks
2. Optimize slow exercise classes
3. Add caching for repeated calculations
4. Consider Redis for session management
5. Use Gunicorn with multiple workers

---

## Example Test Session

```powershell
# Terminal 1 - Start server
PS> uvicorn main:app --reload
INFO:     Uvicorn running on http://127.0.0.1:8000

# Terminal 2 - Run tests
PS> python tests/quick_test.py
✅ All tests passed!

PS> python tests/load_test.py
Testing 100 users...
[Results display]
✅ EXCELLENT - Server handles load very well!

PS> python tests/load_test.py 150 60
Testing 150 users...
[Results display]
✅ GOOD - Server performs well under load
```

---

## Production Deployment

After successful tests, deploy with:

```bash
# Install production server
pip install gunicorn

# Run with multiple workers
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

**4 workers** = can handle 400+ concurrent users!

---

## Questions?

- **What's FPS?** Frames Per Second - how often coordinates are sent
- **Why 30 FPS?** Matches typical webcam frame rate
- **Can I test more than 200 users?** Yes, but may need more powerful server
- **How long should tests run?** 60 seconds is standard, 300 for stability testing

---

## Summary

✅ **quick_test.py** - Verify server works (30 seconds)
✅ **load_test.py** - Test 100 concurrent users (1 minute)  
✅ **stress_test.py** - Find server limits (15 minutes)
✅ **test_exercises.py** - Unit test exercise logic

**Ready to test!** 🚀
