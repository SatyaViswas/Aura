import React, { useMemo, useEffect, useState } from 'react';
import useHealthStore from '../store/healthStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Trophy } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, PolarRadiusAxis } from 'recharts';

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
        color: 'text-amber-600 dark:text-amber-400',
        bg: 'bg-amber-500',
      };
    default:
      return {
        label: 'Rest',
        color: 'text-[#767676] dark:text-[#A3A3A3]',
        bg: 'bg-[#DCE4E0] dark:bg-[#2E3A35] border border-black/5 dark:border-white/10',
      };
  }
};

const Dashboard = () => {
  const user = useHealthStore((state) => state.user);
  const dailyGoals = useHealthStore((state) => state.dailyGoals);
  const history = useHealthStore((state) => state.history);

  const [selectedDate, setSelectedDate] = useState(null);

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
  const past35Days = useMemo(() => {
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
      // Create a shallow copy of the entry state before modifying it
      const entryCopy = { ...entry };

      // Absolute Date Matching: Only target Today if entry date exactly matches current UTC date string
      if (entryCopy.date === currentUtcDateStr) {
        // Create a shallow copy of dailyGoals state before modifying or evaluating it
        const stateCopy = { ...dailyGoals };

        const wP = stateCopy.waterTarget > 0 ? (stateCopy.waterLogged / stateCopy.waterTarget) : 0;
        const dP = stateCopy.calorieTarget > 0 ? (stateCopy.calorieLogged / stateCopy.calorieTarget) : 0;
        const fP = stateCopy.focusTarget > 0 ? (stateCopy.focusLogged / stateCopy.focusTarget) : 0;

        // Logic Isolation: Explicitly verify that progress or completed status is only applied if records have data
        const hasProgress =
          wP > 0 ||
          dP > 0 ||
          fP > 0 ||
          (stateCopy.completedExerciseIds && stateCopy.completedExerciseIds.length > 0) ||
          stateCopy.workoutsCompleted ||
          stateCopy.mentalLogged;

        if (hasProgress) {
          const streakKept = wP >= 1 && dP >= 1 && fP >= 1 && stateCopy.workoutsCompleted && stateCopy.mentalLogged;
          if (streakKept) {
            entryCopy.status = 'full';
          } else {
            entryCopy.status = 'partial';
          }
        } else {
          entryCopy.status = 'none';
        }
      } else if (entryCopy.date < currentUtcDateStr) {
        // Evaluate historical archived data for past days in this cycle
        const historyEntry = historyMap[entryCopy.date];

        // Logic Isolation: Verify that the status is only applied if the record for that specific date actually exists and contains data
        if (historyEntry && historyEntry.goals) {
          const g = historyEntry.goals;
          const wP = g.waterTarget > 0 ? (g.waterLogged / g.waterTarget) : 0;
          const dP = g.calorieTarget > 0 ? (g.calorieLogged / g.calorieTarget) : 0;
          const fP = g.focusTarget > 0 ? (g.focusLogged / g.focusTarget) : 0;

          const hasProgress =
            wP > 0 ||
            dP > 0 ||
            fP > 0 ||
            (g.completedExerciseIds && g.completedExerciseIds.length > 0) ||
            g.workoutsCompleted ||
            g.mentalLogged;

          if (hasProgress) {
            if (historyEntry.streakKept) {
              entryCopy.status = 'full';
            } else {
              entryCopy.status = 'partial';
            }
          } else {
            entryCopy.status = 'none';
          }
        } else {
          entryCopy.status = 'none';
        }
      } else {
        // Future days in the cycle are marked 'none'
        entryCopy.status = 'none';
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

    return days;
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
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="p-6 md:p-10 lg:p-14 max-w-7xl mx-auto space-y-12"
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
          </div >
        </motion.section >
      </div >
    </motion.div >
  );
};

export default Dashboard;
