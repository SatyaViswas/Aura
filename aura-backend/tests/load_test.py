"""
Load Testing Script for Araise Backend
Tests server capacity with 100+ concurrent WebSocket connections
Sends realistic coordinate data in real-time
"""

import asyncio
import websockets
import json
import time
import random
import statistics
from datetime import datetime
from typing import List, Dict
import sys


class CoordinateGenerator:
    """Generate realistic coordinate data for different exercises"""
    
    @staticmethod
    def generate_bicep_curl_coords(frame: int) -> Dict:
        """Generate coordinates for bicep curl motion"""
        # Simulate arm curl motion (0-180 degree cycle)
        angle = (frame % 60) * 6  # Complete curl cycle every 60 frames
        flex = abs(90 - angle) / 90  # 0 (extended) to 1 (flexed)
        
        return {
            'right_shoulder': [0.5, 0.3],
            'right_elbow': [0.5 + (0.1 * flex), 0.5],
            'right_wrist': [0.5 + (0.2 * flex), 0.6 + (0.2 * flex)]
        }
    
    @staticmethod
    def generate_squat_coords(frame: int) -> Dict:
        """Generate coordinates for squat motion"""
        # Simulate squat motion
        angle = (frame % 80) * 4.5
        depth = abs(90 - angle) / 90
        
        return {
            'right_hip': [0.5, 0.4],
            'right_knee': [0.5, 0.6 + (0.1 * depth)],
            'right_ankle': [0.5, 0.9]
        }
    
    @staticmethod
    def generate_pushup_coords(frame: int) -> Dict:
        """Generate coordinates for pushup motion"""
        angle = (frame % 70) * 5.14
        depth = abs(90 - angle) / 90
        
        return {
            'right_shoulder': [0.5, 0.3],
            'right_elbow': [0.6, 0.4 + (0.1 * depth)],
            'right_wrist': [0.7, 0.5]
        }
    
    @staticmethod
    def generate_plank_coords(frame: int) -> Dict:
        """Generate coordinates for plank (mostly static with minor movement)"""
        wobble = random.uniform(-0.01, 0.01)
        
        return {
            'right_shoulder': [0.5, 0.3],
            'right_hip': [0.5 + wobble, 0.5],
            'right_knee': [0.5, 0.7]
        }
    
    @staticmethod
    def get_coordinates(exercise: str, frame: int) -> Dict:
        """Get coordinates for any exercise"""
        generators = {
            'biceps': CoordinateGenerator.generate_bicep_curl_coords,
            'squats': CoordinateGenerator.generate_squat_coords,
            'pushups': CoordinateGenerator.generate_pushup_coords,
            'plank': CoordinateGenerator.generate_plank_coords,
        }
        
        generator = generators.get(exercise, CoordinateGenerator.generate_bicep_curl_coords)
        return generator(frame)


class WebSocketClient:
    """Individual WebSocket client for load testing"""
    
    def __init__(self, client_id: int, exercise: str, server_url: str):
        self.client_id = client_id
        self.exercise = exercise
        self.server_url = server_url
        self.frame_count = 0
        self.response_times = []
        self.errors = 0
        self.successful_messages = 0
        
    async def run(self, duration_seconds: int, fps: int = 30):
        """Run the client for specified duration"""
        try:
            uri = f"{self.server_url}/ws/{self.exercise}"
            async with websockets.connect(uri) as websocket:
                print(f"[Client {self.client_id}] Connected to {self.exercise}")
                
                start_time = time.time()
                frame_interval = 1.0 / fps
                
                while (time.time() - start_time) < duration_seconds:
                    frame_start = time.time()
                    
                    # Generate and send coordinates
                    coords = CoordinateGenerator.get_coordinates(self.exercise, self.frame_count)
                    message = json.dumps(coords)
                    
                    try:
                        await websocket.send(message)
                        
                        # Wait for response
                        response = await asyncio.wait_for(websocket.recv(), timeout=1.0)
                        response_time = time.time() - frame_start
                        
                        self.response_times.append(response_time)
                        self.successful_messages += 1
                        self.frame_count += 1
                        
                    except asyncio.TimeoutError:
                        self.errors += 1
                        print(f"[Client {self.client_id}] Timeout on frame {self.frame_count}")
                    except Exception as e:
                        self.errors += 1
                        print(f"[Client {self.client_id}] Error: {e}")
                    
                    # Maintain frame rate
                    elapsed = time.time() - frame_start
                    if elapsed < frame_interval:
                        await asyncio.sleep(frame_interval - elapsed)
                
                print(f"[Client {self.client_id}] Completed {self.frame_count} frames")
                
        except Exception as e:
            print(f"[Client {self.client_id}] Connection error: {e}")
            self.errors += 1
    
    def get_stats(self) -> Dict:
        """Get client statistics"""
        if self.response_times:
            return {
                'client_id': self.client_id,
                'exercise': self.exercise,
                'total_messages': self.successful_messages,
                'errors': self.errors,
                'avg_response_time': statistics.mean(self.response_times),
                'min_response_time': min(self.response_times),
                'max_response_time': max(self.response_times),
                'median_response_time': statistics.median(self.response_times),
            }
        return {
            'client_id': self.client_id,
            'exercise': self.exercise,
            'total_messages': 0,
            'errors': self.errors,
        }


class LoadTester:
    """Main load testing orchestrator"""
    
    def __init__(self, server_url: str = "ws://localhost:8000"):
        self.server_url = server_url
        self.clients: List[WebSocketClient] = []
        
    async def run_load_test(
        self,
        num_clients: int = 100,
        duration_seconds: int = 60,
        exercises: List[str] = None,
        fps: int = 30
    ):
        """
        Run load test with specified parameters
        
        Args:
            num_clients: Number of concurrent clients
            duration_seconds: How long to run the test
            exercises: List of exercises to test (randomly distributed)
            fps: Frames per second to send
        """
        if exercises is None:
            exercises = ['biceps', 'squats', 'pushups', 'plank']
        
        print(f"\n{'='*60}")
        print(f"LOAD TEST CONFIGURATION")
        print(f"{'='*60}")
        print(f"Server URL: {self.server_url}")
        print(f"Concurrent Clients: {num_clients}")
        print(f"Test Duration: {duration_seconds} seconds")
        print(f"Frame Rate: {fps} FPS")
        print(f"Exercises: {', '.join(exercises)}")
        print(f"Expected Total Messages: ~{num_clients * duration_seconds * fps:,}")
        print(f"{'='*60}\n")
        
        # Create clients
        self.clients = []
        for i in range(num_clients):
            exercise = exercises[i % len(exercises)]
            client = WebSocketClient(i + 1, exercise, self.server_url)
            self.clients.append(client)
        
        print(f"Starting {num_clients} clients...\n")
        start_time = time.time()
        
        # Run all clients concurrently
        tasks = [client.run(duration_seconds, fps) for client in self.clients]
        await asyncio.gather(*tasks, return_exceptions=True)
        
        total_time = time.time() - start_time
        
        # Collect and display results
        self._display_results(total_time)
    
    def _display_results(self, total_time: float):
        """Display test results"""
        print(f"\n{'='*60}")
        print(f"LOAD TEST RESULTS")
        print(f"{'='*60}")
        
        # Aggregate statistics
        total_messages = sum(c.successful_messages for c in self.clients)
        total_errors = sum(c.errors for c in self.clients)
        all_response_times = []
        
        for client in self.clients:
            all_response_times.extend(client.response_times)
        
        # Overall stats
        print(f"\nOverall Performance:")
        print(f"  Total Runtime: {total_time:.2f} seconds")
        print(f"  Total Messages Sent: {total_messages:,}")
        print(f"  Total Errors: {total_errors:,}")
        print(f"  Success Rate: {(total_messages / (total_messages + total_errors) * 100):.2f}%")
        print(f"  Messages/Second: {total_messages / total_time:.2f}")
        
        if all_response_times:
            print(f"\nResponse Time Statistics:")
            print(f"  Average: {statistics.mean(all_response_times)*1000:.2f}ms")
            print(f"  Median: {statistics.median(all_response_times)*1000:.2f}ms")
            print(f"  Min: {min(all_response_times)*1000:.2f}ms")
            print(f"  Max: {max(all_response_times)*1000:.2f}ms")
            print(f"  Std Dev: {statistics.stdev(all_response_times)*1000:.2f}ms")
            
            # Percentiles
            sorted_times = sorted(all_response_times)
            p95 = sorted_times[int(len(sorted_times) * 0.95)]
            p99 = sorted_times[int(len(sorted_times) * 0.99)]
            print(f"  95th Percentile: {p95*1000:.2f}ms")
            print(f"  99th Percentile: {p99*1000:.2f}ms")
        
        # Per-exercise breakdown
        exercise_stats = {}
        for client in self.clients:
            ex = client.exercise
            if ex not in exercise_stats:
                exercise_stats[ex] = {
                    'clients': 0,
                    'messages': 0,
                    'errors': 0,
                    'response_times': []
                }
            exercise_stats[ex]['clients'] += 1
            exercise_stats[ex]['messages'] += client.successful_messages
            exercise_stats[ex]['errors'] += client.errors
            exercise_stats[ex]['response_times'].extend(client.response_times)
        
        print(f"\nPer-Exercise Breakdown:")
        for exercise, stats in exercise_stats.items():
            print(f"\n  {exercise.upper()}:")
            print(f"    Clients: {stats['clients']}")
            print(f"    Messages: {stats['messages']:,}")
            print(f"    Errors: {stats['errors']}")
            if stats['response_times']:
                print(f"    Avg Response: {statistics.mean(stats['response_times'])*1000:.2f}ms")
        
        # Performance verdict
        print(f"\n{'='*60}")
        print(f"VERDICT:")
        
        avg_response = statistics.mean(all_response_times) * 1000 if all_response_times else 0
        success_rate = (total_messages / (total_messages + total_errors) * 100) if (total_messages + total_errors) > 0 else 0
        
        if success_rate >= 99 and avg_response < 50:
            print(f"  ✅ EXCELLENT - Server handles load very well!")
        elif success_rate >= 95 and avg_response < 100:
            print(f"  ✅ GOOD - Server performs well under load")
        elif success_rate >= 90 and avg_response < 200:
            print(f"  ⚠️  ACCEPTABLE - Server handles load but could be optimized")
        else:
            print(f"  ❌ POOR - Server struggles with this load level")
        
        print(f"{'='*60}\n")


async def main():
    """Main entry point for load testing"""
    # Configuration
    SERVER_URL = "ws://localhost:8000"
    NUM_CLIENTS = 100
    DURATION_SECONDS = 60
    FPS = 30
    EXERCISES = ['biceps', 'squats', 'pushups', 'plank']
    
    # Parse command line arguments
    if len(sys.argv) > 1:
        NUM_CLIENTS = int(sys.argv[1])
    if len(sys.argv) > 2:
        DURATION_SECONDS = int(sys.argv[2])
    
    # Run load test
    tester = LoadTester(SERVER_URL)
    await tester.run_load_test(
        num_clients=NUM_CLIENTS,
        duration_seconds=DURATION_SECONDS,
        exercises=EXERCISES,
        fps=FPS
    )


if __name__ == "__main__":
    print(f"\n🔥 Araise Backend Load Tester 🔥")
    print(f"Testing real-time coordinate processing")
    print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
    
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n\nTest interrupted by user")
    except Exception as e:
        print(f"\n\nError running test: {e}")
