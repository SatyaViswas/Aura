"""
Stress test with varying load levels
Tests server behavior under increasing concurrent users
"""

import asyncio
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from load_test import LoadTester


async def stress_test_progressive():
    """Run progressive stress test with increasing load"""
    
    server_url = "ws://localhost:8000"
    test_levels = [
        (10, 30, "Warmup"),
        (25, 30, "Light Load"),
        (50, 30, "Medium Load"),
        (100, 60, "Heavy Load"),
        (150, 60, "Stress Test"),
        (200, 60, "Extreme Load"),
    ]
    
    print("\n" + "="*60)
    print("PROGRESSIVE STRESS TEST")
    print("="*60)
    print("\nThis test will progressively increase load to find limits\n")
    
    for clients, duration, label in test_levels:
        print(f"\n{'#'*60}")
        print(f"Level: {label} - {clients} clients")
        print(f"{'#'*60}\n")
        
        tester = LoadTester(server_url)
        await tester.run_load_test(
            num_clients=clients,
            duration_seconds=duration,
            exercises=['biceps', 'squats', 'pushups', 'plank'],
            fps=30
        )
        
        print(f"\n✅ Completed {label}")
        print("Waiting 10 seconds before next level...\n")
        await asyncio.sleep(10)
    
    print("\n" + "="*60)
    print("STRESS TEST COMPLETE")
    print("="*60)


async def stress_test_spike():
    """Test server response to sudden load spike"""
    
    print("\n" + "="*60)
    print("SPIKE TEST - Sudden Load")
    print("="*60)
    print("\nSimulating sudden spike to 200 concurrent users\n")
    
    tester = LoadTester("ws://localhost:8000")
    await tester.run_load_test(
        num_clients=200,
        duration_seconds=30,
        exercises=['biceps', 'squats', 'pushups', 'plank'],
        fps=30
    )


async def stress_test_sustained():
    """Test sustained high load over extended period"""
    
    print("\n" + "="*60)
    print("SUSTAINED LOAD TEST - 5 Minutes")
    print("="*60)
    print("\n100 users for 5 minutes\n")
    
    tester = LoadTester("ws://localhost:8000")
    await tester.run_load_test(
        num_clients=100,
        duration_seconds=300,  # 5 minutes
        exercises=['biceps', 'squats', 'pushups', 'plank'],
        fps=30
    )


if __name__ == "__main__":
    print("\n🔥 Stress Test Suite 🔥\n")
    print("Select test type:")
    print("1. Progressive Load (10 → 200 users)")
    print("2. Spike Test (sudden 200 users)")
    print("3. Sustained Load (100 users, 5 minutes)")
    print("4. All tests")
    
    choice = input("\nEnter choice (1-4): ").strip()
    
    try:
        if choice == "1":
            asyncio.run(stress_test_progressive())
        elif choice == "2":
            asyncio.run(stress_test_spike())
        elif choice == "3":
            asyncio.run(stress_test_sustained())
        elif choice == "4":
            print("\n⚠️  Running all tests will take ~15 minutes\n")
            confirm = input("Continue? (y/n): ").strip().lower()
            if confirm == 'y':
                asyncio.run(stress_test_progressive())
                asyncio.run(stress_test_spike())
                asyncio.run(stress_test_sustained())
        else:
            print("Invalid choice")
    except KeyboardInterrupt:
        print("\n\nTest interrupted")
    except Exception as e:
        print(f"\n\nError: {e}")
