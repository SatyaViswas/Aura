from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
import edge_tts
import json
import logging
import uuid
import asyncio
from typing import Dict, Any, Optional
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genAI
from exercises import (
    # Upper body
    BicepCurlCoordinates,
    PushupCoordinates,
    BenchPressCoordinates,
    RopePulldownCoordinates,
    BentTricepPullCoordinates,
    PullupCoordinates,
    ChestSupportedRowCoordinates,
    WideGripPulldownCoordinates,
    # Chest
    InclineDumbbellPressCoordinates,
    InclineBarbellBenchPressCoordinates,
    FlatBarbellBenchPressCoordinates,
    RopePulldownChestCoordinates,
    ChestFlyesCoordinates,
    ChestDipsCoordinates,
    # Back
    NeutralGripPullupCoordinates,
    CableLatPulldownCoordinates,
    NeutralGripPulldownCoordinates,
    HorizontalNeutralGripRowCoordinates,
    WeightedPullupCoordinates,
    BarbellBentOverRowCoordinates,
    LatPulldownCoordinates,
    SeatedCableRowCoordinates,
    DeadliftCoordinates,
    # Lower body
    SquatCoordinates,
    LegPressCoordinates,
    LegPressWideStanceCoordinates,
    LegPressFeetHighCoordinates,
    BackSquatCoordinates,
    RomanianDeadliftCoordinates,
    HipThrustCoordinates,
    BulgarianSplitSquatCoordinates,
    LightSquatsCoordinates,
    BoxJumpsCoordinates,
    # Core
    PlankCoordinates,
    CrunchCoordinates,
    # Shoulders
    ChestSupportedShoulderPressCoordinates,
    OverheadShoulderPressCoordinates,
    CableLateralRaisesCoordinates,
    CableRopePressCoordinates,
    FrontRaisesCoordinates,
    DumbbellLateralRaisesCoordinates,
    RearDeltFlyCoordinates,
    ShoulderPressCoordinates,
    SeatedOverheadPressCoordinates,
    CableRopeFacePullCoordinates,
    # Biceps
    EZBarPreacherCurlsCoordinates,
    InclineDumbbellCurlsCoordinates,
    HammerCurlsCoordinates,
    BarbellCurlsCoordinates,
    # Triceps
    TricepExtensionPushupsCoordinates,
    TricepRopePulldownCoordinates,
    TricepRopePushdownCoordinates,
)
import os
from utils.redis_client import redis_client
from config import config
import io

logging.basicConfig(level=logging.INFO)

# Configure Google Generative AI
api_key = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY") or os.getenv("VITE_GEMINI_API_KEY")
if not api_key:
    # Try loading from the frontend's .env file in the parent directory
    parent_env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".env")
    if os.path.exists(parent_env_path):
        try:
            from dotenv import dotenv_values
            parent_env = dotenv_values(parent_env_path)
            api_key = parent_env.get("VITE_GEMINI_API_KEY") or parent_env.get("GOOGLE_API_KEY") or parent_env.get("GEMINI_API_KEY")
        except Exception as e:
            logging.error(f"Error reading parent .env: {e}")

if api_key:
    genAI.configure(api_key=api_key)
    logging.info("✨ Google Generative AI configured successfully.")
else:
    logging.warning("⚠️ GOOGLE_API_KEY could not be found in the backend environment setup!")


app = FastAPI()

ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS", 
    "http://localhost:5173"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Type", "Content-Disposition"]
)

@app.on_event("startup")
async def startup_event():
    """Initialize Redis connection on startup"""
    await redis_client.connect()
    logging.info("🚀 Application startup complete")


@app.on_event("shutdown")
async def shutdown_event():
    """Close Redis connection on shutdown"""
    await redis_client.disconnect()
    logging.info("👋 Application shutdown complete")


class FastConnectionManager:
    """Manage multiple WebSocket connections with isolated exercise instances"""
    
    def __init__(self):
        self.active_connections: Dict[str, Dict[str, Any]] = {}
    
    def connect(self, websocket: WebSocket, exercise: str, user_id: str) -> str:
        """Create a new connection with unique exercise instances"""
        connection_id = str(uuid.uuid4())
        
        # ✅ CLEANED: 54 unique exercises (duplicates removed)
        exercise_instances = {
            # CHEST EXERCISES (8)
            "push-ups": PushupCoordinates(user_id=user_id),
            "incline-dumbbell-press": InclineDumbbellPressCoordinates(user_id=user_id),
            "incline-barbell-bench-press": InclineBarbellBenchPressCoordinates(user_id=user_id),
            "flat-barbell-bench-press": FlatBarbellBenchPressCoordinates(user_id=user_id),
            "bench_press": BenchPressCoordinates(user_id=user_id),
            "rope-pulldown-chest": RopePulldownChestCoordinates(user_id=user_id),
            "chest-flyes": ChestFlyesCoordinates(user_id=user_id),
            "chest-dips": ChestDipsCoordinates(user_id=user_id),
            
            # BACK & LATS EXERCISES (13)
            "wide-grip-pull-ups": WideGripPulldownCoordinates(user_id=user_id),
            "neutral-grip-pull-ups": NeutralGripPullupCoordinates(user_id=user_id),
            "chest-supported-rows": ChestSupportedRowCoordinates(user_id=user_id),
            "cable-lat-pulldown": CableLatPulldownCoordinates(user_id=user_id),
            "neutral-grip-pulldown": NeutralGripPulldownCoordinates(user_id=user_id),
            "horizontal-neutral-grip-row": HorizontalNeutralGripRowCoordinates(user_id=user_id),
            "weighted-pull-ups": WeightedPullupCoordinates(user_id=user_id),
            "barbell-bent-over-row": BarbellBentOverRowCoordinates(user_id=user_id),
            "lat-pulldown": LatPulldownCoordinates(user_id=user_id),
            "pull-ups": PullupCoordinates(user_id=user_id),
            "seated-cable-row": SeatedCableRowCoordinates(user_id=user_id),
            "deadlifts": DeadliftCoordinates(user_id=user_id),
            "deadlift_trap_bar": DeadliftCoordinates(user_id=user_id),
            
            # LEGS EXERCISES (11)
            "squats": SquatCoordinates(user_id=user_id),
            "leg-press": LegPressCoordinates(user_id=user_id),
            "leg_press_close_stance": LegPressCoordinates(user_id=user_id),
            "leg_press_wide_stance": LegPressWideStanceCoordinates(user_id=user_id),
            "leg_press_feet_high": LegPressFeetHighCoordinates(user_id=user_id),
            "back-squat": BackSquatCoordinates(user_id=user_id),
            "romanian-deadlift": RomanianDeadliftCoordinates(user_id=user_id),
            "hip-thrust": HipThrustCoordinates(user_id=user_id),
            "bulgarian-split-squat": BulgarianSplitSquatCoordinates(user_id=user_id),
            "light-squats": LightSquatsCoordinates(user_id=user_id),
            "box-jumps": BoxJumpsCoordinates(user_id=user_id),
            
            # SHOULDERS EXERCISES (10)
            "chest-supported-shoulder-press": ChestSupportedShoulderPressCoordinates(user_id=user_id),
            "cable-lateral-raises": CableLateralRaisesCoordinates(user_id=user_id),
            "overhead-shoulder-press": OverheadShoulderPressCoordinates(user_id=user_id),
            "cable-rope-press": CableRopePressCoordinates(user_id=user_id),
            "front-raises": FrontRaisesCoordinates(user_id=user_id),
            "dumbbell-lateral-raises": DumbbellLateralRaisesCoordinates(user_id=user_id),
            "rear-delt-fly": RearDeltFlyCoordinates(user_id=user_id),
            "shoulder-press": ShoulderPressCoordinates(user_id=user_id),
            "seated-overhead-press": SeatedOverheadPressCoordinates(user_id=user_id),
            "cable_rope_face_pull": CableRopeFacePullCoordinates(user_id=user_id),
            
            # BICEPS EXERCISES (5)
            "ezbar-preacher-curls": EZBarPreacherCurlsCoordinates(user_id=user_id),
            "incline-dumbbell-curls": InclineDumbbellCurlsCoordinates(user_id=user_id),
            "hammer-curls": HammerCurlsCoordinates(user_id=user_id),
            "barbell-curls": BarbellCurlsCoordinates(user_id=user_id),
            "bicep_curl": BicepCurlCoordinates(user_id=user_id),
            
            # TRICEPS EXERCISES (4)
            "tricep-extension-push-ups": TricepExtensionPushupsCoordinates(user_id=user_id),
            "bent-tricep-pull": BentTricepPullCoordinates(user_id=user_id),
            "tricep-rope-pulldown": TricepRopePulldownCoordinates(user_id=user_id),
            "tricep_rope_pushdown": TricepRopePushdownCoordinates(user_id=user_id),
            
            # CORE EXERCISES (2)
            "plank": PlankCoordinates(user_id=user_id),
            "crunches": CrunchCoordinates(user_id=user_id),
        }
        
        self.active_connections[connection_id] = {
            "websocket": websocket,
            "exercise": exercise,
            "exercise_instances": exercise_instances,
            "current_instance": exercise_instances.get(exercise)
        }
        
        logging.info(f"New connection {connection_id} for exercise: {exercise}")
        return connection_id
    
    def disconnect(self, connection_id: str):
        """Remove connection and clean up resources"""
        if connection_id in self.active_connections:
            exercise = self.active_connections[connection_id]["exercise"]
            del self.active_connections[connection_id]
            logging.info(f"Connection {connection_id} disconnected from exercise: {exercise}")
    
    def get_connection(self, connection_id: str) -> Dict[str, Any]:
        """Get connection data"""
        return self.active_connections.get(connection_id)
    
    def get_stats(self) -> Dict[str, int]:
        """Get connection statistics"""
        stats = {"total": len(self.active_connections)}
        for conn_data in self.active_connections.values():
            exercise = conn_data["exercise"]
            stats[exercise] = stats.get(exercise, 0) + 1
        return stats

# Global connection manager
manager = FastConnectionManager()

@app.get("/")
async def root():
    return {
        "message": "Fast Coordinate-based Exercise Server",
        "mode": "coordinates",
        "redis_enabled": redis_client.is_available(),
        "version": "2.0"
    }

@app.get("/stats")
async def get_stats():
    """Get current connection statistics"""
    return {
        "stats": manager.get_stats(),
        "server": "coordinate_processor"
    }

@app.get("/exercises")
async def get_all_exercises():
    """Get list of all available exercises with their unique identifiers"""
    return {
        "total_exercises": 53,
        "exercises": {
            "chest": [
                {"id": "push-ups", "name": "Push-ups", "has_video": True},
                {"id": "incline-dumbbell-press", "name": "Incline Dumbbell Press", "has_video": True},
                {"id": "incline-barbell-bench-press", "name": "Incline Barbell Bench Press", "has_video": True},
                {"id": "flat-barbell-bench-press", "name": "Flat Barbell Bench Press", "has_video": True},
                {"id": "bench_press", "name": "Bench Press", "has_video": True},
                {"id": "rope-pulldown-chest", "name": "Rope Pulldown (Chest)", "has_video": True},
                {"id": "chest-flyes", "name": "Chest Flyes", "has_video": True},
                {"id": "chest-dips", "name": "Chest Dips (leaning forward)", "has_video": False}
            ],
            "back": [
                {"id": "wide-grip-pull-ups", "name": "Wide Grip Pull-ups", "has_video": True},
                {"id": "neutral-grip-pull-ups", "name": "Neutral Grip Pull-ups", "has_video": True},
                {"id": "chest-supported-rows", "name": "Chest Supported Row", "has_video": True},
                {"id": "cable-lat-pulldown", "name": "Cable Lat Pulldown", "has_video": True},
                {"id": "neutral-grip-pulldown", "name": "Neutral Grip Pulldown", "has_video": True},
                {"id": "horizontal-neutral-grip-row", "name": "Horizontal Neutral Grip Row", "has_video": True},
                {"id": "weighted-pull-ups", "name": "Weighted Pull-ups", "has_video": True},
                {"id": "barbell-bent-over-row", "name": "Barbell Bent-over Row", "has_video": True},
                {"id": "lat-pulldown", "name": "Lat Pulldown", "has_video": True},
                {"id": "pull-ups", "name": "Pull-ups", "has_video": True},
                {"id": "seated-cable-row", "name": "Seated Cable Row", "has_video": True},
                {"id": "deadlifts", "name": "Deadlift (Conventional)", "has_video": False},
                {"id": "deadlift_trap_bar", "name": "Deadlift (Trap Bar)", "has_video": False}
            ],
            "legs": [
                {"id": "squats", "name": "Squats", "has_video": True},
                {"id": "leg-press", "name": "Leg Press", "has_video": True},
                {"id": "leg_press_close_stance", "name": "Leg Press (Close Stance)", "has_video": True},
                {"id": "leg_press_wide_stance", "name": "Leg Press (Wide Stance)", "has_video": True},
                {"id": "leg_press_feet_high", "name": "Leg Press (Feet High)", "has_video": True},
                {"id": "back-squat", "name": "Back Squat", "has_video": True},
                {"id": "romanian-deadlift", "name": "Romanian Deadlift (RDL)", "has_video": False},
                {"id": "hip-thrust", "name": "Hip Thrust", "has_video": False},
                {"id": "bulgarian-split-squat", "name": "Bulgarian Split Squat", "has_video": False},
                {"id": "light-squats", "name": "Light Squats", "has_video": True},
                {"id": "box-jumps", "name": "Box Jumps", "has_video": False}
            ],
            "shoulders": [
                {"id": "chest-supported-shoulder-press", "name": "Chest Supported Shoulder Press", "has_video": True},
                {"id": "cable-lateral-raises", "name": "Cable Lateral Raises", "has_video": True},
                {"id": "overhead-shoulder-press", "name": "Overhead Shoulder Press", "has_video": True},
                {"id": "cable-rope-press", "name": "Cable Rope Press", "has_video": True},
                {"id": "front-raises", "name": "Front Raises", "has_video": True},
                {"id": "dumbbell-lateral-raises", "name": "Dumbbell Lateral Raises", "has_video": True},
                {"id": "rear-delt-fly", "name": "Rear Delt Fly", "has_video": True},
                {"id": "shoulder-press", "name": "Shoulder Press", "has_video": True},
                {"id": "seated-overhead-press", "name": "Seated Overhead Press", "has_video": True},
                {"id": "cable_rope_face_pull", "name": "Cable Rope Face Pull", "has_video": True}
            ],
            "biceps": [
                {"id": "ezbar-preacher-curls", "name": "EZ Bar Preacher Curls", "has_video": True},
                {"id": "incline-dumbbell-curls", "name": "Incline Dumbbell Curls", "has_video": True},
                {"id": "hammer-curls", "name": "Hammer Curls", "has_video": True},
                {"id": "barbell-curls", "name": "Barbell Curls", "has_video": True},
                {"id": "bicep_curl", "name": "Bicep Curl", "has_video": True}
            ],
            "triceps": [
                {"id": "tricep-extension-push-ups", "name": "Tricep Extension Push-ups", "has_video": True},
                {"id": "bent-tricep-pull", "name": "Bent Tricep Pull", "has_video": True},
                {"id": "tricep-rope-pulldown", "name": "Tricep Rope Pulldown", "has_video": True},
                {"id": "tricep_rope_pushdown", "name": "Tricep Rope Pushdown", "has_video": True}
            ],
            "core": [
                {"id": "plank", "name": "Plank", "has_video": True},
                {"id": "crunches", "name": "Crunches", "has_video": True}
            ]
        },
        "usage": "Use the 'id' field to connect: ws://your-server/ws/{exercise_id}?user_id=your_user_id",
        "note": "Removed duplicate aliases for cleaner API. Total: 53 unique exercises."
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    redis_status = "connected" if redis_client.is_available() else "disconnected"
    
    return {
        "status": "healthy",
        "mode": "coordinate_processing",
        "active_connections": len(manager.active_connections),
        "redis_status": redis_status,
        "features": {
            "state_persistence": redis_client.is_available(),
            "workout_history": config.ENABLE_WORKOUT_HISTORY,
            "leaderboards": config.ENABLE_LEADERBOARDS
        }
    }

@app.websocket("/ws/{exercise}")
async def websocket_endpoint(websocket: WebSocket, exercise: str, user_id: str = None):
    await websocket.accept()
    
    # Generate user_id if not provided
    if not user_id:
        user_id = str(uuid.uuid4())
    
    # Create a unique connection with dedicated exercise instances
    connection_id = manager.connect(websocket, exercise, user_id)
    connection_data = manager.get_connection(connection_id)
    
    if not connection_data:
        await websocket.close(code=1003)
        return
    
    current_exercise_instance = connection_data["current_instance"]
    
    if not current_exercise_instance:
        await websocket.send_json({"error": f"Exercise '{exercise}' not supported"})
        await websocket.close(code=1003)
        return

    try:
        while True:
            # Receive coordinates from client
            data = await websocket.receive_text()
            if not data:
                continue

            try:
                # Parse coordinate data
                coordinate_data = json.loads(data)
                
                # Validate coordinate data format
                if not isinstance(coordinate_data, dict) or 'coordinates' not in coordinate_data:
                    await websocket.send_json({
                        "error": "Invalid data format. Expected: {'coordinates': {...}}"
                    })
                    continue
                
                coordinates = coordinate_data['coordinates']
                
                # Process coordinates super fast (no video processing!)
                reps, feedback, angle, stage = current_exercise_instance.process_coordinates(coordinates)
                
                # Instant response with exercise data
                response = {
                    "exercise": exercise,
                    "reps": reps,
                    "feedback": feedback,
                    "angle": angle,
                    "stage": stage,
                    "connection_id": connection_id[:8],  # Short ID for debugging
                    "processed_at": asyncio.get_event_loop().time()
                }
                
                await websocket.send_json(response)
                
            except json.JSONDecodeError:
                await websocket.send_json({"error": "Invalid JSON format"})
                continue
            except Exception as e:
                logging.error(f"Processing error for connection {connection_id}: {e}")
                await websocket.send_json({"error": "Processing error"})
                continue

    except WebSocketDisconnect:
        logging.info(f"WebSocket disconnected: {connection_id}")
    except Exception as e:
        logging.error(f"WebSocket error for connection {connection_id}: {e}")
    finally:
        # Always clean up the connection
        manager.disconnect(connection_id)

# Example endpoint to show expected coordinate format
@app.get("/coordinate-format/{exercise}")
async def get_coordinate_format(exercise: str):
    """Get the expected coordinate format for each exercise"""
    formats = {
        "biceps": {
            "description": "Bicep curl requires shoulder, elbow, and wrist coordinates",
            "format": {
                "coordinates": {
                    "right_shoulder": [100, 200],  # [x, y]
                    "right_elbow": [150, 250],
                    "right_wrist": [180, 300]
                }
            }
        },
        "squats": {
            "description": "Squat requires hip, knee, and ankle coordinates", 
            "format": {
                "coordinates": {
                    "right_hip": [100, 200],
                    "right_knee": [120, 350],
                    "right_ankle": [130, 450]
                }
            }
        },
        "pushups": {
            "description": "Pushup requires shoulder, elbow, and wrist coordinates",
            "format": {
                "coordinates": {
                    "right_shoulder": [100, 200],
                    "right_elbow": [150, 250], 
                    "right_wrist": [200, 260]
                }
            }
        },
        "plank": {
            "description": "Plank requires shoulder, hip, and knee coordinates",
            "format": {
                "coordinates": {
                    "right_shoulder": [100, 200],
                    "right_hip": [100, 300],
                    "right_knee": [100, 400]
                }
            }
        }
    }
    
    return formats.get(exercise, {"error": f"Exercise '{exercise}' not found"})

VOICE_MAPPING = {
    "female": "en-US-EmmaNeural",
    "male": "en-US-BrianNeural"
}

@app.get("/api/tts")
async def text_to_speech(text: str = "", gender: str = "female"):
    if not text:
        raise HTTPException(status_code=400, detail="Text parameter is missing")
        
    voice = VOICE_MAPPING.get(gender, "en-US-EmmaNeural")
    try:
        communicate = edge_tts.Communicate(text, voice, rate="-5%")
        
        # 🧠 IN-MEMORY BUFFER FIX:
        # Buffer the entire audio file in RAM first so the React <audio> 
        # element receives a fully formed MP3 instead of fragmented chunks.
        audio_stream = io.BytesIO()
        
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                audio_stream.write(chunk["data"])
                
        # Reset the memory pointer to the beginning of the file
        audio_stream.seek(0)

        return StreamingResponse(
            audio_stream, 
            media_type="audio/mpeg",
            headers={
                "Cache-Control": "no-cache, no-store, must-revalidate",
                "Connection": "keep-alive",
                "X-Content-Type-Options": "nosniff"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class NutritionRequest(BaseModel):
    food_description: str
    meal_type: Optional[str] = None

@app.post("/api/nutrition/ask")
async def parse_nutrition(request: NutritionRequest):
    try:
        model = genAI.GenerativeModel(
            model_name="gemini-3.1-flash-lite",
            system_instruction='You are a precise nutrition estimator. Output strictly minified JSON only with these exact string keys: "calories" (int), "protein" (int), "carbs" (int), "fat" (int), "display_name" (string). Do not include markdown code block wrappers (like ```json), do not append explanations, and do not include white spaces outside the keys.',
            generation_config={"response_mime_type": "application/json"}
        )
        
        prompt = f"Food description: {request.food_description}"
        if request.meal_type:
            prompt += f"\nMeal type: {request.meal_type}"
            
        response = await model.generate_content_async(prompt)
        
        return json.loads(response.text)
    except Exception as e:
        logging.error(f"Error parsing nutrition: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to estimate nutrition from description.")