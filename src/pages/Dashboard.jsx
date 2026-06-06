import React, { useMemo, useEffect, useState } from 'react';
import useHealthStore from '../store/healthStore';
import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, PolarRadiusAxis } from 'recharts';

const Dashboard = () => {
  const user = useHealthStore((state) => state.user);
  const dailyGoals = useHealthStore((state) => state.dailyGoals);
  const history = useHealthStore((state) => state.history);

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
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // Initialize consistency cycle if not present
    if (!localStorage.getItem('consistencyCycleStartDate')) {
      localStorage.setItem('consistencyCycleStartDate', todayStr);
    }

    const cycleStartDateStr = localStorage.getItem('consistencyCycleStartDate');
    const cycleStartDate = new Date(cycleStartDateStr);
    const daysSinceCycleStart = Math.floor((today - cycleStartDate) / (1000 * 60 * 60 * 24));

    // Reset cycle if > 35 days have elapsed
    if (daysSinceCycleStart > 35) {
      localStorage.setItem('consistencyCycleStartDate', todayStr);
      localStorage.removeItem('consistencyGridData'); // Clear old grid data if stored
    }

    // Build history map from the history array
    const historyMap = history.reduce((acc, curr) => {
      acc[curr.date] = curr;
      return acc;
    }, {});

    // Build 35-day array: chronologically from oldest (Day -34) to newest (Day 0 = today)
    const days = [];
    for (let i = 34; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      let status = 'none';

      if (dateStr === todayStr) {
        // Evaluate live real-time data for "Today"
        const g = dailyGoals;
        const wP = g.waterTarget > 0 ? (g.waterLogged / g.waterTarget) : 0;
        const dP = g.calorieTarget > 0 ? (g.calorieLogged / g.calorieTarget) : 0;
        const fP = g.focusTarget > 0 ? (g.focusLogged / g.focusTarget) : 0;
        const someProgress =
          wP > 0 || dP > 0 || fP > 0 ||
          (g.completedExerciseIds?.length > 0) ||
          g.workoutsCompleted ||
          g.mentalLogged;

        const streakKept = wP >= 1 && dP >= 1 && fP >= 1 && g.workoutsCompleted && g.mentalLogged;

        if (streakKept) {
          status = 'full';
        } else if (someProgress) {
          status = 'partial';
        }
      } else {
        // Evaluate historical archived data for past days
        const entry = historyMap[dateStr];
        if (entry) {
          const g = entry.goals;
          const wP = g.waterTarget > 0 ? (g.waterLogged / g.waterTarget) : 0;
          const dP = g.calorieTarget > 0 ? (g.calorieLogged / g.calorieTarget) : 0;
          const fP = g.focusTarget > 0 ? (g.focusLogged / g.focusTarget) : 0;
          const someProgress =
            wP > 0 || dP > 0 || fP > 0 ||
            (g.completedExerciseIds?.length > 0) ||
            g.workoutsCompleted ||
            g.mentalLogged;

          if (entry.streakKept) {
            status = 'full';
          } else if (someProgress) {
            status = 'partial';
          }
        }
      }

      days.push({ date: dateStr, status });
    }

    return days;
  }, [history, dailyGoals]);

  // Derived XP progress
  const currentLevel = user.level || 1;
  const xpPercentage = dailyGoals.leveledUpToday || masterDailyAverage >= 100
    ? 100
    : (user.xp > 0
        ? getClampedPercentage(user.xp % 1000, 1000)
        : masterDailyAverage);

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
      <motion.section
        variants={itemVariants}
        className="bg-white dark:bg-[#262626] rounded-[1.5rem] p-8 md:p-10 shadow-[0_10px_40px_-10px_rgba(42,42,42,0.04)] dark:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.25)] flex flex-col gap-8 relative overflow-hidden border border-black/[0.03] dark:border-white/[0.05]"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
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
              Daily Average
            </span>
          </div>
        </div >

        {/* Linear XP Progress Bar */}
        < div className="space-y-3" >
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
        </div >
      </motion.section >

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

          <div className="flex-1 flex items-center justify-center">
            <div className="grid grid-cols-7 gap-3">
              {past35Days.map((day, idx) => (
                <div
                  key={idx}
                  className={`w-8 h-8 md:w-10 md:h-10 rounded-md transition-all duration-300 ${day.status === 'full'
                    ? 'bg-[#4A6B5D] dark:bg-[#6D8C7E] shadow-[0_0_12px_rgba(74,107,93,0.3)] scale-105'
                    : day.status === 'partial'
                      ? 'bg-[#DCE4E0] dark:bg-[#2E3A35]'
                      : 'bg-[#FBFBF9] dark:bg-[#1A1A1A] border border-black/5 dark:border-white/5'
                    }`}
                  title={day.date}
                />
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
