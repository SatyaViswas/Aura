# 🌌 Aura — Immersive AI Wellness & Real-Time Pose-Tracking Coach

Aura is an advanced, premium wellness ecosystem designed to track, support, and optimize physical and mental human performance. The platform integrates real-time computer vision pose analysis, artificial intelligence, biometric logging, and ambient somatic training to guide users across training, diet, mental health, deep focus, and hydration.

Aura consists of:
- **`aura_frontend`**: A React + Vite SPA built with TailwindCSS, Framer Motion for premium animations, Zustand state store, Recharts, and Google MediaPipe for client-side pose extraction.
- **`aura-backend`**: A FastAPI asynchronous WebSocket server powered by a custom geometry engine, Edge Text-to-Speech (TTS), and a Redis state store.

---

## 🚀 Key Pillars & Features

### 1. Real-Time AI Exercise Coaching (Pose Tracking)
* **Real-time websocket analysis**: Extracted pose landmarks from the browser webcam (via MediaPipe Tasks-Vision) are streamed directly to the FastAPI server at `/ws/{exercise}?user_id={id}`.
* **Biomechanical Engine**: The backend runs lightweight coordinate smoothing (rolling window) and trigonometry over joint vectors to count reps and diagnose form.
* **54 Custom Exercises**: Covers Chest, Back, Legs, Shoulders, Biceps, Triceps, and Core (e.g. push-ups, squats, deadlifts, lat pulldowns, etc.).
* **Instant Audio Feedback**: Leverages Edge-TTS on the backend to stream real-time voice corrections (e.g., *"Go lower,"* *"Keep back straight"*) directly back to the client.

### 2. Ava AI Companion (Mental Health & Optimization)
* **Empathetic Companion**: Deeply customized chat interface powered by `gemini-3.1-flash-lite` designed around training, diet, hydration, focus, and mindfulness.
* **Multimodal Chat Engine**: Standard typing mode + interactive immersive Voice Overlay mode.
* **Seamless Speech-to-Text & Text-to-Speech**: Speech Recognition API records user queries, while the FastAPI server generates low-latency audio stream segments using a custom in-memory MP3 buffering technique.

### 3. AI-Powered Nutrition Estimator
* **Natural Language Parsing**: Logs food items in free-form text (e.g. *"three scrambled eggs and one slice of sourdough toast"*).
* **Gemini Parsing Engine**: Backend formats constraints to prompt Gemini for a strictly typed, minified JSON object containing calories and macros (protein, carbs, fat), immediately saving to the database.

### 4. Deep Focus & Ambient Soundscapes
* **Somatic Breathwork Controller**: Visual breathing rings scaled via Framer Motion that pulsate through a parasympathetic breathing cycle (4s inhale, 2s hold, 6s exhale).
* **Ambient Soundscapes**: Selectable background binaural beats (40Hz Gamma waves, Healing Energy, Deep Meditation) to induce focus states.
* **Productivity Timer**: A Pomodoro/Focus timer integrated directly with global state tracking.

### 5. Unified Dashboard & Firebase Sync
* **Biometric Charts**: Visualize calorie intake, daily activity, hydration levels, focus times, and mental wellness scores via Recharts graphs.
* **Cloud Persistence**: Automatically handles daily resets, multi-day history archives, and syncs user biometric logs to Cloud Firestore.

---

## 🛠️ Technology Stack

### Frontend Architecture
| Dependency | Purpose |
| :--- | :--- |
| **React 19 & Vite 8** | High-performance SPA tooling and asset bundling |
| **TailwindCSS** | Custom-engineered Nordic/Scandinavian dark & light visual theme |
| **Framer Motion** | Micro-interactions, spring animations, and breathing rings |
| **Zustand** | Centralized, persistent global state store |
| **Firebase SDK** | Client-side Authentication and Firestore database synchronizer |
| **MediaPipe Tasks-Vision** | Edge-side machine learning for 33 skeletal keypoint extraction |
| **Recharts** | Fully responsive analytics dashboards |

### Backend Architecture
| Dependency | Purpose |
| :--- | :--- |
| **FastAPI** | Asynchronous HTTP and WebSocket routing server |
| **Uvicorn** | ASGI server for production deployment |
| **Edge-TTS** | Low-latency voice synthesis for Ava Companion audio feedback |
| **Redis** | Centralized cache for real-time user session persistence |
| **Google GenAI SDK** | Integration with `gemini-3.1-flash-lite` for conversation and macro extraction |


---

## 📂 Repository Structure

```
Aura/
├── aura-backend/                # FastAPI Asynchronous Backend
│   ├── main.py                  # Server entry point, API, & WebSocket Router
│   ├── config.py                # Server configuration and environment loading
│   ├── exercises/               # Categorized biomechanics engine classes
│   │   ├── upper_body/          # Upper body exercises (bicep curls, bench press, pull-ups)
│   │   ├── lower_body/          # Legs exercises (squats, split squats, leg press)
│   │   ├── core/                # Core exercises (plank, crunches)
│   │   └── shoulders/           # Shoulder exercises (presses, lateral raises)
│   ├── utils/                   # Shared math libraries & Redis interfaces
│   │   ├── base_exercise.py     # Base class for all trackers
│   │   ├── coordinate_utils.py  # Geometric angle & coordinate processing
│   │   └── redis_client.py      # Redis wrapper connection manager
│   ├── requirements.txt         # Backend Python dependencies
│   └── Procfile                 # Deployment configuration (e.g. Render/Heroku)
│
├── aura_frontend/               # React Vite Single Page App
│   ├── src/
│   │   ├── App.jsx              # Main App entry, routing, and ThemeProvider
│   │   ├── components/          # Reusable UI widgets and PoseAnalyzer
│   │   ├── config/              # API connections and Firebase initialization
│   │   ├── pages/               # Dashboard, Workout, Diet, Mental Health, History
│   │   └── store/               # Zustand healthStore global state
│   ├── index.html               # Main template layout
│   ├── tailwind.config.js       # Custom design system configurations
│   ├── package.json             # NPM dependencies & scripts
│   └── vite.config.js           # Vite bundler configurations
```

---

## ⚡ Setup & Local Development

### Prerequisites
* **Python**: `python 3.9+`
* **Node.js**: `Node v18+` & `npm`
* **Redis**: Installed and running locally (optional, fallback supported)

---

### 📥 1. Backend Setup

1. **Navigate to the backend directory**:
   ```bash
   cd aura-backend
   ```

2. **Create and activate a virtual environment**:
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure Environment Variables**:
   Create a `.env` file inside `aura-backend/`:
   ```ini
   REDIS_ENABLED=true
   REDIS_HOST=localhost
   REDIS_PORT=6379
   REDIS_DB=0
   REDIS_PASSWORD=                 # Optional
   GOOGLE_API_KEY=YOUR_GEMINI_API_KEY
   ```

5. **Start the FastAPI server**:
   ```bash
   uvicorn main:app --reload --port 8000
   ```
   The backend API will run on `http://localhost:8000`.

---

### 🖥️ 2. Frontend Setup

1. **Navigate to the frontend directory**:
   ```bash
   cd ../aura_frontend
   ```

2. **Install node packages**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the `aura_frontend/` root:
   ```ini
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_firebase_project_domain
   VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_sender_id
   VITE_FIREBASE_APP_ID=your_firebase_app_id
   VITE_GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Start the Vite development server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

---

## 📡 API Reference

### 1. Asynchronous WebSocket Pose Routing
* **Endpoint**: `ws://localhost:8000/ws/{exercise_id}?user_id={id}`
* **Supported `exercise_id` formats**: `push-ups`, `squats`, `bench_press`, `bicep_curl`, `plank`, `crunches`, and [more](aura-backend/main.py#L143-L210).
* **Outgoing Payload (from client)**:
  ```json
  {
    "coordinates": {
      "right_shoulder": [0.45, 0.35],
      "right_elbow": [0.48, 0.52],
      "right_wrist": [0.51, 0.68]
    }
  }
  ```
* **Incoming Payload (from server)**:
  ```json
  {
    "exercise": "push-ups",
    "reps": 12,
    "feedback": "Go lower",
    "angle": 134,
    "stage": "down",
    "connection_id": "ab42f109",
    "processed_at": 17294625.32
  }
  ```

### 2. HTTP Endpoints
* **`GET /health`** - Check connection status, active connections, and Redis status.
* **`GET /exercises`** - Get metadata listing of all 53 unique exercises grouped by target muscle area.
* **`GET /api/tts?text={msg}&gender={female|male}`** - Returns a low-latency, fully buffered `audio/mpeg` response of the spoken text.
* **`POST /api/nutrition/ask`** - Returns structured nutritional data parsed from free-form text.
  * **Request Body**:
    ```json
    { "food_description": "2 eggs and a banana" }
    ```
  * **Response Body**:
    ```json
    {
      "calories": 240,
      "protein": 14,
      "carbs": 27,
      "fat": 10,
      "display_name": "Eggs and Banana"
    }
    ```

