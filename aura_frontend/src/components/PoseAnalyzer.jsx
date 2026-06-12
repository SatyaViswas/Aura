/**
 * @file PoseAnalyzer.jsx
 * @description Production-grade real-time pose tracking engine for Aura.
 *
 * Architecture:
 * WebRTC (getUserMedia) → MediaPipe PoseLandmarker (tasks-vision, WASM) →
 * DrawingUtils canvas overlay → WebSocket JSON stream → FastAPI backend →
 * Server-pushed telemetry (reps, stage, feedback, angle) rendered in UI.
 *
 * Props:
 * exerciseId   {string}   – Backend analytical token, also used in WS URL path.
 * exerciseName {string}   – Human-readable label shown in the session header.
 * targetReps   {number|string|null} – Rep target; null for time-based work.
 * estimatedXp  {number}   – XP awarded on session completion.
 * onComplete   {function} – Callback fired after "End Session" or rep target reached.
 */

import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PoseLandmarker,
  FilesetResolver,
  DrawingUtils,
} from '@mediapipe/tasks-vision';
import {
  X,
  Wifi,
  WifiOff,
  Camera,
  CameraOff,
  Activity,
  Star,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Volume2,
  VolumeX,
} from 'lucide-react';
import useHealthStore from '../store/healthStore';
import { WEBSOCKET_URL } from '../config/api';

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

/** MediaPipe Tasks-Vision WASM base URL (served from the npm package via Vite). */
const WASM_BASE_URL =
  'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm';

/** Lite pose model — fastest inference, sufficient for 33-keypoint extraction. */
const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task';

/** Canvas overlay colours matching Scandi-minimalist palette. */
const LANDMARK_COLOR = '#4A6B5D'; // sage green
const CONNECTOR_COLOR = 'rgba(74,107,93,0.45)';

// ─────────────────────────────────────────────────────────────────────────────
// Connection status enum
// ─────────────────────────────────────────────────────────────────────────────

const WS_STATUS = {
  CONNECTING: 'connecting',
  OPEN: 'open',
  CLOSED: 'closed',
  ERROR: 'error',
};

// ─────────────────────────────────────────────────────────────────────────────
// Angle arc progress — renders a soft minimalist dial for joint angle telemetry
// ─────────────────────────────────────────────────────────────────────────────

const AngleDial = ({ angle }) => {
  // Clamp angle to 0–180 degrees
  const clamped = Math.min(Math.max(Number(angle) || 0, 0), 180);
  const pct = clamped / 180;
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDash = circumference * 0.75; // we only draw 270° of the arc
  const strokeOffset = strokeDash - strokeDash * pct;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-24 h-24 flex items-center justify-center">
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 100 100"
          style={{ transform: 'rotate(135deg)' }}
        >
          {/* Background track */}
          <circle
            cx="50" cy="50" r={radius}
            fill="none"
            stroke="#DCE4E0"
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={`${strokeDash} ${circumference}`}
          />
          {/* Active arc */}
          <circle
            cx="50" cy="50" r={radius}
            fill="none"
            stroke="#4A6B5D"
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={`${strokeDash} ${circumference}`}
            strokeDashoffset={strokeOffset}
            style={{ transition: 'stroke-dashoffset 0.18s ease-out' }}
          />
        </svg>
        <div className="z-10 text-center">
          <span className="text-lg font-light tabular-nums text-text-primary leading-none">
            {Math.round(clamped)}°
          </span>
        </div>
      </div>
      <p className="text-[10px] uppercase tracking-widest text-text-secondary font-medium">
        Joint Angle
      </p>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// WebSocket status indicator pill
// ─────────────────────────────────────────────────────────────────────────────

const WsStatusPill = ({ status }) => {
  const map = {
    [WS_STATUS.CONNECTING]: {
      icon: Loader2,
      label: 'Connecting…',
      cls: 'bg-background text-text-secondary border border-border',
      iconCls: 'animate-spin',
    },
    [WS_STATUS.OPEN]: {
      icon: Wifi,
      label: 'Stream Live',
      cls: 'bg-[#DCE4E0] text-[#4A6B5D]',
      iconCls: '',
    },
    [WS_STATUS.CLOSED]: {
      icon: WifiOff,
      label: 'Disconnected',
      cls: 'bg-background text-text-secondary border border-border',
      iconCls: '',
    },
    [WS_STATUS.ERROR]: {
      icon: AlertCircle,
      label: 'WS Error',
      cls: 'bg-red-50 text-red-500 border border-red-100',
      iconCls: '',
    },
  };
  const { icon: Icon, label, cls, iconCls } = map[status] || map[WS_STATUS.CLOSED];

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full ${cls}`}
    >
      <Icon className={`w-3 h-3 ${iconCls}`} />
      {label}
    </span>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// PoseAnalyzer — main component
// ─────────────────────────────────────────────────────────────────────────────

const PoseAnalyzer = ({
  exerciseId = 'push-ups',
  exerciseName = 'Exercise',
  targetReps = null,
  estimatedXp = 20,
  onComplete,
  onClose,
}) => {
  // ── Store access ────────────────────────────────────────────────────────────
  const uid = useHealthStore((state) => state.user?.uid ?? 'anonymous');

  // ── DOM refs ────────────────────────────────────────────────────────────────
  const videoRef = useRef(null);   // <video> element
  const canvasRef = useRef(null);   // transparent overlay <canvas>
  const streamRef = useRef(null);   // MediaStream handle
  const landmarkerRef = useRef(null);// PoseLandmarker instance
  const drawingUtilsRef = useRef(null);// DrawingUtils instance
  const wsRef = useRef(null);   // WebSocket instance
  const rafIdRef = useRef(null);   // requestAnimationFrame id
  const lastTimestampRef = useRef(-1);// prevents duplicate frames at same ts

  // ── Component state ─────────────────────────────────────────────────────────
  const [cameraStatus, setCameraStatus] = useState('idle');   // idle | loading | active | denied
  const [modelStatus, setModelStatus] = useState('idle');   // idle | loading | ready | error
  const [gradientStatus, setGradientStatus] = useState(WS_STATUS.CONNECTING);

  // Telemetry state received from FastAPI
  const [reps, setReps] = useState(0);
  const [stage, setStage] = useState('—');
  const [feedback, setFeedback] = useState('Align your body in frame and begin the exercise.');
  const [angle, setAngle] = useState(0);

  // Voice Assistant state
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const isVoiceEnabledRef = useRef(false);
  const lastSpokenTextRef = useRef('');
  const lastSpokenTimeRef = useRef(0);

  // Session completion
  const [sessionDone, setSessionDone] = useState(false);

  // Error banner messages
  const [cameraError, setCameraError] = useState(null);
  const [wsError, setWsError] = useState(null);

  // ─────────────────────────────────────────────────────────────────────────
  // 1 · WebRTC camera initialisation
  // ─────────────────────────────────────────────────────────────────────────

  const initCamera = useCallback(async () => {
    setCameraStatus('loading');
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { ideal: 30 },
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await new Promise((resolve, reject) => {
          videoRef.current.onloadedmetadata = () => {
            videoRef.current
              .play()
              .then(resolve)
              .catch(reject);
          };
          videoRef.current.onerror = reject;
        });
      }

      setCameraStatus('active');
    } catch (err) {
      const msg =
        err.name === 'NotAllowedError'
          ? 'Camera permission denied. Please allow camera access and reload.'
          : err.name === 'NotFoundError'
            ? 'No camera device found on this machine.'
            : `Camera error: ${err.message}`;
      setCameraError(msg);
      setCameraStatus('denied');
    }
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // 2 · MediaPipe PoseLandmarker initialisation
  // ─────────────────────────────────────────────────────────────────────────

  const initPoseLandmarker = useCallback(async () => {
    setModelStatus('loading');
    try {
      const vision = await FilesetResolver.forVisionTasks(WASM_BASE_URL);
      const poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: MODEL_URL,
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numPoses: 1,
        minPoseDetectionConfidence: 0.5,
        minPosePresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
        outputSegmentationMasks: false,
      });

      landmarkerRef.current = poseLandmarker;

      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        drawingUtilsRef.current = new DrawingUtils(ctx);
      }

      setModelStatus('ready');
    } catch (err) {
      console.error('[PoseAnalyzer] Model init failed:', err);
      setModelStatus('error');
    }
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // 3 · WebSocket connection
  // ─────────────────────────────────────────────────────────────────────────

  const connectWebSocket = useCallback(() => {
    setGradientStatus(WS_STATUS.CONNECTING);
    setWsError(null);

    // Safely construct the URL within scope
    const url = `${WEBSOCKET_URL}/ws/${exerciseId}?user_id=${uid}`;
    const ws = new WebSocket(url);

    ws.onopen = () => {
      setGradientStatus(WS_STATUS.OPEN);
      setWsError(null);
    };

    ws.onerror = () => {
      setGradientStatus(WS_STATUS.ERROR);
      setWsError(
        `WebSocket connection to ${url} failed. Ensure the FastAPI backend is running and reachable.`
      );
    };

    ws.onclose = (event) => {
      setGradientStatus(WS_STATUS.CLOSED);
      if (event.code !== 1000 && event.code !== 1001) {
        setWsError(`Connection closed (code ${event.code}). Landmark data is not being transmitted.`);
      }
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (typeof data.reps === 'number') {
          setReps(data.reps);

          if (
            targetReps !== null &&
            data.reps >= Number(targetReps) &&
            !sessionDone
          ) {
            setSessionDone(true);
            setFeedback('Target reached. Outstanding work.');
          }
        }

        if (typeof data.stage === 'string') {
          setStage(data.stage);
        }

        if (typeof data.feedback === 'string') {
          const currentFeedback = data.feedback ? data.feedback.trim() : '';

          if (currentFeedback) {
            setFeedback(currentFeedback);
          }

          if (currentFeedback && isVoiceEnabledRef.current) {
            const now = Date.now();

            if (currentFeedback !== lastSpokenTextRef.current) {
              window.speechSynthesis.cancel();
              lastSpokenTextRef.current = currentFeedback;
              lastSpokenTimeRef.current = now;
              const utterance = new SpeechSynthesisUtterance(currentFeedback);
              window.speechSynthesis.speak(utterance);
            } else {
              if (now - lastSpokenTimeRef.current >= 4000) {
                lastSpokenTimeRef.current = now;
                const utterance = new SpeechSynthesisUtterance(currentFeedback);
                window.speechSynthesis.speak(utterance);
              }
            }
          }
        }

        if (typeof data.angle === 'number') {
          setAngle(data.angle);
        }
      } catch {
        // Discard malformed packets safely
      }
    };

    wsRef.current = ws;
  }, [exerciseId, uid, targetReps, sessionDone]);

  // ─────────────────────────────────────────────────────────────────────────
  // 4 · Canvas overlay drawing helper
  // ─────────────────────────────────────────────────────────────────────────

  const drawLandmarksOnCanvas = useCallback((landmarks) => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video || !drawingUtilsRef.current) return;

    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!landmarks || landmarks.length === 0) return;

    drawingUtilsRef.current.drawConnectors(
      landmarks[0],
      PoseLandmarker.POSE_CONNECTIONS,
      { color: CONNECTOR_COLOR, lineWidth: 2 }
    );

    drawingUtilsRef.current.drawLandmarks(
      landmarks[0],
      {
        color: LANDMARK_COLOR,
        fillColor: '#FFFFFF',
        lineWidth: 1.5,
        radius: 3,
      }
    );
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // 5 · Main inference + dispatch loop (Keypoint Mapper Fix)
  // ─────────────────────────────────────────────────────────────────────────

  const startInferenceLoop = useCallback(() => {
    const tick = () => {
      const video = videoRef.current;
      const landmarker = landmarkerRef.current;
      const ws = wsRef.current;

      if (
        !video ||
        video.readyState < 2 ||
        !landmarker
      ) {
        rafIdRef.current = requestAnimationFrame(tick);
        return;
      }

      const now = performance.now();

      if (now <= lastTimestampRef.current) {
        rafIdRef.current = requestAnimationFrame(tick);
        return;
      }
      lastTimestampRef.current = now;

      landmarker.detectForVideo(video, now, (result) => {
        const landmarks = result.landmarks;

        drawLandmarksOnCanvas(landmarks);

        if (
          ws &&
          ws.readyState === WebSocket.OPEN &&
          landmarks &&
          landmarks.length > 0
        ) {
          const firstPose = landmarks[0];

          // Explicit mapping dictionary between MediaPipe indices and your Python endpoints
          const indexMapping = {
            11: 'left_shoulder', 12: 'right_shoulder',
            13: 'left_elbow', 14: 'right_elbow',
            15: 'left_wrist', 16: 'right_wrist',
            23: 'left_hip', 24: 'right_hip',
            25: 'left_knee', 26: 'right_knee',
            27: 'left_ankle', 28: 'right_ankle',
            0: 'nose'
          };

          const coordinates = {};
          firstPose.forEach((lm, idx) => {
            const keyName = indexMapping[idx];
            if (keyName) {
              // Packs coordinates into standard scale-invariant standard array [x, y] vector format
              coordinates[keyName] = [lm.x, lm.y];
            }
          });

          const payload = JSON.stringify({ coordinates });
          ws.send(payload);
        }
      });

      rafIdRef.current = requestAnimationFrame(tick);
    };

    rafIdRef.current = requestAnimationFrame(tick);
  }, [drawLandmarksOnCanvas]);

  // ─────────────────────────────────────────────────────────────────────────
  // 6 · Cleanup
  // ─────────────────────────────────────────────────────────────────────────

  const teardown = useCallback(() => {
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    if (wsRef.current && wsRef.current.readyState !== WebSocket.CLOSED) {
      wsRef.current.close(1000, 'Session ended by user');
      wsRef.current = null;
    }

    if (landmarkerRef.current) {
      landmarkerRef.current.close();
      landmarkerRef.current = null;
    }

    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // 7 · Orchestration effect
  // ─────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      await Promise.all([
        initCamera(),
        initPoseLandmarker(),
      ]);

      if (cancelled) return;

      connectWebSocket();

      setTimeout(() => {
        if (!cancelled) {
          startInferenceLoop();
        }
      }, 300);
    };

    bootstrap();

    return () => {
      cancelled = true;
      teardown();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // 8 · Session completion handler
  // ─────────────────────────────────────────────────────────────────────────

  const handleEndSession = useCallback(() => {
    teardown();
    if (sessionDone && typeof onComplete === 'function') {
      onComplete();
    } else if (typeof onClose === 'function') {
      onClose();
    }
  }, [teardown, sessionDone, onComplete, onClose]);

  const handleLogAndComplete = useCallback(() => {
    teardown();
    if (typeof onComplete === 'function') {
      onComplete();
    }
  }, [teardown, onComplete]);

  // ─────────────────────────────────────────────────────────────────────────
  // Derived UI helpers
  // ─────────────────────────────────────────────────────────────────────────

  const parsedTargetReps = targetReps !== null ? Number(targetReps) : null;
  const repProgress =
    parsedTargetReps !== null
      ? Math.min((reps / parsedTargetReps) * 100, 100)
      : null;

  const isModelLoading = modelStatus === 'idle' || modelStatus === 'loading';
  const isCameraLoading = cameraStatus === 'idle' || cameraStatus === 'loading';
  const isBooting = isModelLoading || isCameraLoading;

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col overflow-hidden">

      {/* ── Top chrome bar ─────────────────────────────────────────────────── */}
      <header className="shrink-0 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between bg-surface border-b border-border shadow-[0_2px_20px_-4px_rgba(42,42,42,0.04)] z-20 gap-3">
        <div className="flex flex-col min-w-0">
          <p className="text-[10px] text-text-secondary uppercase tracking-widest font-medium">
            Live Session
          </p>
          <h2 className="text-base sm:text-lg font-light text-text-primary leading-tight truncate">
            {exerciseName}
          </h2>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* WS status — hide label on mobile */}
          <span
            className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 sm:px-3 py-1.5 rounded-full ${gradientStatus === WS_STATUS.OPEN
              ? 'bg-[#DCE4E0] text-[#4A6B5D]'
              : gradientStatus === WS_STATUS.ERROR
                ? 'bg-red-50 text-red-500 border border-red-100'
                : 'bg-background text-text-secondary border border-border'
              }`}
          >
            {gradientStatus === WS_STATUS.OPEN ? (
              <Wifi className="w-3 h-3" />
            ) : gradientStatus === WS_STATUS.ERROR ? (
              <AlertCircle className="w-3 h-3" />
            ) : (
              <Loader2 className="w-3 h-3 animate-spin" />
            )}
            <span className="hidden sm:inline">
              {gradientStatus === WS_STATUS.OPEN ? 'Stream Live' : gradientStatus === WS_STATUS.ERROR ? 'WS Error' : gradientStatus === WS_STATUS.CONNECTING ? 'Connecting…' : 'Disconnected'}
            </span>
          </span>

          {/* Voice toggle — icon-only on mobile */}
          <button
            onClick={() => {
              if (isVoiceEnabled) window.speechSynthesis.cancel();
              setIsVoiceEnabled((prev) => {
                const nextState = !prev;
                isVoiceEnabledRef.current = nextState;
                return nextState;
              });
            }}
            title={isVoiceEnabled ? 'Disable voice' : 'Enable voice'}
            className={`inline-flex items-center gap-2 px-3 py-2 sm:px-4 rounded-full text-sm font-medium transition-all shadow-sm border ${isVoiceEnabled
              ? 'bg-[#DCE4E0] text-[#4A6B5D] border-[#4A6B5D]/20'
              : 'bg-background text-text-secondary border-border hover:bg-[#DCE4E0] hover:text-[#4A6B5D] hover:border-[#4A6B5D]/20'
              }`}
          >
            {isVoiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline">{isVoiceEnabled ? 'Voice On' : 'Voice Off'}</span>
          </button>

          {/* End session — icon-only on mobile */}
          <button
            onClick={handleEndSession}
            title={sessionDone ? 'Finish Session' : 'Abort Session'}
            className="inline-flex items-center gap-2 px-3 py-2 sm:px-4 rounded-full text-sm font-medium text-text-secondary bg-background border border-border hover:bg-[#DCE4E0] hover:text-[#4A6B5D] hover:border-[#4A6B5D]/20 transition-all shadow-sm"
          >
            {sessionDone ? <CheckCircle2 className="w-4 h-4 text-[#4A6B5D]" /> : <X className="w-4 h-4" />}
            <span className="hidden sm:inline">{sessionDone ? 'Done' : 'Abort'}</span>
          </button>
        </div>
      </header>

      {/* ── Error banners ───────────────────────────────────────────────────── */}
      <AnimatePresence>
        {cameraError && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="shrink-0 mx-4 mt-3 bg-red-50 border border-red-100 rounded-[0.875rem] px-5 py-3 flex items-center gap-3"
          >
            <CameraOff className="w-4 h-4 text-red-400 shrink-0" />
            <p className="text-sm text-red-600 font-light">{cameraError}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {wsError && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="shrink-0 mx-4 mt-3 bg-amber-50 border border-amber-100 rounded-[0.875rem] px-5 py-3 flex items-center gap-3"
          >
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <p className="text-sm text-amber-700 font-light">{wsError}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main layout ─────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col lg:flex-row gap-3 sm:gap-4 p-3 sm:p-4 overflow-y-auto lg:overflow-hidden min-h-0">

        {/* ── Camera viewfinder column ───────────────────────────────────────── */}
        <div className="relative flex-1 flex flex-col" style={{ minHeight: 'min(55vw, 320px)' }}>

          {/* Feedback pill */}
          <AnimatePresence mode="wait">
            <motion.div
              key={feedback}
              initial={{ opacity: 0, y: -10, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.96 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="absolute top-4 left-1/2 -translate-x-1/2 z-10 w-max max-w-[90%]"
            >
              <div className="bg-[#DCE4E0]/90 backdrop-blur-md px-4 sm:px-6 py-2.5 sm:py-3 rounded-full shadow-[0_8px_30px_-8px_rgba(74,107,93,0.2)] flex items-center gap-2 sm:gap-3">
                <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#4A6B5D] shrink-0 animate-pulse" />
                <span className="text-xs sm:text-sm font-medium text-text-primary text-center">
                  {feedback}
                </span>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Camera feed container */}
          <div className="relative w-full h-full rounded-[1.25rem] sm:rounded-[1.5rem] overflow-hidden bg-[#2A2A2A] shadow-[0_20px_60px_-15px_rgba(42,42,42,0.15)] border border-border">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
              style={{ transform: 'scaleX(-1)' }}
            />

            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{ transform: 'scaleX(-1)' }}
            />

            {/* Boot loading state */}
            <AnimatePresence>
              {isBooting && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center bg-[#2A2A2A]/80 backdrop-blur-sm gap-4"
                >
                  <div className="relative w-16 h-16">
                    <div className="absolute inset-0 rounded-full border-4 border-[#DCE4E0]/20" />
                    <div className="absolute inset-0 rounded-full border-4 border-t-[#4A6B5D] animate-spin" />
                  </div>
                  <div className="text-center space-y-1">
                    <p className="text-white font-light text-base tracking-tight">
                      {isCameraLoading ? 'Accessing camera…' : 'Loading pose model…'}
                    </p>
                    <p className="text-[#DCE4E0]/60 text-xs font-light">
                      {modelStatus === 'loading' ? 'Initialising WASM runtime' : 'Requesting device permission'}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Camera off / denied state */}
            <AnimatePresence>
              {cameraStatus === 'denied' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center bg-[#2A2A2A]/90 gap-5"
                >
                  <div className="w-16 h-16 rounded-full bg-background/10 flex items-center justify-center">
                    <CameraOff className="w-8 h-8 text-[#DCE4E0]" />
                  </div>
                  <p className="text-white/70 font-light text-sm max-w-xs text-center">
                    Camera access required for real-time pose tracking. Grant permission and reload.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Session complete overlay */}
            <AnimatePresence>
              {sessionDone && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0 flex flex-col items-center justify-center bg-[#4A6B5D]/80 backdrop-blur-sm gap-6"
                >
                  <motion.div
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.15 }}
                  >
                    <CheckCircle2 className="w-20 h-20 text-white" />
                  </motion.div>
                  <div className="text-center space-y-2">
                    <p className="text-white text-2xl font-light tracking-tight">
                      Session Complete
                    </p>
                    <p className="text-[#DCE4E0]/80 text-sm font-light">
                      +{estimatedXp} XP awarded to your profile
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Live indicator dot */}
            {cameraStatus === 'active' && !sessionDone && (
              <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-[#4A6B5D] animate-pulse" />
                <span className="text-[11px] text-white/80 font-medium tracking-widest uppercase">
                  Live
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ── Right metrics panel ────────────────────────────────────────────── */}
        <aside className="w-full lg:w-[340px] shrink-0 flex flex-col gap-3 sm:gap-4">

          {/* ── Rep counter card ─────────────────────────────────────── */}
          <div className="bg-surface rounded-[1.25rem] sm:rounded-[1.5rem] p-5 sm:p-7 shadow-[0_10px_40px_-10px_rgba(42,42,42,0.04)] border border-border flex flex-col items-center gap-3">
            <p className="text-[10px] text-text-secondary uppercase tracking-widest font-medium">
              Repetitions
            </p>

            <motion.div
              key={reps}
              initial={{ scale: 1.15, opacity: 0.6 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="text-[4rem] sm:text-[5rem] font-extralight tabular-nums text-text-primary leading-none"
            >
              {reps}
            </motion.div>

            {/* Target indicator */}
            {parsedTargetReps !== null && (
              <p className="text-sm text-text-secondary font-light">
                of{' '}
                <span className="font-medium text-text-primary">{parsedTargetReps}</span>{' '}
                target
              </p>
            )}

            {/* Rep progress bar */}
            {repProgress !== null && (
              <div className="w-full space-y-1.5 mt-1">
                <div className="w-full h-2 bg-[#DCE4E0] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-[#4A6B5D] rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${repProgress}%` }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                  />
                </div>
                <p className="text-right text-[10px] text-text-secondary font-medium">
                  {Math.round(repProgress)}%
                </p>
              </div>
            )}
          </div>

          {/* ── Stage & angle card ───────────────────────────────────── */}
          <div className="bg-surface rounded-[1.25rem] sm:rounded-[1.5rem] p-5 sm:p-7 shadow-[0_10px_40px_-10px_rgba(42,42,42,0.04)] border border-border flex items-center justify-between gap-4">
            <div className="flex flex-col items-start gap-1.5">
              <p className="text-[10px] text-text-secondary uppercase tracking-widest font-medium">
                Phase
              </p>
              <AnimatePresence mode="wait">
                <motion.span
                  key={stage}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25 }}
                  className="text-2xl font-light text-text-primary capitalize"
                >
                  {stage}
                </motion.span>
              </AnimatePresence>
            </div>

            <AngleDial angle={angle} />
          </div>

          {/* ── XP & exercise info card ─────────────────────────────── */}
          <div className="bg-surface rounded-[1.25rem] sm:rounded-[1.5rem] p-5 sm:p-7 shadow-[0_10px_40px_-10px_rgba(42,42,42,0.04)] border border-border space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-text-secondary">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs uppercase tracking-widest font-medium">Session</span>
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#4A6B5D] bg-[#DCE4E0] px-3 py-1.5 rounded-full">
                <Star className="w-3 h-3" />
                +{estimatedXp} XP
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center py-2.5 border-b border-border">
                <span className="text-sm text-text-secondary font-light">Exercise</span>
                <span className="text-sm text-text-primary font-medium text-right max-w-[180px] truncate">
                  {exerciseName}
                </span>
              </div>

              <div className="flex justify-between items-center py-2.5 border-b border-border">
                <span className="text-sm text-text-secondary font-light">Target</span>
                <span className="text-sm text-text-primary font-medium">
                  {parsedTargetReps !== null ? `${parsedTargetReps} reps` : 'Open'}
                </span>
              </div>

              <div className="flex justify-between items-center py-2.5 border-b border-border">
                <span className="text-sm text-text-secondary font-light">Camera</span>
                <span className={`text-sm font-medium flex items-center gap-1.5 ${cameraStatus === 'active' ? 'text-[#4A6B5D]' : 'text-text-secondary'
                  }`}>
                  {cameraStatus === 'active' ? (
                    <><Camera className="w-3.5 h-3.5" /> Active</>
                  ) : cameraStatus === 'loading' ? (
                    <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading</>
                  ) : (
                    <><CameraOff className="w-3.5 h-3.5" /> Unavailable</>
                  )}
                </span>
              </div>

              <div className="flex justify-between items-center py-2.5">
                <span className="text-sm text-text-secondary font-light">Model</span>
                <span className={`text-sm font-medium flex items-center gap-1.5 ${modelStatus === 'ready' ? 'text-[#4A6B5D]' : 'text-text-secondary'
                  }`}>
                  {modelStatus === 'ready' ? (
                    <><Activity className="w-3.5 h-3.5" /> Inference Live</>
                  ) : modelStatus === 'loading' ? (
                    <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading WASM</>
                  ) : modelStatus === 'error' ? (
                    <><AlertCircle className="w-3.5 h-3.5 text-red-400" /> Model Error</>
                  ) : (
                    '—'
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* ── WebSocket diagnostic card ─────────────────────────────── */}
          <div className="bg-surface rounded-[1.25rem] sm:rounded-[1.5rem] p-5 sm:p-7 shadow-[0_10px_40px_-10px_rgba(42,42,42,0.04)] border border-border space-y-4">
            <div className="flex items-center gap-2 text-text-secondary">
              <Wifi className="w-4 h-4" />
              <span className="text-xs uppercase tracking-widest font-medium">Stream Target</span>
            </div>
            <div className="bg-background rounded-[0.875rem] p-4 border border-border font-mono text-[11px] space-y-2">
              <p className="text-text-secondary break-all">
                <span className="text-[#4A6B5D] font-semibold">WS</span>{' '}
                {WEBSOCKET_URL}/ws/{exerciseId}?user_id={uid}
              </p>
              <p className="text-text-secondary">
                <span className="font-semibold text-text-primary">Payload</span>{' '}
                {'{ coordinates: { left_hip: [x,y], ... } }'}
              </p>
              <p className="text-text-secondary">
                <span className="font-semibold text-text-primary">Receives</span>{' '}
                {'{ reps, stage, feedback, angle }'}
              </p>
            </div>
          </div>

          {/* ── End session CTA ─────────────────────────────────────────── */}
          {sessionDone ? (
            <button
              onClick={handleLogAndComplete}
              className="w-full py-4 rounded-[1rem] bg-[#4A6B5D] text-white font-medium tracking-wide text-sm hover:bg-[#3d5a4d] hover:scale-[1.02] active:scale-[0.99] transition-all shadow-[0_8px_24px_-6px_rgba(74,107,93,0.40)] flex items-center justify-center gap-2.5 mb-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Log &amp; Complete Set
            </button>
          ) : (
            <button
              onClick={handleEndSession}
              className="w-full py-4 rounded-[1rem] bg-background text-text-secondary border border-border font-medium tracking-wide text-sm hover:bg-[#DCE4E0] hover:text-[#4A6B5D] transition-all flex items-center justify-center gap-2.5 mb-2"
            >
              <X className="w-4 h-4" />
              Abort Session
            </button>
          )}
        </aside>
      </div>
    </div>
  );
};

export default PoseAnalyzer;