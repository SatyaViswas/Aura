"""
Quick test script to verify single WebSocket connection
Use this before running full load tests
"""

import asyncio
import websockets
import json


async def test_single_connection():
    """Test a single WebSocket connection"""
    uri = "ws://localhost:8000/ws/biceps"
    
    try:
        print(f"Connecting to {uri}...")
        async with websockets.connect(uri) as websocket:
            print("✅ Connected successfully!")
            
            # Send a test coordinate
            test_coords = {
                'right_shoulder': [0.5, 0.3],
                'right_elbow': [0.5, 0.5],
                'right_wrist': [0.5, 0.7]
            }
            
            print(f"\nSending test coordinates: {test_coords}")
            await websocket.send(json.dumps(test_coords))
            
            # Receive response
            response = await asyncio.wait_for(websocket.recv(), timeout=5.0)
            print(f"✅ Received response: {response}")
            
            # Parse response
            data = json.loads(response)
            print(f"\nParsed data:")
            print(f"  Counter: {data.get('counter', 'N/A')}")
            print(f"  Feedback: {data.get('feedback', 'N/A')}")
            print(f"  Angle: {data.get('angle', 'N/A')}")
            print(f"  Stage: {data.get('stage', 'N/A')}")
            
            print("\n✅ Single connection test PASSED!")
            return True
            
    except Exception as e:
        print(f"\n❌ Test FAILED: {e}")
        return False


async def test_multiple_exercises():
    """Test connections to different exercise endpoints"""
    exercises = ['biceps', 'squats', 'pushups', 'plank']
    
    print("\nTesting multiple exercise endpoints...")
    print("="*50)
    
    for exercise in exercises:
        uri = f"ws://localhost:8000/ws/{exercise}"
        try:
            async with websockets.connect(uri) as websocket:
                coords = {
                    'right_shoulder': [0.5, 0.3],
                    'right_elbow': [0.5, 0.5],
                    'right_wrist': [0.5, 0.7],
                    'right_hip': [0.5, 0.4],
                    'right_knee': [0.5, 0.6],
                    'right_ankle': [0.5, 0.9]
                }
                
                await websocket.send(json.dumps(coords))
                response = await asyncio.wait_for(websocket.recv(), timeout=2.0)
                
                print(f"✅ {exercise.upper()}: Connected and responding")
                
        except Exception as e:
            print(f"❌ {exercise.upper()}: Failed - {e}")
    
    print("="*50)


if __name__ == "__main__":
    print("🧪 Quick WebSocket Test\n")
    print("Make sure your server is running on http://localhost:8000\n")
    
    asyncio.run(test_single_connection())
    print("\n")
    asyncio.run(test_multiple_exercises())
