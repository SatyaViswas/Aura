/**
 * @file Settings.jsx
 * @description Aura — User account, personalization, and theme preference panel.
 *
 * Features:
 *   • Editable daily targets for Water, Calories, and Focus with immediate
 *     store persistence via `updateDailyTargets`.
 *   • Dark / Light mode toggle wired to `toggleTheme` + Zustand `theme` state.
 *   • Animated save confirmation toast (no external dependency needed).
 *   • Full Scandi-Minimalist token compliance with `dark:` mode variants.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings2,
  Droplets,
  Flame,
  Target,
  Moon,
  Sun,
  CheckCircle2,
  User,
  LogOut,
} from 'lucide-react';
import useHealthStore from '../store/healthStore';

// ─────────────────────────────────────────────────────────────────────────────
// Toggle Switch — accessible boolean pill
// ─────────────────────────────────────────────────────────────────────────────

const ToggleSwitch = ({ checked, onChange, id }) => (
  <button
    id={id}
    role="switch"
    aria-checked={checked}
    onClick={onChange}
    className={`relative inline-flex h-7 w-13 w-[52px] shrink-0 items-center rounded-full transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4A6B5D] dark:focus-visible:ring-[#6D8C7E] ${
      checked
        ? 'bg-[#4A6B5D] dark:bg-[#6D8C7E]'
        : 'bg-[#DCE4E0] dark:bg-[#2E3A35]'
    }`}
  >
    <span
      className={`inline-block h-5 w-5 rounded-full bg-surface shadow-sm transform transition-transform duration-300 ${
        checked ? 'translate-x-7' : 'translate-x-1'
      }`}
    />
  </button>
);

// ─────────────────────────────────────────────────────────────────────────────
// TargetInput — labelled numeric input with icon
// ─────────────────────────────────────────────────────────────────────────────

const TargetInput = ({ icon: Icon, label, unit, value, onChange }) => (
  <div className="flex items-center justify-between gap-4 py-4 border-b border-border dark:border-white/[0.06] last:border-0">
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl bg-[#DCE4E0] dark:bg-[#2E3A35] flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-[#4A6B5D] dark:text-[#6D8C7E]" />
      </div>
      <div>
        <p className="text-sm font-medium text-text-primary">{label}</p>
        <p className="text-xs text-text-secondary font-light">{unit}</p>
      </div>
    </div>

    <input
      type="number"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      min={0}
      className="w-24 text-right px-3 py-2 rounded-xl bg-background border border-black/[0.07] dark:border-white/[0.08] text-sm font-medium text-text-primary focus:outline-none focus:ring-2 focus:ring-[#4A6B5D]/30 dark:focus:ring-[#6D8C7E]/30 transition-all tabular-nums"
    />
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// SectionCard — white/dark surface wrapper with heading
// ─────────────────────────────────────────────────────────────────────────────

const SectionCard = ({ title, subtitle, children }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
    className="bg-surface rounded-[1.5rem] p-7 shadow-[0_10px_40px_-10px_rgba(42,42,42,0.04)] dark:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.25)] border border-border"
  >
    {(title || subtitle) && (
      <div className="mb-5">
        {title && (
          <h2 className="text-base font-medium text-text-primary tracking-tight">
            {title}
          </h2>
        )}
        {subtitle && (
          <p className="text-xs text-text-secondary font-light mt-0.5">
            {subtitle}
          </p>
        )}
      </div>
    )}
    {children}
  </motion.div>
);

// ─────────────────────────────────────────────────────────────────────────────
// SaveToast — ephemeral confirmation badge
// ─────────────────────────────────────────────────────────────────────────────

const SaveToast = ({ visible }) => (
  <AnimatePresence>
    {visible && (
      <motion.div
        key="save-toast"
        initial={{ opacity: 0, y: 8, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8, scale: 0.95 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="fixed bottom-28 md:bottom-8 right-6 z-50 inline-flex items-center gap-2 bg-[#4A6B5D] dark:bg-[#6D8C7E] text-white text-sm font-medium px-4 py-3 rounded-[0.875rem] shadow-[0_8px_24px_-4px_rgba(74,107,93,0.40)]"
      >
        <CheckCircle2 className="w-4 h-4" />
        Targets saved
      </motion.div>
    )}
  </AnimatePresence>
);

// ─────────────────────────────────────────────────────────────────────────────
// Settings Page
// ─────────────────────────────────────────────────────────────────────────────

const Settings = () => {
  const user            = useHealthStore((state) => state.user);
  const dailyGoals      = useHealthStore((state) => state.dailyGoals);
  const theme           = useHealthStore((state) => state.theme);
  const toggleTheme     = useHealthStore((state) => state.toggleTheme);
  const updateDailyTargets = useHealthStore((state) => state.updateDailyTargets);
  const logout          = useHealthStore((state) => state.logout);

  // Local draft state — avoids spamming the store on every keystroke.
  // Commits on Save button click.
  const [waterTarget,   setWaterTarget]   = useState(dailyGoals.waterTarget);
  const [calorieTarget, setCalorieTarget] = useState(dailyGoals.calorieTarget);
  const [focusTarget,   setFocusTarget]   = useState(dailyGoals.focusTarget);
  const [showToast,     setShowToast]     = useState(false);

  // Keep draft in sync if the store changes externally (e.g., hydration)
  useEffect(() => {
    setWaterTarget(dailyGoals.waterTarget);
    setCalorieTarget(dailyGoals.calorieTarget);
    setFocusTarget(dailyGoals.focusTarget);
  }, [dailyGoals.waterTarget, dailyGoals.calorieTarget, dailyGoals.focusTarget]);

  const handleSave = () => {
    updateDailyTargets({
      waterTarget:   Number(waterTarget),
      calorieTarget: Number(calorieTarget),
      focusTarget:   Number(focusTarget),
    });

    // Show confirmation toast for 2.5 seconds
    setShowToast(true);
    const timer = setTimeout(() => setShowToast(false), 2500);
    return () => clearTimeout(timer);
  };

  const isDark = theme === 'dark';

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <div className="max-w-2xl mx-auto px-5 py-10 md:px-10 md:py-14 space-y-6">

        {/* ── Page Header ──────────────────────────────────────────────────── */}
        <motion.header
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
          className="mb-8 space-y-1"
        >
          <div className="flex items-center gap-3 text-[#4A6B5D] dark:text-[#6D8C7E] mb-3">
            <Settings2 className="w-5 h-5" />
            <span className="text-xs uppercase tracking-widest font-semibold">
              Account & Preferences
            </span>
          </div>
          <h1 className="text-3xl font-light text-text-primary tracking-tight">
            Settings
          </h1>
          <p className="text-text-secondary text-sm font-light">
            Personalise your daily targets and interface theme.
          </p>
        </motion.header>

        {/* ── Profile Card ─────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1], delay: 0.04 }}
          className="bg-surface rounded-[1.5rem] p-7 shadow-[0_10px_40px_-10px_rgba(42,42,42,0.04)] dark:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.25)] border border-border flex items-center gap-5"
        >
          <div className="w-14 h-14 rounded-full bg-[#DCE4E0] dark:bg-[#2E3A35] flex items-center justify-center shrink-0">
            <User className="w-7 h-7 text-[#4A6B5D] dark:text-[#6D8C7E]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-medium text-text-primary truncate">
              {user.name || 'Aura User'}
            </p>
            <p className="text-xs text-text-secondary font-light truncate mt-0.5">
              {user.email || '—'}
            </p>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-[10px] uppercase tracking-widest font-semibold text-[#4A6B5D] dark:text-[#6D8C7E]">
                Level {user.level || 1}
              </span>
              <span className="text-[#DCE4E0] dark:text-[#2E3A35]">·</span>
              <span className="text-[10px] text-text-secondary font-light">
                {user.currentStreak || 0} day streak
              </span>
              <span className="text-[#DCE4E0] dark:text-[#2E3A35]">·</span>
              <span className="text-[10px] text-text-secondary font-light">
                {user.xp || 0} XP total
              </span>
            </div>
          </div>
        </motion.div>

        {/* ── Appearance ───────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
          className="bg-surface rounded-[1.5rem] p-7 shadow-[0_10px_40px_-10px_rgba(42,42,42,0.04)] dark:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.25)] border border-border"
        >
          <div className="mb-5">
            <h2 className="text-base font-medium text-text-primary tracking-tight">
              Appearance
            </h2>
            <p className="text-xs text-text-secondary font-light mt-0.5">
              Switch between Light and Dark interface modes.
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#DCE4E0] dark:bg-[#2E3A35] flex items-center justify-center">
                {isDark
                  ? <Moon className="w-4 h-4 text-[#6D8C7E]" />
                  : <Sun className="w-4 h-4 text-[#4A6B5D]" />
                }
              </div>
              <div>
                <p className="text-sm font-medium text-text-primary">
                  {isDark ? 'Dark Mode' : 'Light Mode'}
                </p>
                <p className="text-xs text-text-secondary font-light">
                  {isDark
                    ? 'Deep charcoal aesthetic is active.'
                    : 'Scandi warm cream aesthetic is active.'
                  }
                </p>
              </div>
            </div>

            <ToggleSwitch
              id="theme-toggle"
              checked={isDark}
              onChange={toggleTheme}
            />
          </div>
        </motion.div>

        {/* ── Daily Targets ─────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1], delay: 0.12 }}
          className="bg-surface rounded-[1.5rem] p-7 shadow-[0_10px_40px_-10px_rgba(42,42,42,0.04)] dark:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.25)] border border-border"
        >
          <div className="mb-5">
            <h2 className="text-base font-medium text-text-primary tracking-tight">
              Daily Targets
            </h2>
            <p className="text-xs text-text-secondary font-light mt-0.5">
              Adjust your personal wellness baselines. Changes apply immediately on save.
            </p>
          </div>

          <div>
            <TargetInput
              icon={Droplets}
              label="Daily Water Target"
              unit="millilitres (ml)"
              value={waterTarget}
              onChange={setWaterTarget}
            />
            <TargetInput
              icon={Flame}
              label="Daily Calorie Target"
              unit="kilocalories (kcal)"
              value={calorieTarget}
              onChange={setCalorieTarget}
            />
            <TargetInput
              icon={Target}
              label="Daily Focus Target"
              unit="minutes (min)"
              value={focusTarget}
              onChange={setFocusTarget}
            />
          </div>

          <div className="mt-6 flex items-center justify-end">
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-2 bg-[#4A6B5D] dark:bg-[#6D8C7E] hover:bg-[#3d5a4d] dark:hover:bg-[#5c7a6c] text-white text-sm font-medium px-6 py-2.5 rounded-[0.875rem] transition-colors duration-200 shadow-[0_4px_16px_-4px_rgba(74,107,93,0.4)]"
            >
              <CheckCircle2 className="w-4 h-4" />
              Save Targets
            </button>
          </div>
        </motion.div>

        {/* ── Danger Zone: Log Out ──────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1], delay: 0.16 }}
          className="bg-surface rounded-[1.5rem] p-7 shadow-[0_10px_40px_-10px_rgba(42,42,42,0.04)] dark:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.25)] border border-border"
        >
          <div className="mb-5">
            <h2 className="text-base font-medium text-text-primary tracking-tight">
              Session
            </h2>
            <p className="text-xs text-text-secondary font-light mt-0.5">
              End your current authenticated workspace session.
            </p>
          </div>

          <button
            onClick={logout}
            className="inline-flex items-center gap-2 border border-red-400/40 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm font-medium px-5 py-2.5 rounded-[0.875rem] transition-colors duration-200"
          >
            <LogOut className="w-4 h-4" />
            Log Out
          </button>
        </motion.div>

      </div>

      {/* Save Confirmation Toast */}
      <SaveToast visible={showToast} />
    </div>
  );
};

export default Settings;
