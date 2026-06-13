import React, { useMemo, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useHealthStore from '../store/healthStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Trophy, Play, Pause, Target, Brain, Dumbbell, CalendarDays, X, ChevronRight, Settings, LogOut } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, PolarRadiusAxis } from 'recharts';
import Water from './Water';
import History from './History';

const formatDateLabel = (dateStr) => {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  const dateObj = new Date(y, m - 1, d);
  return dateObj.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

const getStatusDetails = (status) => {
  switch (status) {
    case 'full':
      return {
        label: 'Complete',
        color: 'text-[#4A6B5D] dark:text-[#6D8C7E]',
        bg: 'bg-[#4A6B5D] dark:bg-[#6D8C7E]',
      };
    case 'partial':
      return {
        label: 'Partial',
        color: 'text-[#5A7C6E] dark:text-[#8DB3A2]',
        bg: 'bg-[#DCE4E0] dark:bg-[#2E3A35]',
      };
    default:
      return {
        label: 'Rest',
        color: 'text-[#767676] dark:text-[#A3A3A3]',
        bg: 'bg-[#FBFBF9] dark:bg-[#1A1A1A] border border-black/5 dark:border-white/5',
      };
  }
};

const Dashboard = () => {
  const user = useHealthStore((state) => state.user);
  const dailyGoals = useHealthStore((state) => state.dailyGoals);
  const history = useHealthStore((state) => state.history);
  const toggleFocusTimer = useHealthStore((state) => state.toggleFocusTimer);
  const focusTimer = useHealthStore((state) => state.focusTimer);
  const logout = useHealthStore((state) => state.logout);

  const navigate = useNavigate();

  const [selectedDate, setSelectedDate] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileHistory, setShowMobileHistory] = useState(false);
  const [showMobileTrackerModal, setShowMobileTrackerModal] = useState(false);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  useEffect(() => {
    const handleDocumentClick = () => {
      setSelectedDate(null);
    };
    document.addEventListener('click', handleDocumentClick);
    return () => {
      document.removeEventListener('click', handleDocumentClick);
    };
  }, []);

  // 1. Real-Time Performance & Metric Calculations
  const getClampedPercentage = (logged, target) =>
    Math.min(Math.max((logged / target) * 100, 0), 100) || 0;

  const waterProgress = getClampedPercentage(dailyGoals.waterLogged, dailyGoals.waterTarget);
  const dietProgress = getClampedPercentage(dailyGoals.calorieLogged, dailyGoals.calorieTarget);
  const focusProgress = getClampedPercentage(dailyGoals.focusLogged, dailyGoals.focusTarget);
  // Workout progress: each completed exercise = 25%. 4 exercises = 100% (cap).
  const completedCount = dailyGoals.completedExerciseIds?.length || 0;
  const workoutProgress = Math.min((completedCount / 4) * 100, 100);
  const mentalProgress = dailyGoals.mentalLogged ? 100 : 0;

  const masterDailyAverage =
    (waterProgress + dietProgress + focusProgress + workoutProgress + mentalProgress) / 5;

  const radarData = [
    { subject: 'Workout', A: workoutProgress, fullMark: 100 },
    { subject: 'Diet', A: dietProgress, fullMark: 100 },
    { subject: 'Focus', A: focusProgress, fullMark: 100 },
    { subject: 'Mental', A: mentalProgress, fullMark: 100 },
    { subject: 'Water', A: waterProgress, fullMark: 100 },
  ];

  // ──────────────────────────────────────────────────────────────────────────────
  // 35-DAY CONSISTENCY GRID: Initialize cycle, manage reset, and build chronological map
  // ──────────────────────────────────────────────────────────────────────────────
  const { past35Days, recent7Days } = useMemo(() => {
    const getLocalDateString = (d = new Date()) => {
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };

    const parseLocalDateString = (dateStr) => {
      const [y, m, d] = dateStr.split('-');
      return new Date(y, m - 1, d);
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayString = getLocalDateString(today);

    // Initialize consistency cycle if not present
    if (!localStorage.getItem('consistencyCycleStartDate')) {
      localStorage.setItem('consistencyCycleStartDate', todayString);
    }

    let cycleStartDateStr = localStorage.getItem('consistencyCycleStartDate');
    let cycleStartDate = parseLocalDateString(cycleStartDateStr);
    cycleStartDate.setHours(0, 0, 0, 0);

    let daysSinceCycleStart = Math.floor((today - cycleStartDate) / (1000 * 60 * 60 * 24));

    // Reset cycle if 35 or more days have elapsed
    if (daysSinceCycleStart >= 35 || daysSinceCycleStart < 0) {
      localStorage.setItem('consistencyCycleStartDate', todayString);
      cycleStartDateStr = todayString;
      cycleStartDate = new Date(today);
      cycleStartDate.setHours(0, 0, 0, 0);
      daysSinceCycleStart = 0;
    }

    // Build history map from the history array
    const historyMap = history.reduce((acc, curr) => {
      if (curr && curr.date) {
        acc[curr.date] = curr;
      }
      return acc;
    }, {});

    // Consistency tracking evaluation function
    const evaluateConsistencyStatus = (entry, currentUtcDateStr) => {
      const entryCopy = { ...entry };

      if (entryCopy.date === currentUtcDateStr) {
        const stateCopy = { ...dailyGoals };

        const getClampedPercentage = (logged, target) =>
          Math.min(Math.max(((logged || 0) / (target || 1)) * 100, 0), 100) || 0;

        const wP = getClampedPercentage(stateCopy.waterLogged, stateCopy.waterTarget);
        const dP = getClampedPercentage(stateCopy.calorieLogged, stateCopy.calorieTarget);
        const fP = getClampedPercentage(stateCopy.focusLogged, stateCopy.focusTarget);
        const wCount = stateCopy.completedExerciseIds?.length || 0;
        const workoutP = Math.min((wCount / 4) * 100, 100);
        const mentalP = stateCopy.mentalLogged ? 100 : 0;

        const progress = (wP + dP + fP + workoutP + mentalP) / 5;

        if (progress > 0 && progress < 100) {
          entryCopy.status = 'partial';
        } else if (progress >= 100) {
          entryCopy.status = 'full';
        } else {
          entryCopy.status = 'rest';
        }
      } else if (entryCopy.date < currentUtcDateStr) {
        const historyEntry = historyMap[entryCopy.date];

        if (historyEntry) {
          if (historyEntry.status) {
            if (historyEntry.status === 'complete') entryCopy.status = 'full';
            else if (historyEntry.status === 'partial') entryCopy.status = 'partial';
            else entryCopy.status = 'rest';
          } else if (historyEntry.goals) {
            // Fallback for older history entries without status
            const g = historyEntry.goals;
            const getClampedPercentage = (logged, target) =>
              Math.min(Math.max(((logged || 0) / (target || 1)) * 100, 0), 100) || 0;

            const wP = getClampedPercentage(g.waterLogged, g.waterTarget);
            const dP = getClampedPercentage(g.calorieLogged, g.calorieTarget);
            const fP = getClampedPercentage(g.focusLogged, g.focusTarget);
            const wCount = g.completedExerciseIds?.length || 0;
            const workoutP = Math.min((wCount / 4) * 100, 100);
            const mentalP = g.mentalLogged ? 100 : 0;

            const progress = (wP + dP + fP + workoutP + mentalP) / 5;

            if (progress > 0 && progress < 100) {
              entryCopy.status = 'partial';
            } else if (progress >= 100) {
              entryCopy.status = 'full';
            } else {
              entryCopy.status = 'rest';
            }
          } else {
            entryCopy.status = 'rest';
          }
        } else {
          entryCopy.status = 'rest';
        }
      } else {
        entryCopy.status = 'rest';
      }

      return entryCopy;
    };

    // Build 35-day array: starting with Day 1 (cycleStartDate) at index 0 up to Day 35 at index 34
    const days = [];
    for (let i = 0; i < 35; i++) {
      const d = new Date(cycleStartDate);
      d.setDate(d.getDate() + i);
      const dateStr = getLocalDateString(d);

      // Always populate date with at least 'empty' so it never disappears
      const initialEntry = { date: dateStr, status: 'empty' };
      const updatedEntry = evaluateConsistencyStatus(initialEntry, todayString);
      
      // If evaluateConsistencyStatus sets it to 'none', keep it as 'empty' placeholder
      if (updatedEntry.status === 'none') {
        updatedEntry.status = 'empty';
      }
      
      days.push(updatedEntry);
    }

    // Build recent 7 days chronologically ending today
    const recentDays = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = getLocalDateString(d);

      const initialEntry = { date: dateStr, status: 'empty' };
      const updatedEntry = evaluateConsistencyStatus(initialEntry, todayString);
      
      if (updatedEntry.status === 'none') {
        updatedEntry.status = 'empty';
      }
      
      recentDays.push(updatedEntry);
    }

    return { past35Days: days, recent7Days: recentDays };
  }, [history, dailyGoals]);

  // Progressive XP threshold: same formula as xpForNextLevel in the store.
  // Level 1→2: 1000 XP, Level 2→3: 1200 XP, Level 3→4: 1400 XP, etc.
  const currentLevel = user.level || 1;
  const totalXp = Number(user.xp) || 0;
  const xpThreshold = 1000 + (currentLevel - 1) * 200;
  // XP sitting in the current level bucket (after prior level thresholds consumed)
  const xpInCurrentLevel = totalXp % xpThreshold;
  const xpPercentage = getClampedPercentage(xpInCurrentLevel, xpThreshold);

  // Motion Architecture
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
  };

  return (
    <>
      {/* ── Mobile UI Wrapper ────────────────────────────────────────────── */}
      <div className="block md:hidden bg-neutral-50 dark:bg-[#121614] min-h-screen text-neutral-900 dark:text-white pb-[calc(6rem+env(safe-area-inset-bottom))]">
        {/* Profile Bottom Sheet */}
        <AnimatePresence>
          {showProfileMenu && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowProfileMenu(false)}
                className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
              />
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed bottom-0 left-0 right-0 z-[70] rounded-t-3xl bg-white dark:bg-[#161a18] p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] border-t border-neutral-200 dark:border-white/10 shadow-2xl"
              >
                <div className="w-12 h-1 bg-neutral-300 dark:bg-white/20 rounded-full mx-auto mb-6" />
                <div className="space-y-2">
                  <button onClick={() => { setShowProfileMenu(false); navigate('/settings'); }} className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors text-left text-neutral-800 dark:text-white font-medium">
                    <Settings className="w-5 h-5 text-neutral-500 dark:text-white/60" />
                    Settings
                  </button>
                  <button onClick={() => { setShowProfileMenu(false); logout(); }} className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors text-left text-red-600 dark:text-red-400 font-medium">
                    <LogOut className="w-5 h-5 text-red-500 dark:text-red-400" />
                    Logout
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* 1. Ambient Greeting & Daily Progress Halo */}
        <div className="px-6 pt-12 pb-6 flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-light text-neutral-500 dark:text-white/90">Good morning,</h1>
            <h2 className="text-3xl font-medium text-neutral-900 dark:text-white">{user.name}</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 shrink-0">
              <svg className="w-16 h-16 transform -rotate-90">
                <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="none" className="text-neutral-200 dark:text-white/10" />
                <circle 
                  cx="32" cy="32" r="28" 
                  stroke="currentColor" strokeWidth="4" fill="none" 
                  strokeDasharray={2 * Math.PI * 28} 
                  strokeDashoffset={(2 * Math.PI * 28) - ((masterDailyAverage / 100) * (2 * Math.PI * 28))} 
                  strokeLinecap="round" 
                  className="text-[#4A6B5D] transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[10px] font-bold text-[#4A6B5D]">{Math.round(masterDailyAverage)}%</span>
              </div>
            </div>
            <button onClick={() => setShowProfileMenu(true)} className="w-9 h-9 rounded-full bg-neutral-200 dark:bg-white/10 border border-neutral-300 dark:border-white/25 flex items-center justify-center text-neutral-600 dark:text-neutral-300 font-semibold text-xs shrink-0 cursor-pointer hover:opacity-80 transition-opacity">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </button>
          </div>
        </div>

        {/* 2. 7-Day Streak Strip */}
        <div className="px-4 mb-6">
          <div className="bg-white dark:bg-white/5 border border-neutral-200 dark:border-white/10 backdrop-blur-md rounded-2xl p-5 shadow-[0_10px_30px_rgba(0,0,0,0.05)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.2)]">
            <div className="flex justify-between items-center mb-5">
              <span className="text-sm font-medium text-neutral-700 dark:text-white/80">Consistency</span>
              <button onClick={() => setShowMobileTrackerModal(true)} className="text-[11px] text-[#4A6B5D] dark:text-[#6D8C7E] font-semibold tracking-wider uppercase flex items-center hover:text-[#5A7B6D] dark:hover:text-[#8DB3A2] transition-colors">
                35-Day View <ChevronRight className="w-3 h-3 ml-0.5" strokeWidth={3} />
              </button>
            </div>
            <div className="flex justify-between items-center">
              {recent7Days.map((day, idx) => (
                <div key={idx} className="flex flex-col items-center gap-2.5">
                  <span className="text-[9px] uppercase tracking-wider font-medium text-neutral-400 dark:text-white/40">{formatDateLabel(day.date).split(' ')[0]}</span>
                  <div className={`w-7 h-7 rounded-full transition-all ${
                    day.status === 'full' 
                      ? 'bg-[#4A6B5D] dark:bg-[#6D8C7E] shadow-[0_0_12px_rgba(74,107,93,0.5)]' 
                      : day.status === 'partial' 
                        ? 'bg-[#DCE4E0] dark:bg-[#2E3A35]' 
                        : 'bg-[#FBFBF9] dark:bg-[#1A1A1A] border border-black/5 dark:border-white/5'
                  }`} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Twin-Column Micro-Card Grid */}
        <div className="grid grid-cols-2 gap-3 px-4">
          {/* Card A: Hydration */}
          <div className="col-span-1 shadow-[0_10px_30px_rgba(0,0,0,0.05)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.1)]">
            <Water variant="compact" />
          </div>

          {/* Card B: Deep Work */}
          <div className="col-span-1 bg-white dark:bg-white/5 border border-neutral-200 dark:border-white/10 backdrop-blur-md rounded-[1.25rem] p-4 flex flex-col justify-between min-h-[140px] shadow-[0_10px_30px_rgba(0,0,0,0.05)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.1)]">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center shrink-0">
                 <Target className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
              </div>
              <button onClick={toggleFocusTimer} className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-white/10 flex items-center justify-center hover:bg-neutral-200 dark:hover:bg-white/20 transition-colors shadow-sm">
                {focusTimer.isActive ? <Pause className="w-4 h-4 text-neutral-600 dark:text-white" /> : <Play className="w-4 h-4 text-neutral-600 dark:text-white pl-0.5" />}
              </button>
            </div>
            <div className="flex flex-col mt-3">
              <span className="text-2xl font-light tabular-nums tracking-tight">{formatTime(focusTimer.timeLeft)}</span>
              <span className="text-[11px] text-neutral-500 dark:text-white/50 font-medium tracking-wide mt-0.5">Deep Work</span>
            </div>
          </div>

          {/* Card C: Nutrition */}
          <div className="col-span-1 bg-white dark:bg-white/5 border border-neutral-200 dark:border-white/10 backdrop-blur-md rounded-[1.25rem] p-4 flex flex-col justify-between min-h-[140px] shadow-[0_10px_30px_rgba(0,0,0,0.05)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.1)]">
             <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center shrink-0">
                 <Flame className="w-5 h-5 text-orange-500 dark:text-orange-400" />
             </div>
             <div className="flex flex-col mt-2">
               <span className="text-lg font-semibold tracking-tight">{dailyGoals.calorieLogged} <span className="text-[10px] text-neutral-400 dark:text-white/40 font-light tabular-nums">/ {dailyGoals.calorieTarget}</span></span>
               <div className="w-full h-1 bg-neutral-100 dark:bg-white/10 rounded-full mt-2 overflow-hidden">
                 <div className="h-full bg-orange-400 rounded-full" style={{ width: `${Math.min((dailyGoals.calorieLogged / dailyGoals.calorieTarget) * 100, 100)}%` }} />
               </div>
               <span className="text-[11px] text-neutral-500 dark:text-white/50 font-medium tracking-wide mt-2">Nutrition</span>
             </div>
          </div>

          {/* Card D: Workout */}
          <div onClick={() => navigate('/workout')} className="col-span-1 bg-[#4A6B5D] border border-white/10 backdrop-blur-md rounded-[1.25rem] p-4 flex flex-col justify-between hover:bg-[#5A7B6D] transition-colors cursor-pointer min-h-[140px] relative overflow-hidden shadow-[0_10px_30px_rgba(74,107,93,0.2)] group">
            <div className="absolute -right-4 -top-4 text-white/10 group-hover:scale-110 transition-transform duration-500">
              <Dumbbell className="w-24 h-24 transform -rotate-12" />
            </div>
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0 z-10 backdrop-blur-sm">
                 <Play className="w-4 h-4 text-white pl-0.5" />
            </div>
            <div className="flex flex-col mt-3 z-10">
               <span className="text-white text-sm font-semibold tracking-wide">Start Session</span>
               <span className="text-white/70 text-[9px] uppercase tracking-widest mt-1 font-medium">Pose Tracking</span>
            </div>
          </div>
        </div>

        {/* Mobile History Portal Overlay */}
        <AnimatePresence>
          {showMobileHistory && (
            <motion.div
              initial={{ opacity: 0, x: "100%" }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-0 z-[60] bg-neutral-50 dark:bg-[#121614] overflow-y-auto no-scrollbar"
            >
              <div className="sticky top-0 z-[70] bg-neutral-50/80 dark:bg-[#121614]/80 backdrop-blur-md px-6 py-4 flex items-center border-b border-neutral-200 dark:border-white/10">
                <button onClick={() => setShowMobileHistory(false)} className="flex items-center text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:text-primary transition-colors">
                  ← Back to Dashboard
                </button>
              </div>
              <div className="pb-[calc(6rem+env(safe-area-inset-bottom))]">
                <History />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Consistency Tracker Modal */}
        <AnimatePresence>
          {showMobileTrackerModal && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                onClick={() => setShowMobileTrackerModal(false)} 
                className="absolute inset-0 bg-neutral-900/60 dark:bg-black/80 backdrop-blur-sm" 
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }} 
                animate={{ opacity: 1, scale: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.95, y: 20 }} 
                className="relative w-full max-w-sm bg-white dark:bg-[#1A1D1B] border border-neutral-200 dark:border-white/10 rounded-[2rem] p-6 shadow-2xl z-10"
              >
                <button 
                  onClick={() => setShowMobileTrackerModal(false)} 
                  className="absolute top-5 right-5 text-neutral-400 dark:text-white/40 hover:text-neutral-600 dark:hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="mb-6">
                  <h3 className="text-xl font-light text-neutral-900 dark:text-white mb-1">Consistency</h3>
                  <p className="text-sm text-neutral-500 dark:text-white/50 font-light">Your past 35 days of mindful effort.</p>
                </div>
                <div className="grid grid-cols-7 gap-3 justify-items-center mb-6">
                  {past35Days.map((day, idx) => (
                    <div key={idx} className="relative flex justify-center">
                      <div 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDate(selectedDate?.date === day.date ? null : day);
                        }}
                        className={`w-[34px] h-[34px] rounded-[0.4rem] flex items-center justify-center transition-all duration-300 cursor-pointer ${
                          day.status === 'full' 
                            ? 'bg-[#4A6B5D] dark:bg-[#6D8C7E] shadow-[0_0_10px_rgba(74,107,93,0.3)]' 
                            : day.status === 'partial' 
                              ? 'bg-[#DCE4E0] dark:bg-[#2E3A35]' 
                              : 'bg-[#FBFBF9] dark:bg-[#1A1A1A] border border-black/5 dark:border-white/5'
                        } ${
                          selectedDate?.date === day.date
                            ? 'ring-2 ring-[#4A6B5D] dark:ring-[#6D8C7E] scale-105'
                            : ''
                        }`} 
                      />
                      <AnimatePresence>
                        {selectedDate?.date === day.date && (
                          <motion.div
                            initial={{ opacity: 0, y: 5, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 5, scale: 0.95 }}
                            transition={{ duration: 0.15, ease: 'easeOut' }}
                            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-[70] w-32 bg-white/95 dark:bg-[#2A2A2A]/95 backdrop-blur-md border border-neutral-200 dark:border-white/[0.1] p-2 rounded-xl shadow-xl pointer-events-none flex flex-col gap-0.5 items-center text-center"
                          >
                            <span className="text-[10px] font-semibold tracking-wider text-neutral-500 dark:text-[#A3A3A3] uppercase">
                              {formatDateLabel(day.date)}
                            </span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <div className={`w-2 h-2 rounded-full ${
                                day.status === 'full' 
                                  ? 'bg-[#4A6B5D] dark:bg-[#6D8C7E]' 
                                  : day.status === 'partial' 
                                    ? 'bg-[#DCE4E0] dark:bg-[#2E3A35]' 
                                    : 'bg-[#FBFBF9] dark:bg-[#1A1A1A] border border-black/5 dark:border-white/5'
                              }`} />
                              <span className="text-[11px] font-medium text-neutral-800 dark:text-[#FBFBF9] capitalize">
                                {day.status === 'empty' ? 'Future' : day.status === 'rest' ? 'Rest Day' : day.status}
                              </span>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>

                {/* Mobile Legend */}
                <div className="flex items-center justify-center gap-4 text-[11px] font-light text-neutral-500 dark:text-white/60 mb-6">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-[#FBFBF9] dark:bg-[#1A1A1A] block border border-black/5 dark:border-white/10" />
                    <span>Rest</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-[#DCE4E0] dark:bg-[#2E3A35] block" />
                    <span>Partial</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-[#4A6B5D] dark:bg-[#6D8C7E] block shadow-[0_0_6px_rgba(74,107,93,0.3)]" />
                    <span>Complete</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setShowMobileTrackerModal(false);
                    setShowMobileHistory(true);
                  }}
                  className="w-full py-3.5 bg-[#4A6B5D] hover:bg-[#5A7B6D] text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                >
                  Go to History <ChevronRight className="w-4 h-4" />
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Desktop UI Wrapper ───────────────────────────────────────────── */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="hidden md:block p-6 md:p-10 lg:p-14 max-w-7xl mx-auto space-y-12"
      >
        {/* 2. Greeting & Progression Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          <motion.section
            variants={itemVariants}
            className="lg:col-span-9 bg-white dark:bg-[#262626] rounded-[1.5rem] p-8 md:p-10 shadow-[0_10px_40px_-10px_rgba(42,42,42,0.04)] dark:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.25)] flex flex-col justify-between relative overflow-hidden border border-black/[0.03] dark:border-white/[0.05]"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
              <div className="space-y-2">
                <h1 className="text-3xl md:text-4xl font-light text-[#2A2A2A] dark:text-[#FBFBF9] tracking-tight">
                  Good morning, <span className="font-medium">{user.name}</span>.
                </h1>
                <p className="text-[#767676] dark:text-[#A3A3A3] text-lg font-light flex items-center gap-2">
                  Level {currentLevel} •{' '}
                  <Flame className="w-5 h-5 text-[#4A6B5D] dark:text-[#6D8C7E]" strokeWidth={1.5} />{' '}
                  {user.currentStreak} Day Streak
                </p>
              </div>

              <div className="flex flex-col items-start md:items-end">
                <span className="text-5xl font-light text-[#4A6B5D] dark:text-[#6D8C7E]">
                  {Math.round(masterDailyAverage)}%
                </span>
                <span className="text-[#767676] dark:text-[#A3A3A3] text-sm uppercase tracking-widest mt-1">
                  Today's Progress
                </span>
              </div>
            </div>

            {/* Linear XP Progress Bar */}
            <div className="space-y-3">
              <div className="flex justify-between text-sm font-medium text-[#767676] dark:text-[#A3A3A3]">
                <span>Progress to Level {currentLevel + 1}</span>
                <span>{Math.round(xpPercentage)}%</span>
              </div>
              <div className="w-full h-3 bg-[#DCE4E0] dark:bg-[#2E3A35] rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-[#4A6B5D] dark:bg-[#6D8C7E]"
                  initial={{ width: 0 }}
                  animate={{ width: `${xpPercentage}%` }}
                  transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
                />
              </div>
            </div>
          </motion.section>

          {/* Dynamic Card: Today's XP vs Lifetime Peak */}
          <motion.section
            variants={itemVariants}
            className="lg:col-span-3 bg-white dark:bg-[#262626] rounded-[1.5rem] p-8 shadow-[0_10px_40px_-10px_rgba(42,42,42,0.04)] dark:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.25)] flex flex-col items-center justify-center gap-3 border border-black/[0.03] dark:border-white/[0.05] text-center"
          >
            <div className="w-12 h-12 rounded-[1rem] bg-[#DCE4E0] dark:bg-[#2E3A35] flex items-center justify-center mb-1">
              <Trophy className="w-6 h-6 text-[#4A6B5D] dark:text-[#6D8C7E]" />
            </div>
            <span className="text-3xl font-light text-[#2A2A2A] dark:text-[#FBFBF9] tabular-nums flex items-baseline justify-center">
              {dailyGoals.dailyXpEarned || 0}
              <span className="text-sm text-[#767676] dark:text-[#A3A3A3] px-1 font-light">/</span>
              <span className="text-xl font-normal text-[#4A6B5D] dark:text-[#6D8C7E]">{user.highestDailyXp || 0}</span>
              <span className="text-xs text-[#4A6B5D] dark:text-[#6D8C7E] font-medium ml-1">XP</span>
            </span>
            <span className="text-xs text-[#767676] dark:text-[#A3A3A3] uppercase tracking-widest font-light">
              Today vs Best Ever
            </span>
          </motion.section>
        </div>

        {/* Quick Action Modules */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <motion.div variants={itemVariants} className="w-full h-full">
            <Water />
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* 3. Pentagon Radar Chart */}
          <motion.section
            variants={itemVariants}
            className="lg:col-span-7 bg-white dark:bg-[#262626] rounded-[1.5rem] p-8 md:p-12 shadow-[0_10px_40px_-10px_rgba(42,42,42,0.04)] dark:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.25)] flex flex-col items-center justify-center min-h-[450px] border border-black/[0.03] dark:border-white/[0.05]"
          >
            <h2 className="text-xl font-light text-[#2A2A2A] dark:text-[#FBFBF9] mb-2 self-start">
              Balance Overview
            </h2>
            <p className="text-[#767676] dark:text-[#A3A3A3] font-light text-sm mb-8 self-start">
              Your 5 target pillars relative to goals.
            </p>

            <div className="w-full h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                  <PolarGrid gridType="polygon" stroke="#E5E7EB" strokeDasharray="0" />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{ fill: '#767676', fontSize: 13, fontWeight: 300, dy: 4 }}
                    axisLine={false}
                  />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar
                    name="Metrics"
                    dataKey="A"
                    stroke="#4A6B5D"
                    strokeWidth={2}
                    fill="#4A6B5D"
                    fillOpacity={0.12}
                    isAnimationActive={true}
                    animationDuration={1500}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </motion.section>

          {/* 35-Day Consistency Heatmap */}
          <motion.section
            variants={itemVariants}
            className="lg:col-span-5 bg-white dark:bg-[#262626] rounded-[1.5rem] p-8 md:p-12 shadow-[0_10px_40px_-10px_rgba(42,42,42,0.04)] dark:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.25)] flex flex-col justify-between border border-black/[0.03] dark:border-white/[0.05]"
          >
            <div className="mb-6">
              <h2 className="text-xl font-light text-[#2A2A2A] dark:text-[#FBFBF9] mb-2">Consistency</h2>
              <p className="text-[#767676] dark:text-[#A3A3A3] font-light text-sm">
                Last 35 days of mindful effort.
              </p>
            </div>

            <div className="flex-1 flex flex-row items-center justify-center">
              <div className="grid grid-cols-7 grid-flow-row gap-2 md:gap-3 justify-items-center">
                {past35Days.map((day, idx) => (
                  <div key={idx} className="relative">
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDate(selectedDate?.date === day.date ? null : day);
                      }}
                      className={`w-7 h-7 md:w-10 md:h-10 rounded-md transition-all duration-300 cursor-pointer ${
                        day.status === 'full'
                          ? 'bg-[#4A6B5D] dark:bg-[#6D8C7E] shadow-[0_0_12px_rgba(74,107,93,0.3)] hover:scale-110 active:scale-95'
                          : day.status === 'partial'
                          ? 'bg-[#DCE4E0] dark:bg-[#2E3A35] hover:scale-105 active:scale-95'
                          : 'bg-[#FBFBF9] dark:bg-[#1A1A1A] border border-black/5 dark:border-white/5 hover:scale-105 active:scale-95'
                      } ${
                        selectedDate?.date === day.date
                          ? 'ring-2 ring-[#4A6B5D] dark:ring-[#6D8C7E] scale-105 shadow-[0_0_15px_rgba(74,107,93,0.4)] dark:shadow-[0_0_15px_rgba(109,140,126,0.4)]'
                          : ''
                      }`}
                    />

                    <AnimatePresence>
                      {selectedDate?.date === day.date && (
                        <motion.div
                          initial={{ opacity: 0, y: 5, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 5, scale: 0.95 }}
                          transition={{ duration: 0.15, ease: 'easeOut' }}
                          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 z-30 w-36 bg-white/95 dark:bg-[#2A2A2A]/95 backdrop-blur-md border border-black/[0.08] dark:border-white/[0.1] p-2.5 rounded-xl shadow-[0_12px_24px_rgba(0,0,0,0.08)] dark:shadow-[0_12px_24px_rgba(0,0,0,0.35)] pointer-events-none flex flex-col gap-0.5 items-center text-center"
                        >
                          <span className="text-[10px] font-semibold tracking-wider text-[#767676] dark:text-[#A3A3A3] uppercase">
                            {formatDateLabel(day.date)}
                          </span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${getStatusDetails(day.status).bg}`} />
                            <span className={`text-[12px] font-medium ${getStatusDetails(day.status).color}`}>
                              {getStatusDetails(day.status).label}
                            </span>
                          </div>
                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-white/95 dark:border-t-[#2A2A2A]/95" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-10 flex items-center justify-end gap-5 text-xs font-light text-[#767676] dark:text-[#A3A3A3]">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-[#FBFBF9] dark:bg-[#1A1A1A] block shadow-sm border border-black/5 dark:border-white/10" />
                <span>Rest</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-[#DCE4E0] dark:bg-[#2E3A35] block" />
                <span>Partial</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-[#4A6B5D] dark:bg-[#6D8C7E] block shadow-[0_0_8px_rgba(74,107,93,0.3)]" />
                <span>Complete</span>
              </div>
            </div>
          </motion.section>
        </div>
      </motion.div>
    </>
  );

};

export default Dashboard;
