/**
 * @file Workout.jsx
 * @description Premium 4-level drill-down workout navigation module for Aura.
 *
 *   Level 1 → Modality Discovery  (Gym / Calisthenics / Stretching & Yoga)
 *   Level 2 → Track List          (PPL / Upper-Lower / Full Body / Bro-Split / Hybrid …)
 *   Level 3 → Sub-Section Grid    (Push Day / Pull Day / Leg Day …)
 *   Level 4 → Exercise Roster     (individual exercise cards + side-preview pane)
 *
 *   On "Begin Tracking Session":
 *     pose_analyzer === true  → WebRTC/WebSocket initializer overlay
 *     pose_analyzer === false → in-layout countdown timer widget
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dumbbell,
  Wind,
  Target,
  ArrowLeft,
  ChevronRight,
  Zap,
  Clock,
  RotateCcw,
  Play,
  Pause,
  CheckCircle2,
  X,
  Wifi,
  Camera,
  Star,
  BookOpen,
  Timer,
  TrendingUp,
} from 'lucide-react';

import { workoutData } from '../config/workoutData';
import useHealthStore from '../store/healthStore';
import PoseAnalyzer from '../components/PoseAnalyzer';

// ─────────────────────────────────────────────────────────────────────────────
// Motion Variants — shared across all level transitions
// ─────────────────────────────────────────────────────────────────────────────

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] } },
};

const cardStagger = {
  animate: { transition: { staggerChildren: 0.07 } },
};

const cardItem = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] } },
};

// ─────────────────────────────────────────────────────────────────────────────
// Static Modality Meta — enriches Level 1 cards beyond raw workoutData
// ─────────────────────────────────────────────────────────────────────────────

const MODALITY_META = {
  gym: {
    icon: Dumbbell,
    tagline: 'Iron & structured split programming',
    badge: 'Strength',
    accentFrom: '#4A6B5D',
    accentTo: '#6A9080',
    bgDecor: 'from-[#4A6B5D]/6 to-transparent',
  },
  calisthenics: {
    icon: Target,
    tagline: 'Bodyweight mastery & skill progressions',
    badge: 'Skill',
    accentFrom: '#5D6B4A',
    accentTo: '#808A62',
    bgDecor: 'from-[#5D6B4A]/6 to-transparent',
  },
  stretchingYoga: {
    icon: Wind,
    tagline: 'Mobility, breath & mindful recovery',
    badge: 'Mobility',
    accentFrom: '#4A5D6B',
    accentTo: '#628090',
    bgDecor: 'from-[#4A5D6B]/6 to-transparent',
  },
};

// Track metadata map for Level 2 descriptor tags (duration, freq, difficulty)
const TRACK_META = {
  // Gym
  ppl: { duration: '60–75 min', frequency: '3×/week', difficulty: 'Intermediate' },
  upperLower: { duration: '55–70 min', frequency: '4×/week', difficulty: 'Intermediate' },
  fullBody: { duration: '50–65 min', frequency: '3×/week', difficulty: 'Beginner–Int.' },
  broSplit: { duration: '45–60 min', frequency: '5×/week', difficulty: 'Intermediate' },
  hybrid: { duration: '60–80 min', frequency: '4×/week', difficulty: 'Advanced' },
  // Calisthenics
  beginner: { duration: '30–40 min', frequency: '3×/week', difficulty: 'Beginner' },
  intermediate: { duration: '45–60 min', frequency: '4×/week', difficulty: 'Intermediate' },
  advanced: { duration: '60–90 min', frequency: '4×/week', difficulty: 'Advanced' },
  skillProgression: { duration: '40–60 min', frequency: '5×/week', difficulty: 'Advanced' },
  // Stretching & Yoga
  stretching_daily: { duration: '15–20 min', frequency: 'Daily', difficulty: 'All Levels' },
  stretching_pre: { duration: '10–15 min', frequency: 'Pre-WO', difficulty: 'All Levels' },
  stretching_post: { duration: '12–18 min', frequency: 'Post-WO', difficulty: 'All Levels' },
  yoga_flow: { duration: '30–45 min', frequency: '3×/week', difficulty: 'Beginner' },
};

// Sub-section descriptor copy
const SUBSECTION_DESC = {
  push: 'Chest, shoulders & triceps — pushing strength foundations.',
  pull: 'Back, biceps & rear delts — pulling power development.',
  legs: 'Quads, hamstrings, glutes & calves — complete lower body.',
  upper: 'Compound upper body strength across all planes.',
  lower: 'Posterior & anterior chain loaded lower body work.',
  workout: 'Full-body stimulus — balanced push, pull & legs in one.',
  chest: 'Volume & intensity across the entire pectoral complex.',
  back: 'Vertical & horizontal pull patterns for back thickness.',
  arms: 'Isolated bicep & tricep development — peak definition.',
  shoulders: 'Three-dimensional deltoid development & rotator health.',
  strengthUpper: 'Heavy compound upper lifts — maximal force expression.',
  strengthLower: 'Loaded squats, deadlifts & explosive plyometric output.',
  conditioning: 'Metabolic conditioning — sustained aerobic power.',
  recovery: 'Light movement to restore circulation and joint health.',
  fullBody: 'Full-spectrum bodyweight fundamentals — build the base.',
  pushPullLegs: 'Balanced push, pull & legs using only bodyweight.',
  skillStrengthSplit: 'Skill acquisition fused with high-output strength work.',
  planche: 'Progressive planche pathway from frog hold to full.',
  handstand: 'Inversion mastery — wall-assisted to freestanding.',
  frontLever: 'Horizontal pulling strength and scapular control.',
  muscleup: 'Bar transition pathway from explosive pull to lockout.',
  daily_movement: 'Full-body joint articulation to start or reset the day.',
  pre_workout: 'Dynamic activation to prime tissue for heavy loads.',
  post_workout: 'Static holds to release muscle tension & restore length.',
  beginner_yoga: 'Foundational asanas — breath, balance & presence.',
};

// ─────────────────────────────────────────────────────────────────────────────
// Shared UI Primitives
// ─────────────────────────────────────────────────────────────────────────────

/** Floating back button — appears at Levels 2, 3, 4 */
const BackButton = ({ onClick, label = 'Back' }) => (
  <motion.button
    initial={{ opacity: 0, x: -8 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.3 }}
    onClick={onClick}
    className="inline-flex items-center gap-2 text-[#767676] hover:text-[#2A2A2A] transition-colors duration-200 group mb-8"
  >
    <span className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-[0_2px_12px_rgba(42,42,42,0.06)] group-hover:shadow-[0_4px_16px_rgba(42,42,42,0.10)] transition-shadow border border-black/[0.04]">
      <ArrowLeft className="w-4 h-4" />
    </span>
    <span className="text-sm font-medium">{label}</span>
  </motion.button>
);

/** Section header block */
const SectionHeader = ({ title, subtitle }) => (
  <header className="mb-10 space-y-1">
    <h1 className="text-3xl md:text-[2.25rem] font-light text-[#2A2A2A] tracking-tight leading-snug">
      {title}
    </h1>
    {subtitle && (
      <p className="text-[#767676] text-base font-light">{subtitle}</p>
    )}
  </header>
);

/** XP badge pill */
const XpBadge = ({ xp }) => (
  <span className="inline-flex items-center gap-1 text-xs font-medium text-[#4A6B5D] bg-[#DCE4E0] px-2.5 py-1 rounded-full">
    <Star className="w-3 h-3" />
    {xp} XP
  </span>
);

// ─────────────────────────────────────────────────────────────────────────────
// Countdown Timer Widget — for pose_analyzer === false exercises
// ─────────────────────────────────────────────────────────────────────────────

const CountdownTimer = ({ exercise, onComplete }) => {
  // Parse the duration from the exercise — e.g. "60s", "45s each", "300s"
  const parseDuration = useCallback((dur) => {
    if (!dur) return 60;
    const match = String(dur).match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 60;
  }, []);

  const totalSeconds = parseDuration(exercise.target_duration);
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const intervalRef = useRef(null);

  const resetTimer = useCallback(() => {
    clearInterval(intervalRef.current);
    setSecondsLeft(totalSeconds);
    setIsRunning(false);
    setIsDone(false);
  }, [totalSeconds]);

  useEffect(() => {
    if (isRunning && secondsLeft > 0) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((s) => {
          if (s <= 1) {
            clearInterval(intervalRef.current);
            setIsRunning(false);
            setIsDone(true);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, secondsLeft]);

  const toggleTimer = () => {
    if (isDone) return;
    setIsRunning((r) => !r);
  };

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const progressPct = ((totalSeconds - secondsLeft) / totalSeconds) * 100;
  const circumference = 2 * Math.PI * 54; // radius 54 for the SVG circle

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35 }}
      className="bg-white rounded-[1.5rem] p-8 shadow-[0_10px_40px_-10px_rgba(42,42,42,0.07)] flex flex-col items-center gap-6"
    >
      <div className="text-center space-y-1">
        <h3 className="text-lg font-light text-[#2A2A2A] tracking-tight">{exercise.name}</h3>
        <p className="text-xs text-[#767676] uppercase tracking-widest">Manual Timer</p>
      </div>

      {/* Circular progress ring */}
      <div className="relative w-36 h-36 flex items-center justify-center">
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle
            cx="60" cy="60" r="54"
            fill="none"
            stroke="#DCE4E0"
            strokeWidth="6"
          />
          <circle
            cx="60" cy="60" r="54"
            fill="none"
            stroke={isDone ? '#4A6B5D' : '#4A6B5D'}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - (circumference * progressPct) / 100}
            style={{ transition: 'stroke-dashoffset 0.95s linear' }}
          />
        </svg>
        <div className="z-10 text-center">
          {isDone ? (
            <CheckCircle2 className="w-10 h-10 text-[#4A6B5D]" />
          ) : (
            <span className="text-3xl font-light tabular-nums text-[#2A2A2A]">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <button
          onClick={resetTimer}
          className="w-11 h-11 rounded-full bg-[#FBFBF9] border border-black/[0.06] flex items-center justify-center text-[#767676] hover:text-[#2A2A2A] hover:border-black/10 transition-all shadow-sm"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          onClick={toggleTimer}
          disabled={isDone}
          className={`w-16 h-16 rounded-full flex items-center justify-center shadow-[0_8px_24px_-4px_rgba(74,107,93,0.35)] transition-all ${isDone
              ? 'bg-[#DCE4E0] text-[#4A6B5D] cursor-not-allowed'
              : 'bg-[#4A6B5D] hover:bg-[#3d5a4d] text-white hover:scale-105'
            }`}
        >
          {isRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
        </button>

        {isDone && (
          <button
            onClick={onComplete}
            className="w-11 h-11 rounded-full bg-[#4A6B5D] text-white flex items-center justify-center shadow-[0_4px_16px_rgba(74,107,93,0.3)] hover:scale-105 transition-all"
          >
            <CheckCircle2 className="w-5 h-5" />
          </button>
        )}

        {!isDone && (
          <div className="w-11 h-11" /> /* spacer to keep layout symmetric when done button hidden */
        )}
      </div>

      {isDone && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-[#4A6B5D] font-medium"
        >
          Set complete. Well done.
        </motion.p>
      )}
    </motion.div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// WebSocket / WebRTC Initializer Overlay — for pose_analyzer === true exercises
// ─────────────────────────────────────────────────────────────────────────────

const PoseAnalyzerOverlay = ({ exercise, onClose }) => {
  const wsUrl = `ws://localhost:8000/ws/${exercise.id}`;
  const [dots, setDots] = useState('');

  useEffect(() => {
    const id = setInterval(() => {
      setDots((d) => (d.length >= 3 ? '' : d + '.'));
    }, 500);
    return () => clearInterval(id);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-[#2A2A2A]/40 backdrop-blur-[6px] flex items-center justify-center p-6"
    >
      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 16 }}
        transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
        className="bg-white rounded-[1.5rem] shadow-[0_30px_80px_-10px_rgba(42,42,42,0.18)] p-10 max-w-md w-full relative"
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#FBFBF9] flex items-center justify-center text-[#767676] hover:text-[#2A2A2A] transition-colors border border-black/[0.05]"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Animated camera ring */}
        <div className="flex justify-center mb-8">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 rounded-full bg-[#DCE4E0] animate-ping opacity-30" />
            <div className="relative w-20 h-20 rounded-full bg-[#DCE4E0] flex items-center justify-center">
              <Camera className="w-8 h-8 text-[#4A6B5D]" />
            </div>
          </div>
        </div>

        <div className="text-center space-y-3 mb-8">
          <h3 className="text-xl font-light text-[#2A2A2A] tracking-tight">
            Initializing Camera Node
          </h3>
          <p className="text-sm text-[#767676] font-light leading-relaxed">
            Connecting pose analysis stream for{' '}
            <span className="font-medium text-[#2A2A2A]">{exercise.name}</span>
          </p>
        </div>

        {/* Status stream */}
        <div className="bg-[#FBFBF9] rounded-[1rem] p-5 border border-black/[0.05] font-mono text-xs space-y-2.5">
          <div className="flex items-center gap-2.5 text-[#4A6B5D]">
            <Wifi className="w-3.5 h-3.5 shrink-0" />
            <span className="text-[#767676]">WebSocket Target:</span>
            <span className="text-[#2A2A2A] font-semibold break-all">{wsUrl}</span>
          </div>
          <div className="flex items-center gap-2.5 text-[#767676]">
            <div className="w-3.5 h-3.5 shrink-0 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-[#4A6B5D] animate-pulse" />
            </div>
            <span>WebRTC stream negotiating{dots}</span>
          </div>
          <div className="flex items-center gap-2.5 text-[#767676]">
            <div className="w-3.5 h-3.5 shrink-0 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-[#DCE4E0]" />
            </div>
            <span>MediaPipe pose model — standby</span>
          </div>
          <div className="flex items-center gap-2.5 text-[#767676]">
            <div className="w-3.5 h-3.5 shrink-0 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-[#DCE4E0]" />
            </div>
            <span>Exercise token: <span className="text-[#2A2A2A]">{exercise.id}</span></span>
          </div>
        </div>

        <p className="text-center text-xs text-[#767676] mt-6 font-light">
          Ensure your camera is accessible and your body is fully visible in frame.
        </p>
      </motion.div>
    </motion.div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Exercise Preview Pane — Level 4 side-card / overlay tray
// ─────────────────────────────────────────────────────────────────────────────

const ExercisePreviewPane = ({ exercise, onClose, onBeginSession }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }}
      transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
      className="bg-white rounded-[1.5rem] shadow-[0_10px_40px_-10px_rgba(42,42,42,0.08)] p-8 flex flex-col gap-6 border border-black/[0.03]"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs text-[#767676] uppercase tracking-widest font-medium">Exercise Detail</p>
          <h3 className="text-xl font-light text-[#2A2A2A] leading-snug">{exercise.name}</h3>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-[#FBFBF9] flex items-center justify-center text-[#767676] hover:text-[#2A2A2A] transition-colors border border-black/[0.05] shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[#FBFBF9] rounded-[0.875rem] p-3.5 flex flex-col gap-1.5 border border-black/[0.04]">
          <div className="flex items-center gap-1.5 text-[#767676]">
            <TrendingUp className="w-3.5 h-3.5" />
            <span className="text-[10px] uppercase tracking-wider font-medium">Reps</span>
          </div>
          <span className="text-lg font-light text-[#2A2A2A]">
            {exercise.target_reps ?? '—'}
          </span>
        </div>
        <div className="bg-[#FBFBF9] rounded-[0.875rem] p-3.5 flex flex-col gap-1.5 border border-black/[0.04]">
          <div className="flex items-center gap-1.5 text-[#767676]">
            <Timer className="w-3.5 h-3.5" />
            <span className="text-[10px] uppercase tracking-wider font-medium">Duration</span>
          </div>
          <span className="text-lg font-light text-[#2A2A2A]">
            {exercise.target_duration ?? '—'}
          </span>
        </div>
        <div className="bg-[#FBFBF9] rounded-[0.875rem] p-3.5 flex flex-col gap-1.5 border border-black/[0.04]">
          <div className="flex items-center gap-1.5 text-[#767676]">
            <Star className="w-3.5 h-3.5" />
            <span className="text-[10px] uppercase tracking-wider font-medium">XP</span>
          </div>
          <span className="text-lg font-light text-[#4A6B5D] font-medium">
            +{exercise.estimated_xp}
          </span>
        </div>
      </div>

      {/* Pose analyzer badge */}
      <div className={`inline-flex items-center gap-2 self-start px-3 py-1.5 rounded-full text-xs font-medium ${exercise.pose_analyzer
          ? 'bg-[#DCE4E0] text-[#4A6B5D]'
          : 'bg-[#FBFBF9] text-[#767676] border border-black/[0.06]'
        }`}>
        {exercise.pose_analyzer ? (
          <>
            <Camera className="w-3 h-3" />
            CV Tracking Enabled
          </>
        ) : (
          <>
            <Clock className="w-3 h-3" />
            Manual Timer Mode
          </>
        )}
      </div>

      {/* Instructions */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-[#767676]">
          <BookOpen className="w-3.5 h-3.5" />
          <span className="text-xs uppercase tracking-widest font-medium">Form Cues</span>
        </div>
        <ol className="space-y-3">
          {exercise.instructions.map((step, idx) => (
            <li key={idx} className="flex gap-3">
              <span className="shrink-0 w-5 h-5 rounded-full bg-[#DCE4E0] text-[#4A6B5D] text-[10px] font-bold flex items-center justify-center mt-0.5">
                {idx + 1}
              </span>
              <p className="text-sm text-[#767676] font-light leading-relaxed">{step}</p>
            </li>
          ))}
        </ol>
      </div>

      {/* CTA */}
      <button
        onClick={() => onBeginSession(exercise)}
        className="w-full py-4 bg-[#4A6B5D] text-white rounded-[1rem] font-medium tracking-wide text-sm hover:bg-[#3d5a4d] hover:scale-[1.02] active:scale-[0.99] transition-all shadow-[0_8px_24px_-6px_rgba(74,107,93,0.40)] flex items-center justify-center gap-2.5 mt-auto"
      >
        <Zap className="w-4 h-4" />
        Begin Tracking Session
      </button>
    </motion.div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 1 — Modality Discovery
// ─────────────────────────────────────────────────────────────────────────────

const ModalityDiscovery = ({ onSelectModality }) => {
  const modalities = Object.entries(workoutData).map(([key, data]) => ({
    key,
    ...data,
    ...MODALITY_META[key],
  }));

  return (
    <motion.div
      key="level-1"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-10"
    >
      <SectionHeader
        title="Training Library"
        subtitle="Select a discipline to explore your structured programs."
      />

      <motion.div
        variants={cardStagger}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 md:grid-cols-3 gap-5"
      >
        {modalities.map(({ key, title, icon: Icon, tagline, badge, bgDecor, tracks }) => (
          <motion.button
            key={key}
            variants={cardItem}
            onClick={() => onSelectModality(key)}
            className={`group relative text-left bg-white rounded-[1.5rem] p-8 shadow-[0_10px_40px_-10px_rgba(42,42,42,0.04)] hover:shadow-[0_16px_50px_-10px_rgba(42,42,42,0.09)] transition-all duration-300 overflow-hidden border border-black/[0.03] hover:border-[#4A6B5D]/20`}
          >
            {/* Decor gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${bgDecor} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

            {/* Ghost icon */}
            <div className="absolute -right-4 -bottom-4 opacity-[0.04] group-hover:opacity-[0.07] transition-opacity duration-500">
              <Icon className="w-40 h-40 text-[#2A2A2A]" />
            </div>

            <div className="relative z-10 flex flex-col h-full min-h-[200px] justify-between">
              <div>
                <div className="w-12 h-12 rounded-[0.875rem] bg-[#DCE4E0] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Icon className="w-6 h-6 text-[#4A6B5D]" />
                </div>
                <span className="inline-block text-[10px] uppercase tracking-widest font-semibold text-[#4A6B5D] bg-[#DCE4E0] px-2.5 py-1 rounded-full mb-3">
                  {badge}
                </span>
                <h2 className="text-xl font-light text-[#2A2A2A] leading-tight mb-2">{title}</h2>
                <p className="text-sm text-[#767676] font-light leading-relaxed">{tagline}</p>
              </div>
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-black/[0.05]">
                <span className="text-xs text-[#767676]">{tracks.length} program{tracks.length !== 1 ? 's' : ''}</span>
                <ChevronRight className="w-4 h-4 text-[#767676] group-hover:text-[#4A6B5D] group-hover:translate-x-1 transition-all duration-200" />
              </div>
            </div>
          </motion.button>
        ))}
      </motion.div>

      {/* Summary stat strip */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Programs', value: '13', icon: BookOpen },
          { label: 'Exercise Nodes', value: '196', icon: TrendingUp },
          { label: 'Unique Exercises', value: '151', icon: Zap },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-white rounded-[1rem] p-5 shadow-[0_4px_20px_-4px_rgba(42,42,42,0.05)] flex flex-col items-center gap-1 border border-black/[0.03]">
            <Icon className="w-4 h-4 text-[#4A6B5D] mb-1" />
            <span className="text-2xl font-light text-[#2A2A2A]">{value}</span>
            <span className="text-[10px] text-[#767676] uppercase tracking-wider text-center">{label}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 2 — Track List
// ─────────────────────────────────────────────────────────────────────────────

const TrackList = ({ modalityKey, onBack, onSelectTrack }) => {
  const modality = workoutData[modalityKey];
  const meta = MODALITY_META[modalityKey];
  const ModalityIcon = meta.icon;

  return (
    <motion.div key="level-2" variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <BackButton onClick={onBack} label="All Disciplines" />

      <SectionHeader
        title={modality.title}
        subtitle="Choose a training program to explore its structured sessions."
      />

      <motion.div
        variants={cardStagger}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {modality.tracks.map((track) => {
          const trackMeta = TRACK_META[track.id] || { duration: '—', frequency: '—', difficulty: '—' };
          const totalExercises = track.subSections.reduce((sum, s) => sum + s.exercises.length, 0);

          return (
            <motion.button
              key={track.id}
              variants={cardItem}
              onClick={() => onSelectTrack(track)}
              className="group text-left bg-white rounded-[1.5rem] p-7 shadow-[0_10px_40px_-10px_rgba(42,42,42,0.04)] hover:shadow-[0_16px_50px_-10px_rgba(42,42,42,0.09)] transition-all duration-300 border border-black/[0.03] hover:border-[#4A6B5D]/20 relative overflow-hidden"
            >
              {/* Side accent bar */}
              <div className="absolute left-0 top-6 bottom-6 w-0.5 bg-[#DCE4E0] rounded-full group-hover:bg-[#4A6B5D] transition-colors duration-300" />

              <div className="pl-5">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <h3 className="text-lg font-light text-[#2A2A2A] leading-tight">{track.title}</h3>
                    <p className="text-xs text-[#767676] mt-1">{totalExercises} exercises · {track.subSections.length} session{track.subSections.length !== 1 ? 's' : ''}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#767676] group-hover:text-[#4A6B5D] group-hover:translate-x-1 transition-all shrink-0 mt-0.5" />
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1 text-xs text-[#767676] bg-[#FBFBF9] border border-black/[0.05] px-2.5 py-1 rounded-full">
                    <Clock className="w-3 h-3" />
                    {trackMeta.duration}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs text-[#767676] bg-[#FBFBF9] border border-black/[0.05] px-2.5 py-1 rounded-full">
                    <RotateCcw className="w-3 h-3" />
                    {trackMeta.frequency}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs text-[#4A6B5D] bg-[#DCE4E0] px-2.5 py-1 rounded-full font-medium">
                    <TrendingUp className="w-3 h-3" />
                    {trackMeta.difficulty}
                  </span>
                </div>
              </div>
            </motion.button>
          );
        })}
      </motion.div>
    </motion.div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 3 — Sub-Section Grid
// ─────────────────────────────────────────────────────────────────────────────

const SubSectionGrid = ({ track, onBack, onSelectSubSection }) => {
  return (
    <motion.div key="level-3" variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <BackButton onClick={onBack} label="All Programs" />

      <SectionHeader
        title={track.title}
        subtitle="Select a focus session to view its complete exercise roster."
      />

      <motion.div
        variants={cardStagger}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {track.subSections.map((sub, idx) => {
          const totalXp = sub.exercises.reduce((sum, ex) => sum + ex.estimated_xp, 0);
          const hasTimeBased = sub.exercises.some((ex) => ex.target_duration !== null);
          const hasRepBased = sub.exercises.some((ex) => ex.target_reps !== null);

          return (
            <motion.button
              key={sub.id}
              variants={cardItem}
              onClick={() => onSelectSubSection(sub)}
              className="group text-left bg-white rounded-[1.5rem] p-7 shadow-[0_10px_40px_-10px_rgba(42,42,42,0.04)] hover:shadow-[0_16px_50px_-10px_rgba(42,42,42,0.09)] transition-all duration-300 border border-black/[0.03] hover:border-[#4A6B5D]/20 relative overflow-hidden"
            >
              {/* Milestone number */}
              <div className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#FBFBF9] border border-black/[0.05] flex items-center justify-center text-xs font-medium text-[#767676] group-hover:bg-[#DCE4E0] group-hover:text-[#4A6B5D] group-hover:border-[#4A6B5D]/20 transition-all">
                {String(idx + 1).padStart(2, '0')}
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-medium text-[#2A2A2A] leading-tight pr-10">{sub.title}</h3>
                  <p className="text-xs text-[#767676] font-light mt-1.5 leading-relaxed line-clamp-2">
                    {SUBSECTION_DESC[sub.id] || `${sub.exercises.length} exercises in this session.`}
                  </p>
                </div>

                <div className="pt-4 border-t border-black/[0.04] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#767676]">
                      {sub.exercises.length} exercises
                    </span>
                    {hasTimeBased && hasRepBased && (
                      <span className="text-[10px] text-[#767676] bg-[#FBFBF9] border border-black/[0.05] px-1.5 py-0.5 rounded-full">mixed</span>
                    )}
                  </div>
                  <XpBadge xp={totalXp} />
                </div>
              </div>

              <ChevronRight className="absolute bottom-7 right-5 w-4 h-4 text-[#767676] group-hover:text-[#4A6B5D] group-hover:translate-x-1 transition-all duration-200" />
            </motion.button>
          );
        })}
      </motion.div>
    </motion.div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 4 — Exercise Roster
// ─────────────────────────────────────────────────────────────────────────────

const ExerciseRoster = ({ subSection, onBack, completeWorkoutAction }) => {
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [sessionExercise, setSessionExercise] = useState(null); // active tracking session

  // ── Global persistent state (Zustand → localStorage → Firestore) ──────────
  const completedExerciseIdsRaw = useHealthStore((state) => state.dailyGoals.completedExerciseIds);
  const completedExerciseIds = completedExerciseIdsRaw || [];
  const logExerciseCompletion = useHealthStore((state) => state.logExerciseCompletion);
  const resetExerciseCompletion = useHealthStore((state) => state.resetExerciseCompletion);

  const handleBeginSession = (exercise) => {
    setSessionExercise(exercise);
  };

  const handleSessionClose = () => {
    setSessionExercise(null);
  };

  /**
   * Called when a pose-analyzer session ends (user clicks "Complete & Log"
   * inside PoseAnalyzer, or the rep target is reached).
   * Marks the exercise as done in the global store and returns to roster view.
   */
  const handlePoseSessionComplete = (exercise) => {
    logExerciseCompletion(exercise.id);
    setSessionExercise(null);
    setSelectedExercise(null);
  };

  const handleTimerComplete = (exercise) => {
    logExerciseCompletion(exercise.id);
    setSessionExercise(null);
  };

  const handleSelectExercise = (exercise) => {
    setSelectedExercise((prev) => (prev?.id === exercise.id ? null : exercise));
  };

  const allDone = subSection.exercises.every((ex) => completedExerciseIds.includes(ex.id));

  return (
    <motion.div key="level-4" variants={pageVariants} initial="initial" animate="animate" exit="exit">
      {/*
        Full-screen PoseAnalyzer — mounts when the user starts a CV-tracked exercise.
        It renders as a fixed overlay (z-50), so it sits above the entire roster layout.
        On completion it calls handlePoseSessionComplete to mark the exercise done
        and returns control to the roster view.
      */}
      <AnimatePresence>
        {sessionExercise && sessionExercise.pose_analyzer && (
          <PoseAnalyzer
            key={sessionExercise.id}
            exerciseId={sessionExercise.id}
            exerciseName={sessionExercise.name}
            targetReps={
              sessionExercise.target_reps !== null
                ? Number(String(sessionExercise.target_reps).split('-')[0])
                : null
            }
            estimatedXp={sessionExercise.estimated_xp}
            onComplete={() => handlePoseSessionComplete(sessionExercise)}
          />
        )}
      </AnimatePresence>

      <BackButton onClick={onBack} label="Back to Sessions" />

      <SectionHeader
        title={subSection.title}
        subtitle={SUBSECTION_DESC[subSection.id] || 'Complete each exercise in sequence.'}
      />

      {/* Completion banner */}
      <AnimatePresence>
        {allDone && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mb-6 bg-[#DCE4E0] border border-[#4A6B5D]/20 rounded-[1rem] p-5 flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#4A6B5D] shrink-0" />
              <p className="text-sm text-[#4A6B5D] font-medium">Session complete. Every exercise finished.</p>
            </div>
            <button
              onClick={completeWorkoutAction}
              className="text-xs font-semibold text-white bg-[#4A6B5D] px-4 py-2 rounded-full hover:bg-[#3d5a4d] transition-colors shrink-0"
            >
              Log & Finish
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-5 items-start">
        {/* Exercise list column */}
        <div className="space-y-3">
          {subSection.exercises.map((exercise, idx) => {
            const isSelected = selectedExercise?.id === exercise.id;
            const isDone = completedExerciseIds.includes(exercise.id);

            return (
              <motion.div key={exercise.id} layout>
                <button
                  onClick={() => handleSelectExercise(exercise)}
                  className={`w-full text-left rounded-[1rem] p-5 transition-all duration-250 border ${isSelected
                      ? 'bg-white border-[#4A6B5D]/25 shadow-[0_8px_30px_-8px_rgba(74,107,93,0.15)]'
                      : isDone
                        ? 'bg-[#DCE4E0]/40 border-[#4A6B5D]/10'
                        : 'bg-white border-black/[0.04] hover:border-[#4A6B5D]/15 shadow-[0_4px_20px_-4px_rgba(42,42,42,0.04)] hover:shadow-[0_8px_30px_-8px_rgba(42,42,42,0.08)]'
                    }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Index / done indicator */}
                    <div className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${isDone
                        ? 'bg-[#4A6B5D] text-white'
                        : isSelected
                          ? 'bg-[#DCE4E0] text-[#4A6B5D]'
                          : 'bg-[#FBFBF9] text-[#767676] border border-black/[0.06]'
                      }`}>
                      {isDone ? <CheckCircle2 className="w-4 h-4" /> : String(idx + 1).padStart(2, '0')}
                    </div>

                    {/* Name & meta */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium leading-tight truncate ${isDone ? 'text-[#4A6B5D]' : 'text-[#2A2A2A]'
                        }`}>
                        {exercise.name}
                      </p>
                      <p className="text-xs text-[#767676] font-light mt-0.5">
                        {exercise.target_reps
                          ? `${exercise.target_reps} reps`
                          : exercise.target_duration
                            ? `${exercise.target_duration}`
                            : '—'
                        }
                      </p>
                    </div>

                    {/* Right side badges */}
                    <div className="flex items-center gap-2 shrink-0">
                      {exercise.pose_analyzer ? (
                        <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-[#4A6B5D] bg-[#DCE4E0] px-2 py-0.5 rounded-full font-medium">
                          <Camera className="w-2.5 h-2.5" />
                          CV
                        </span>
                      ) : (
                        <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-[#767676] bg-[#FBFBF9] border border-black/[0.05] px-2 py-0.5 rounded-full">
                          <Clock className="w-2.5 h-2.5" />
                          Timer
                        </span>
                      )}
                      <XpBadge xp={exercise.estimated_xp} />
                      {/*
                        Scandi-Minimalist manual reset button — only visible when
                        this exercise has already been marked complete.  Low opacity
                        keeps it from competing with primary action targets.
                        e.stopPropagation() ensures the detail tray is NOT opened.
                      */}
                      {isDone && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            resetExerciseCompletion(exercise.id);
                          }}
                          title="Reset completion"
                          className="opacity-40 hover:opacity-80 transition-opacity duration-200 w-6 h-6 flex items-center justify-center rounded-full hover:bg-[#4A6B5D]/10"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-[#4A6B5D]" />
                        </button>
                      )}
                      <ChevronRight className={`w-4 h-4 transition-all ${isSelected ? 'text-[#4A6B5D] rotate-90' : 'text-[#767676]'}`} />
                    </div>
                  </div>
                </button>

                {/* Inline: countdown timer for non-pose exercises (mobile / when no side pane) */}
                <AnimatePresence>
                  {isSelected && !exercise.pose_analyzer && sessionExercise?.id === exercise.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 lg:hidden overflow-hidden"
                    >
                      <CountdownTimer
                        exercise={exercise}
                        onComplete={() => handleTimerComplete(exercise)}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Preview pane column — sticky on desktop */}
        <div className="hidden lg:block sticky top-6 space-y-4">
          <AnimatePresence mode="wait">
            {selectedExercise ? (
              <div key={selectedExercise.id}>
                <ExercisePreviewPane
                  exercise={selectedExercise}
                  onClose={() => setSelectedExercise(null)}
                  onBeginSession={handleBeginSession}
                />
                {/* Countdown timer pane — for non-pose exercises, shows below preview */}
                <AnimatePresence>
                  {sessionExercise?.id === selectedExercise.id && !selectedExercise.pose_analyzer && (
                    <motion.div
                      key="timer-pane"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 12 }}
                      className="mt-4"
                    >
                      <CountdownTimer
                        exercise={selectedExercise}
                        onComplete={() => handleTimerComplete(selectedExercise)}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <motion.div
                key="empty-pane"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white rounded-[1.5rem] border border-dashed border-[#DCE4E0] p-10 flex flex-col items-center justify-center gap-4 text-center min-h-[300px]"
              >
                <div className="w-12 h-12 rounded-full bg-[#DCE4E0] flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-[#4A6B5D]" />
                </div>
                <p className="text-sm text-[#767676] font-light leading-relaxed">
                  Select an exercise from the list to view its form cues and begin a tracked session.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Session total XP */}
          <div className="bg-white rounded-[1rem] p-5 shadow-[0_4px_20px_-4px_rgba(42,42,42,0.04)] border border-black/[0.03] flex items-center justify-between">
            <div>
              <p className="text-xs text-[#767676] uppercase tracking-widest">Session XP Pool</p>
              <p className="text-2xl font-light text-[#2A2A2A] mt-0.5">
                {subSection.exercises.reduce((sum, ex) => sum + ex.estimated_xp, 0)}
                <span className="text-sm text-[#4A6B5D] ml-1">XP</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-[#767676] uppercase tracking-widest">Completed</p>
              <p className="text-2xl font-light text-[#4A6B5D] mt-0.5">
                {completedExerciseIds.length}
                <span className="text-sm text-[#767676] ml-1">/ {subSection.exercises.length}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: exercise preview appears as bottom tray when selected */}
      <AnimatePresence>
        {selectedExercise && (
          <motion.div
            key="mobile-preview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="lg:hidden fixed bottom-0 left-0 right-0 z-40 p-4 bg-[#FBFBF9]/80 backdrop-blur-xl border-t border-black/[0.06]"
          >
            <ExercisePreviewPane
              exercise={selectedExercise}
              onClose={() => setSelectedExercise(null)}
              onBeginSession={handleBeginSession}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// ROOT Workout Page — Navigation State Machine
// ─────────────────────────────────────────────────────────────────────────────

const Workout = () => {
  const navigate = useNavigate();
  const completeWorkout = useHealthStore((state) => state.completeWorkout);

  // Navigation stack — each level pushes to this array
  const [level, setLevel] = useState(1);
  const [selectedModalityKey, setSelectedModalityKey] = useState(null);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [selectedSubSection, setSelectedSubSection] = useState(null);

  const handleSelectModality = (key) => {
    setSelectedModalityKey(key);
    setLevel(2);
  };

  const handleSelectTrack = (track) => {
    setSelectedTrack(track);
    setLevel(3);
  };

  const handleSelectSubSection = (sub) => {
    setSelectedSubSection(sub);
    setLevel(4);
  };

  const handleBack = useCallback(() => {
    setLevel((l) => {
      const prev = l - 1;
      if (prev === 1) {
        setSelectedModalityKey(null);
        setSelectedTrack(null);
        setSelectedSubSection(null);
      } else if (prev === 2) {
        setSelectedTrack(null);
        setSelectedSubSection(null);
      } else if (prev === 3) {
        setSelectedSubSection(null);
      }
      return prev;
    });
  }, []);

  const handleCompleteWorkout = useCallback(() => {
    completeWorkout();
    navigate('/dashboard');
  }, [completeWorkout, navigate]);

  return (
    <div className="min-h-screen bg-[#FBFBF9]">
      <div className="max-w-6xl mx-auto px-5 py-10 md:px-10 md:py-14">
        <AnimatePresence mode="wait">
          {level === 1 && (
            <ModalityDiscovery key="l1" onSelectModality={handleSelectModality} />
          )}

          {level === 2 && selectedModalityKey && (
            <TrackList
              key="l2"
              modalityKey={selectedModalityKey}
              onBack={handleBack}
              onSelectTrack={handleSelectTrack}
            />
          )}

          {level === 3 && selectedTrack && (
            <SubSectionGrid
              key="l3"
              track={selectedTrack}
              onBack={handleBack}
              onSelectSubSection={handleSelectSubSection}
            />
          )}

          {level === 4 && selectedSubSection && (
            <ExerciseRoster
              key="l4"
              subSection={selectedSubSection}
              onBack={handleBack}
              completeWorkoutAction={handleCompleteWorkout}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Workout;
