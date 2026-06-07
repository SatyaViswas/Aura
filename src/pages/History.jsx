/**
 * @file History.jsx
 * @description Premium 30-day historical data inspection dashboard for Aura.
 *
 *   Architecture:
 *   ┌─ CalendarStrip ──────────────────────────────────────────────────────────┐
 *   │  Horizontally scrollable 30-day date rail. Clicking a date card sets     │
 *   │  `selectedDate` and triggers the detail pane transition below.           │
 *   └──────────────────────────────────────────────────────────────────────────┘
 *   ┌─ DayDetailPane ──────────────────────────────────────────────────────────┐
 *   │  Reads the matching history node from the global Zustand `history[]`     │
 *   │  array and renders breakdown panels for all 5 wellness pillars:          │
 *   │    • Hydration   • Nutrition   • Deep Focus                              │
 *   │    • Mental Health  • Training Analytics Engine                          │
 *   │  Falls back to a rest-day empty-state when no record exists.             │
 *   └──────────────────────────────────────────────────────────────────────────┘
 */

import React, { useState, useRef, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarDays,
  Droplets,
  Flame,
  BrainCircuit,
  Dumbbell,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Star,
  Moon,
  ListChecks,
  ChevronRight,
  ChevronLeft,
  X,
} from 'lucide-react';
import useHealthStore from '../store/healthStore';

// ─────────────────────────────────────────────────────────────────────────────
// Motion Variants
// ─────────────────────────────────────────────────────────────────────────────

const fadeUp = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: 10, transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] } },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.06 } },
};

const staggerItem = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] } },
};

// ─────────────────────────────────────────────────────────────────────────────
// Utility — build the past-30-days ISO date string array
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns an array of ISO date strings (YYYY-MM-DD) for the past 30 days
 * including today, ordered from the oldest (index 0) to today (index 29).
 */
const buildPast30Days = () => {
  const days = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
};

/**
 * Formats an ISO date string into a two-part label:
 *   dayLabel  — "Mon", "Tue", …
 *   dayNumber — "06", "07", …
 */
const formatDateLabel = (isoDate) => {
  const d = new Date(isoDate + 'T12:00:00'); // noon avoids DST boundary issues
  const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
  const dayNumber = String(d.getDate()).padStart(2, '0');
  const monthLabel = d.toLocaleDateString('en-US', { month: 'short' });
  return { dayLabel, dayNumber, monthLabel };
};

/**
 * Returns the full long-form date label for the detail pane header.
 *   e.g. "Friday, 6 June 2026"
 */
const formatLongDate = (isoDate) => {
  const d = new Date(isoDate + 'T12:00:00');
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// Shared UI Primitives
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Horizontal progress bar used inside each metric card.
 * @param {number} pct - 0 to 100
 */
const ProgressBar = ({ pct }) => (
  <div className="w-full h-1.5 bg-[#DCE4E0] rounded-full overflow-hidden mt-3">
    <motion.div
      className="h-full bg-[#4A6B5D] rounded-full"
      initial={{ width: 0 }}
      animate={{ width: `${Math.min(pct, 100)}%` }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
    />
  </div>
);

/**
 * Circular progress ring used in the workout analytics panel.
 * @param {number} pct - 0 to 100
 * @param {number} size - SVG canvas size in px
 */
const RingProgress = ({ pct, size = 88 }) => {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * Math.min(pct, 100)) / 100;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="-rotate-90"
    >
      {/* Track */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="var(--color-alert)"
        strokeWidth={6}
      />
      {/* Fill */}
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="var(--color-primary)"
        strokeWidth={6}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
      />
    </svg>
  );
};

/** Reusable section label with icon */
const PillarLabel = ({ icon: Icon, label }) => (
  <div className="flex items-center gap-2 text-text-secondary mb-4">
    <Icon className="w-3.5 h-3.5 shrink-0" />
    <span className="text-[10px] uppercase tracking-widest font-semibold">{label}</span>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// MetricCard — generic wrapper used by Hydration, Nutrition, Focus
// ─────────────────────────────────────────────────────────────────────────────

const MetricCard = ({ icon: Icon, pillarLabel, value, target, unit, progressPct, children }) => (
  <motion.div
    variants={staggerItem}
    className="bg-surface rounded-[1.5rem] p-7 shadow-[0_10px_40px_-10px_rgba(42,42,42,0.04)] dark:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.25)] border border-border"
  >
    <PillarLabel icon={Icon} label={pillarLabel} />

    <div className="flex items-end justify-between gap-3">
      <div>
        <span className="text-3xl font-light text-text-primary tabular-nums">
          {value.toLocaleString()}
        </span>
        <span className="text-sm text-text-secondary ml-1.5">{unit}</span>
      </div>
      <div className="text-right">
        <span className="text-xs text-text-secondary font-light">
          Target
        </span>
        <p className="text-sm font-medium text-text-primary mt-0.5">
          {target.toLocaleString()}{' '}
          <span className="font-light text-text-secondary">{unit}</span>
        </p>
      </div>
    </div>

    <ProgressBar pct={progressPct} />

    <p className="text-xs text-text-secondary mt-2 font-light">
      {Math.round(progressPct)}% of daily target reached
    </p>

    {children}
  </motion.div>
);

// ─────────────────────────────────────────────────────────────────────────────
// NutritionMeals — expandable list of logged food
// ─────────────────────────────────────────────────────────────────────────────

const NutritionMeals = ({ meals }) => {
  const [expanded, setExpanded] = useState(false);
  if (!meals || meals.length === 0) return null;

  return (
    <div className="mt-4 pt-4 border-t border-border">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full text-xs font-medium text-text-secondary hover:text-text-primary transition-colors"
      >
        <span>View Logged Meals ({meals.length})</span>
        <motion.div animate={{ rotate: expanded ? 90 : 0 }}>
          <ChevronRight className="w-4 h-4" />
        </motion.div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mt-3 space-y-2"
          >
            {meals.map((meal, idx) => (
              <div key={meal.id || idx} className="flex justify-between items-center p-3 rounded-lg bg-background border border-border text-sm">
                <div>
                  <p className="font-medium text-text-primary">{meal.name}</p>
                  <p className="text-[10px] text-text-secondary uppercase tracking-widest mt-0.5">{meal.type}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-text-primary">{meal.cals} kcal</p>
                  <p className="text-[10px] text-text-secondary tracking-wide mt-0.5">P:{meal.p}g C:{meal.c}g F:{meal.f}g</p>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MentalCard — boolean badge pill + chat history
// ─────────────────────────────────────────────────────────────────────────────

const MentalCard = ({ goals, date }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const logged = goals?.mentalLogged;
  const chat = goals?.mentalChat || [];

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isModalOpen]);

  return (
    <motion.div
      variants={staggerItem}
      className="bg-surface rounded-[1.5rem] p-7 shadow-[0_10px_40px_-10px_rgba(42,42,42,0.04)] dark:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.25)] border border-border flex flex-col justify-start"
    >
      <PillarLabel icon={BrainCircuit} label="Mental Health" />

      <div className="flex items-center gap-4 mt-2">
        <div
          className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 ${logged ? 'bg-[#DCE4E0]' : 'bg-background border border-border'
            }`}
        >
          {logged ? (
            <CheckCircle2 className="w-7 h-7 text-[#4A6B5D]" />
          ) : (
            <XCircle className="w-7 h-7 text-text-secondary/50" />
          )}
        </div>
        <div>
          <p className={`text-base font-medium ${logged ? 'text-[#4A6B5D]' : 'text-text-secondary'}`}>
            {logged ? 'Session Logged' : 'Not Recorded'}
          </p>
          <p className="text-xs text-text-secondary font-light mt-0.5">
            {logged
              ? 'Mindfulness practice completed for this day.'
              : 'No mental wellness activity was recorded.'}
          </p>
        </div>
      </div>

      {chat.length > 1 && (
        <div className="mt-6 pt-4 border-t border-border">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-between w-full text-xs font-medium text-text-secondary hover:text-text-primary transition-colors"
          >
            <span>View Chat Transcript</span>
            <ChevronRight className="w-4 h-4 text-text-secondary" />
          </button>
        </div>
      )}

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-background/60 backdrop-blur-sm"
            />

            {/* Modal Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-lg bg-surface border border-border rounded-[1.5rem] shadow-2xl flex flex-col max-h-[80vh] overflow-hidden z-10"
            >
              {/* Modal Header */}
              <div className="px-6 py-5 border-b border-border flex items-center justify-between shrink-0">
                <div>
                  <h3 className="text-base font-medium text-text-primary">Chat Transcript</h3>
                  <p className="text-[10px] text-text-secondary uppercase tracking-widest mt-0.5">
                    {date ? formatLongDate(date) : 'Mental Health'}
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Chat Message Scroll Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
                {chat.map((msg, idx) => (
                  <div
                    key={msg.id || idx}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] p-4 rounded-2xl text-xs font-light whitespace-pre-wrap ${
                        msg.role === 'user'
                          ? 'bg-background border border-border text-text-primary rounded-tr-sm'
                          : 'bg-alert text-primary rounded-tl-sm'
                      }`}
                    >
                      {msg.parts[0].text}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// WorkoutCard — Training Analytics Engine
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Workout Analytics Engine
 *
 * Reads `completedExerciseIds` from the archived history node.
 * Progress % formula: Math.min((completedExerciseIds.length / 4) * 100, 100)
 * Each exercise contributes 25%; 4 exercises = 100% daily goal.
 *
 * Displays:
 *   • Circular progress ring with exact %
 *   • Exercise count chip (e.g. "3 exercises completed")
 *   • Exhaustive list of exercise ID tokens
 *   • Aggregate XP estimate (20 XP per exercise as a standard baseline)
 */
const WorkoutCard = ({ goals }) => {
  const completedExerciseIds = goals?.completedExerciseIds || [];
  const legacyCompleted = goals?.workoutsCompleted || false;

  // Primary count: use completedExerciseIds if present (new store format).
  // Fall back to treating the legacy boolean as 0 or 4 exercises for
  // historical entries created before the completedExerciseIds field existed.
  const completedCount =
    completedExerciseIds.length > 0
      ? completedExerciseIds.length
      : legacyCompleted
        ? 4
        : 0;

  // Progressive percentage: 25% per exercise, capped at 100%.
  const workoutProgressPct = Math.min((completedCount / 4) * 100, 100);

  // Standard XP baseline: each logged exercise yields 20 XP.
  // This matches the XP accumulation model used in the active workout roster.
  const aggregateXp = completedCount * 20;

  return (
    <motion.div
      variants={staggerItem}
      className="bg-surface rounded-[1.5rem] p-7 shadow-[0_10px_40px_-10px_rgba(42,42,42,0.04)] dark:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.25)] border border-border lg:col-span-2"
    >
      <PillarLabel icon={Dumbbell} label="Training Analytics" />

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-7">
        {/* Ring + count summary */}
        <div className="relative shrink-0 flex items-center justify-center">
          <RingProgress pct={workoutProgressPct} size={96} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-light text-text-primary tabular-nums leading-none">
              {Math.round(workoutProgressPct)}
              <span className="text-xs text-text-secondary">%</span>
            </span>
          </div>
        </div>

        {/* Metric tiles */}
        <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-3 w-full">
          {/* Completed count */}
          <div className="bg-background rounded-[0.875rem] p-4 flex flex-col gap-1.5 border border-border">
            <div className="flex items-center gap-1.5 text-text-secondary">
              <ListChecks className="w-3.5 h-3.5" />
              <span className="text-[10px] uppercase tracking-wider font-medium">Exercises</span>
            </div>
            <span className="text-2xl font-light text-text-primary">
              {completedCount}
              <span className="text-xs text-text-secondary ml-1 font-light">/ 4</span>
            </span>
            <span className="text-[10px] text-text-secondary font-light leading-tight">
              {completedCount === 1
                ? '1 exercise completed'
                : `${completedCount} exercises completed`}
            </span>
          </div>

          {/* Progress milestone */}
          <div className="bg-background rounded-[0.875rem] p-4 flex flex-col gap-1.5 border border-border">
            <div className="flex items-center gap-1.5 text-text-secondary">
              <TrendingUp className="w-3.5 h-3.5" />
              <span className="text-[10px] uppercase tracking-wider font-medium">Goal</span>
            </div>
            <span className="text-2xl font-light text-text-primary">
              {Math.round(workoutProgressPct)}
              <span className="text-xs text-text-secondary ml-0.5">%</span>
            </span>
            <span className="text-[10px] text-text-secondary font-light leading-tight">
              {workoutProgressPct >= 100 ? 'Daily target met' : 'Towards daily goal'}
            </span>
          </div>

          {/* XP earned */}
          <div className="bg-[#DCE4E0] rounded-[0.875rem] p-4 flex flex-col gap-1.5 border border-[#4A6B5D]/10 col-span-2 sm:col-span-1">
            <div className="flex items-center gap-1.5 text-[#4A6B5D]">
              <Star className="w-3.5 h-3.5" />
              <span className="text-[10px] uppercase tracking-wider font-medium">XP Earned</span>
            </div>
            <span className="text-2xl font-light text-[#4A6B5D]">
              +{aggregateXp}
            </span>
            <span className="text-[10px] text-[#4A6B5D]/70 font-light leading-tight">
              Session experience points
            </span>
          </div>
        </div>
      </div>

      {/* Exercise ID token list */}
      {completedExerciseIds.length > 0 && (
        <div className="mt-6 pt-5 border-t border-border">
          <p className="text-[10px] text-text-secondary uppercase tracking-widest font-semibold mb-3">
            Completed Exercise IDs
          </p>
          <div className="flex flex-wrap gap-2">
            {completedExerciseIds.map((id, idx) => (
              <span
                key={id}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[#4A6B5D] bg-[#DCE4E0] px-2.5 py-1 rounded-full"
              >
                <span className="w-4 h-4 rounded-full bg-[#4A6B5D] text-white text-[9px] flex items-center justify-center font-bold shrink-0">
                  {idx + 1}
                </span>
                {id}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Legacy boolean fallback notice */}
      {completedExerciseIds.length === 0 && legacyCompleted && (
        <div className="mt-5 pt-5 border-t border-border">
          <p className="text-xs text-text-secondary font-light">
            This day was recorded as workout-complete using the legacy session flag. Individual
            exercise IDs were not stored for entries before the granular tracking update.
          </p>
        </div>
      )}
    </motion.div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// StreakBadge — shown in the day detail header
// ─────────────────────────────────────────────────────────────────────────────

const StreakBadge = ({ kept }) => (
  <span
    className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${kept
        ? 'bg-[#DCE4E0] text-[#4A6B5D]'
        : 'bg-background text-text-secondary border border-border'
      }`}
  >
    {kept ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
    {kept ? 'Streak Kept' : 'Streak Missed'}
  </span>
);

// ─────────────────────────────────────────────────────────────────────────────
// DayDetailPane — renders the full 5-pillar breakdown for a selected date
// ─────────────────────────────────────────────────────────────────────────────

const DayDetailPane = ({ selectedDate, historyEntry }) => {
  // ── Empty state: rest day or pre-registration ─────────────────────────────
  if (!historyEntry) {
    return (
      <motion.div
        key="empty"
        variants={fadeUp}
        initial="initial"
        animate="animate"
        exit="exit"
        className="flex flex-col items-center justify-center py-20 px-8 text-center"
      >
        <div className="w-20 h-20 rounded-full bg-[#DCE4E0] flex items-center justify-center mb-6">
          <Moon className="w-9 h-9 text-[#4A6B5D]" />
        </div>
        <h3 className="text-xl font-light text-text-primary tracking-tight mb-2">
          No records for this date
        </h3>
        <p className="text-sm text-text-secondary font-light leading-relaxed max-w-xs">
          No metric records found for this date. Take this time to reflect and rest.
        </p>
      </motion.div>
    );
  }

  const { goals, streakKept } = historyEntry;

  // Clamp percentage helper
  const clampPct = (logged, target) =>
    target > 0 ? Math.min(Math.max((logged / target) * 100, 0), 100) : 0;

  const waterPct = clampPct(goals.waterLogged, goals.waterTarget);
  const caloriePct = clampPct(goals.calorieLogged, goals.calorieTarget);
  const focusPct = clampPct(goals.focusLogged, goals.focusTarget);

  return (
    <motion.div
      key={selectedDate}
      variants={fadeUp}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Date header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <p className="text-[10px] text-text-secondary uppercase tracking-widest font-medium mb-1">
            Session Archive
          </p>
          <h2 className="text-2xl font-light text-text-primary tracking-tight">
            {formatLongDate(selectedDate)}
          </h2>
        </div>
        <StreakBadge kept={streakKept} />
      </div>

      {/* 5-pillar grid */}
      <motion.div
        variants={stagger}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5"
      >
        {/* ── Hydration ───────────────────────────────────────────────────── */}
        <MetricCard
          icon={Droplets}
          pillarLabel="Hydration"
          value={goals.waterLogged}
          target={goals.waterTarget}
          unit="ml"
          progressPct={waterPct}
        />

        {/* ── Nutrition ───────────────────────────────────────────────────── */}
        <MetricCard
          icon={Flame}
          pillarLabel="Nutrition"
          value={goals.calorieLogged}
          target={goals.calorieTarget}
          unit="kcal"
          progressPct={caloriePct}
        >
          {/* Macro breakdown sub-row */}
          {(goals.macroProtein > 0 || goals.macroCarbs > 0 || goals.macroFat > 0) && (
            <div className="mt-4 pt-4 border-t border-border grid grid-cols-3 gap-2">
              {[
                { label: 'Protein', value: goals.macroProtein },
                { label: 'Carbs', value: goals.macroCarbs },
                { label: 'Fat', value: goals.macroFat },
              ].map(({ label, value }) => (
                <div key={label} className="text-center">
                  <p className="text-base font-light text-text-primary">
                    {value}
                    <span className="text-[10px] text-text-secondary ml-0.5">g</span>
                  </p>
                  <p className="text-[10px] text-text-secondary uppercase tracking-wider mt-0.5">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          )}
          <NutritionMeals meals={goals.meals} />
        </MetricCard>

        {/* ── Deep Focus ──────────────────────────────────────────────────── */}
        <MetricCard
          icon={TrendingUp}
          pillarLabel="Deep Focus"
          value={goals.focusLogged}
          target={goals.focusTarget}
          unit="min"
          progressPct={focusPct}
        />

        {/* ── Mental Health ───────────────────────────────────────────────── */}
        <MentalCard goals={goals} date={selectedDate} />

        {/* ── Training Analytics Engine ────────────────────────────────────
          Spans full width at the bottom of the grid so the ring and ID list
          have room to breathe across all breakpoints.
        */}
        <WorkoutCard goals={goals} />
      </motion.div>
    </motion.div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// CalendarStrip — 30-day horizontally scrollable date picker rail
// ─────────────────────────────────────────────────────────────────────────────

const CalendarStrip = ({ days, selectedDate, historyMap, onSelectDate }) => {
  const scrollRef = useRef(null);

  const scrollLeft = () => {
    scrollRef.current?.scrollBy({ left: -220, behavior: 'smooth' });
  };

  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: 220, behavior: 'smooth' });
  };

  // Today's ISO string for "Today" label
  const todayIso = new Date().toISOString().split('T')[0];

  return (
    <div className="relative">
      {/* Left scroll arrow */}
      <button
        onClick={scrollLeft}
        aria-label="Scroll calendar left"
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-surface border border-border shadow-[0_2px_12px_rgba(42,42,42,0.06)] flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Scrollable rail */}
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto scroll-smooth px-10 pb-2 scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {days.map((isoDate) => {
          const { dayLabel, dayNumber, monthLabel } = formatDateLabel(isoDate);
          const isSelected = isoDate === selectedDate;
          const isToday = isoDate === todayIso;
          const hasRecord = Boolean(historyMap[isoDate]);

          return (
            <button
              key={isoDate}
              onClick={() => onSelectDate(isoDate)}
              className={`flex-shrink-0 flex flex-col items-center gap-1.5 px-4 py-3.5 rounded-[1rem] transition-all duration-200 border relative ${isSelected
                  ? 'bg-[#4A6B5D] text-white border-[#4A6B5D] shadow-[0_8px_24px_-4px_rgba(74,107,93,0.30)]'
                  : 'bg-surface text-text-primary border-border hover:border-[#4A6B5D]/20 hover:shadow-[0_4px_16px_-4px_rgba(42,42,42,0.08)]'
                }`}
            >
              {/* Day-of-week */}
              <span
                className={`text-[10px] uppercase tracking-widest font-semibold ${isSelected ? 'text-white/70' : 'text-text-secondary'
                  }`}
              >
                {isToday ? 'Today' : dayLabel}
              </span>

              {/* Day number */}
              <span
                className={`text-xl font-light leading-none tabular-nums ${isSelected ? 'text-white' : 'text-text-primary'
                  }`}
              >
                {dayNumber}
              </span>

              {/* Month label */}
              <span
                className={`text-[10px] font-light ${isSelected ? 'text-white/60' : 'text-text-secondary'
                  }`}
              >
                {monthLabel}
              </span>

              {/* Data presence dot */}
              <span
                className={`w-1.5 h-1.5 rounded-full mt-0.5 transition-colors ${hasRecord
                    ? isSelected
                      ? 'bg-surface/70'
                      : 'bg-[#4A6B5D]'
                    : isSelected
                      ? 'bg-surface/20'
                      : 'bg-[#DCE4E0]'
                  }`}
              />
            </button>
          );
        })}
      </div>

      {/* Right scroll arrow */}
      <button
        onClick={scrollRight}
        aria-label="Scroll calendar right"
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-surface border border-border shadow-[0_2px_12px_rgba(42,42,42,0.06)] flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SummaryStatStrip — aggregate counts across the 30-day window
// ─────────────────────────────────────────────────────────────────────────────

const SummaryStatStrip = ({ historyMap, days }) => {
  const stats = useMemo(() => {
    let daysLogged = 0;
    let streaksDays = 0;
    let totalExercises = 0;
    let bestWaterDay = 0;

    days.forEach((isoDate) => {
      const entry = historyMap[isoDate];
      if (!entry) return;

      daysLogged++;
      if (entry.streakKept) streaksDays++;

      const ids = entry.goals?.completedExerciseIds || [];
      totalExercises += ids.length;

      const waterPct =
        entry.goals.waterTarget > 0
          ? (entry.goals.waterLogged / entry.goals.waterTarget) * 100
          : 0;
      if (waterPct > bestWaterDay) bestWaterDay = waterPct;
    });

    return { daysLogged, streaksDays, totalExercises, bestWaterDay: Math.round(bestWaterDay) };
  }, [historyMap, days]);

  const tiles = [
    { label: 'Days Active', value: stats.daysLogged, suffix: '' },
    { label: 'Streak Days', value: stats.streaksDays, suffix: '' },
    { label: 'Exercises Logged', value: stats.totalExercises, suffix: '' },
    { label: 'Best Water Day', value: stats.bestWaterDay, suffix: '%' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
      {tiles.map(({ label, value, suffix }) => (
        <div
          key={label}
          className="bg-surface rounded-[1.5rem] p-6 shadow-[0_10px_40px_-10px_rgba(42,42,42,0.04)] dark:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.25)] border border-border flex flex-col gap-1"
        >
          <span className="text-[10px] text-text-secondary uppercase tracking-widest font-semibold">
            {label}
          </span>
          <span className="text-3xl font-light text-text-primary tabular-nums">
            {value}
            {suffix && (
              <span className="text-base text-text-secondary ml-0.5 font-light">{suffix}</span>
            )}
          </span>
          <span className="text-[10px] text-text-secondary font-light">Last 30 days</span>
        </div>
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// ROOT — History Page
// ─────────────────────────────────────────────────────────────────────────────

const History = () => {
  const history = useHealthStore((state) => state.history);
  // 1. Pull in the active daily goals to capture today's live progress
  const dailyGoals = useHealthStore((state) => state.dailyGoals);

  const days = useMemo(() => buildPast30Days(), []);

  // 2. Build the map, but dynamically inject today's active metrics
  const historyMap = useMemo(() => {
    // Map out the archived days from the database
    const map = history.reduce((acc, entry) => {
      if (entry.date) {
        acc[entry.date] = entry;
      }
      return acc;
    }, {});

    // Intercept today's date
    const todayIso = new Date().toISOString().split('T')[0];

    // Check if the user has logged anything at all today
    const hasProgress =
      dailyGoals.waterLogged > 0 ||
      dailyGoals.calorieLogged > 0 ||
      dailyGoals.focusLogged > 0 ||
      dailyGoals.mentalLogged ||
      (dailyGoals.completedExerciseIds && dailyGoals.completedExerciseIds.length > 0) ||
      dailyGoals.workoutsCompleted;

    // If progress exists, inject a live "ghost" entry into the map for today
    if (hasProgress) {
      // Evaluate if today's streak requirements are currently met
      const streakKept =
        dailyGoals.waterLogged >= dailyGoals.waterTarget &&
        dailyGoals.calorieLogged >= dailyGoals.calorieTarget &&
        dailyGoals.focusLogged >= dailyGoals.focusTarget &&
        dailyGoals.workoutsCompleted &&
        dailyGoals.mentalLogged;

      map[todayIso] = {
        date: todayIso,
        goals: dailyGoals,
        streakKept,
      };
    }

    return map;
  }, [history, dailyGoals]); // Re-calculate instantly when dailyGoals update

  const todayIso = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayIso);

  const selectedEntry = historyMap[selectedDate] || null;

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-5 py-10 md:px-10 md:py-14">

        {/* ── Page Header ──────────────────────────────────────────────────── */}
        <motion.header
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="mb-10 space-y-1"
        >
          <div className="flex items-center gap-3 text-[#4A6B5D] mb-3">
            <CalendarDays className="w-5 h-5" />
            <span className="text-xs uppercase tracking-widest font-semibold">
              Wellness Archive
            </span>
          </div>
          <h1 className="text-3xl md:text-[2.25rem] font-light text-text-primary tracking-tight leading-snug">
            History
          </h1>
          <p className="text-text-secondary text-base font-light">
            Select any day to inspect your full wellness report for that session.
          </p>
        </motion.header>

        {/* ── 30-Day Summary Strip ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: 0.06 }}
        >
          <SummaryStatStrip historyMap={historyMap} days={days} />
        </motion.div>

        {/* ── Calendar Strip ───────────────────────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: 0.12 }}
          className="bg-surface rounded-[1.5rem] p-6 md:p-8 shadow-[0_10px_40px_-10px_rgba(42,42,42,0.04)] dark:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.25)] border border-border mb-8"
        >
          <div className="flex items-center gap-2 text-text-secondary mb-5">
            <CalendarDays className="w-3.5 h-3.5" />
            <span className="text-[10px] uppercase tracking-widest font-semibold">
              30-Day Selector
            </span>
          </div>

          <CalendarStrip
            days={days}
            selectedDate={selectedDate}
            historyMap={historyMap}
            onSelectDate={setSelectedDate}
          />

          {/* Legend */}
          <div className="flex items-center gap-5 mt-5 text-xs font-light text-text-secondary">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#4A6B5D] block" />
              <span>Has data</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#DCE4E0] block" />
              <span>No records</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-md bg-[#4A6B5D] block shadow-[0_2px_6px_rgba(74,107,93,0.3)]" />
              <span>Selected</span>
            </div>
          </div>
        </motion.section>

        {/* ── Day Detail Pane ──────────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          <DayDetailPane
            key={selectedDate}
            selectedDate={selectedDate}
            historyEntry={selectedEntry}
          />
        </AnimatePresence>

      </div>
    </div>
  );
};

export default History;