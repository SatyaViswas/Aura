import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { auth, db, isFirebaseConnected } from '../config/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { workoutData } from '../config/workoutData';

const exerciseXpMap = {};
if (workoutData) {
  Object.values(workoutData).forEach(modality => {
    if (modality && modality.tracks) {
      modality.tracks.forEach(track => {
        if (track && track.subSections) {
          track.subSections.forEach(sub => {
            if (sub && sub.exercises) {
              sub.exercises.forEach(ex => {
                exerciseXpMap[ex.id] = ex.estimated_xp || 0;
              });
            }
          });
        }
      });
    }
  });
}

const initialDailyGoals = {
  waterTarget: 3000,
  waterLogged: 0,
  calorieTarget: 2200,
  calorieLogged: 0,
  macroProtein: 0,
  macroCarbs: 0,
  macroFat: 0,
  focusTarget: 60,
  focusLogged: 0,
  workoutsCompleted: false,
  mentalLogged: false,
  completedExerciseIds: [],
  dailyXpEarned: 0,
  trainingXpEarned: 0,
  leveledUpToday: false,
  streakIncrementedToday: false,
  // XP milestone trackers — reset each day
  waterHalfXpAwarded: false,   // 10 XP for reaching 50% water target
  waterFullXpAwarded: false,   // 15 XP for reaching 100% water target
  mealLogCount: 0,             // Meals logged today (XP capped at 3 logs)
  dietFullXpAwarded: false,    // 20 XP for hitting calorie target
  focusSessionsXpCount: 0,     // Pomodoros rewarded today (cap 3)
  mentalXpAwarded: false       // 20 XP for completing mental health once/day
};

const initialUserState = {
  uid: null,
  email: null,
  name: 'Guest',
  level: 1,
  xp: 0,
  currentStreak: 0,
  lastActiveDate: null,
  isAuthenticated: false,
  highestDailyXp: 0,
  highestTrainingXp: 0
};

// ─── Progressive XP Threshold ───────────────────────────────────────────────
// Each level requires more XP than the last.
// Level 1→2: 1000 XP, Level 2→3: 1200 XP, Level 3→4: 1400 XP, etc.
const xpForNextLevel = (level) => 1000 + (Math.max(1, level) - 1) * 200;

// ─── Central XP + Level-Up Award ─────────────────────────────────────────────
// Adds xpAmount to user.xp and handles level-up(s) using progressive thresholds.
// Returns updated { xp, level } fields to spread into userUpdates.
const awardXp = (currentXp, currentLevel, xpAmount) => {
  let xp = Number(currentXp) || 0;
  let level = Number(currentLevel) || 1;
  xp += xpAmount;

  // Keep levelling up as long as accumulated XP in this level exceeds the threshold
  let threshold = xpForNextLevel(level);
  while (xp >= threshold) {
    xp -= threshold;
    level += 1;
    threshold = xpForNextLevel(level);
  }

  return { xp, level };
};

const applyActivity = (state, goalUpdates = {}, userUpdates = {}) => {
  const today = new Date().toISOString().split('T')[0];
  let updatedUser = { ...state.user, ...userUpdates };
  let updatedGoals = { ...state.dailyGoals };
  let updatedHistory = [...(state.history || [])];

  // 1. Check if it is a new day before merging new goals
  if (updatedUser.lastActiveDate && updatedUser.lastActiveDate !== today) {
    const lastDate = updatedUser.lastActiveDate;
    const d1 = new Date(lastDate);
    const d2 = new Date(today);
    d1.setHours(0,0,0,0);
    d2.setHours(0,0,0,0);
    const diffDays = Math.round(Math.abs(d2 - d1) / (1000 * 60 * 60 * 24));

    const activityDone =
      (updatedGoals.waterLogged || 0) > 0 ||
      (updatedGoals.calorieLogged || 0) > 0 ||
      (updatedGoals.focusLogged || 0) > 0 ||
      (updatedGoals.completedExerciseIds || []).length > 0 ||
      updatedGoals.workoutsCompleted === true ||
      updatedGoals.mentalLogged === true;

    const streakKept = diffDays === 1 && activityDone;

    updatedHistory.push({
      date: lastDate,
      goals: { ...updatedGoals },
      streakKept
    });

    // Reset daily goals but retain targets
    updatedGoals = { 
        ...initialDailyGoals, 
        waterTarget: updatedGoals.waterTarget,
        calorieTarget: updatedGoals.calorieTarget,
        focusTarget: updatedGoals.focusTarget
    };

    updatedUser.currentStreak = streakKept ? updatedUser.currentStreak : 0;
    updatedUser.lastActiveDate = today;
  }

  // 2. Set lastActiveDate to today if null
  if (!updatedUser.lastActiveDate) {
    updatedUser.lastActiveDate = today;
  }

  // 3. Merge new goal updates safely (these apply to the CURRENT day now)
  updatedGoals = { ...updatedGoals, ...goalUpdates };

  // 4. Instantly increment streak if doing any activity and not already incremented today
  const hasActivityToday =
    (updatedGoals.waterLogged || 0) > 0 ||
    (updatedGoals.calorieLogged || 0) > 0 ||
    (updatedGoals.focusLogged || 0) > 0 ||
    (updatedGoals.completedExerciseIds || []).length > 0 ||
    updatedGoals.workoutsCompleted === true ||
    updatedGoals.mentalLogged === true;

  if (hasActivityToday && !updatedGoals.streakIncrementedToday) {
    updatedGoals.streakIncrementedToday = true;
    updatedUser.currentStreak = (updatedUser.currentStreak || 0) + 1;
  }

  // Note: Level-up is driven purely by XP (every 1000 XP) in logExerciseCompletion.
  // Daily-goal completion does NOT grant a level-up; the two systems are independent.

  return {
    user: updatedUser,
    dailyGoals: updatedGoals,
    history: updatedHistory
  };
};

const syncToCloud = async (state) => {
  if (!isFirebaseConnected || !state.user || !state.user.uid) return;

  try {
    const userDocRef = doc(db, 'users', state.user.uid);
    await setDoc(userDocRef, {
      user: state.user,
      dailyGoals: state.dailyGoals,
      history: state.history
    }, { merge: true });
  } catch (error) {
    console.warn("Cloud sync failed. Relying strictly on local cache:", error);
  }
};

const useHealthStore = create(
  persist(
    (set, get) => ({
      user: { ...initialUserState },
      dailyGoals: { ...initialDailyGoals },
      history: [],
      isActiveSession: false,
      cloudSyncStatus: isFirebaseConnected ? 'Cloud Sync Active' : 'Offline Local Storage Active',
      theme: 'light',

      hydrateUserFromCloud: async (uid) => {
        if (!isFirebaseConnected || !db) return;
        try {
          const userDocRef = doc(db, 'users', uid);
          const docSnap = await getDoc(userDocRef);

          if (docSnap.exists()) {
            const data = docSnap.data();

            const cloudUser = { ...initialUserState, ...data.user, isAuthenticated: true };
            const cloudGoals = { ...initialDailyGoals, ...data.dailyGoals };
            const cloudHistory = data.history || [];

            // Temporarily construct a state with cloud data
            const cloudState = {
                user: cloudUser,
                dailyGoals: cloudGoals,
                history: cloudHistory
            };

            // Process it through applyActivity to handle any date changes
            const finalState = applyActivity(cloudState);
            
            set(finalState);
            syncToCloud(get());
          }
        } catch (error) {
          console.warn("Failed to hydrate from cloud. Using baseline or local data:", error);
        }
      },

      signUpWithEmail: async (email, password, displayName) => {
        if (!isFirebaseConnected || !auth) {
          throw new Error("Authentication is currently unavailable. Running in offline mode.");
        }
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          const uid = userCredential.user.uid;

          set((state) => ({
            user: {
              ...initialUserState,
              uid,
              email,
              name: displayName,
              isAuthenticated: true,
              lastActiveDate: new Date().toISOString().split('T')[0]
            },
            dailyGoals: { ...initialDailyGoals },
            history: []
          }));

          const userDocRef = doc(db, 'users', uid);
          await setDoc(userDocRef, {
            user: get().user,
            dailyGoals: get().dailyGoals,
            history: get().history
          });
        } catch (error) {
          console.error("Sign up failed:", error);
          throw error;
        }
      },

      loginWithEmail: async (email, password) => {
        if (!isFirebaseConnected || !auth) {
          throw new Error("Authentication is currently unavailable. Running in offline mode.");
        }
        try {
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          const uid = userCredential.user.uid;

          set((state) => ({
            user: {
              ...state.user,
              uid,
              email,
              isAuthenticated: true
            }
          }));

          await get().hydrateUserFromCloud(uid);
        } catch (error) {
          console.error("Login failed:", error);
          throw error;
        }
      },

      logout: async () => {
        try {
          if (isFirebaseConnected && auth) {
            await signOut(auth);
          }
        } catch (error) {
          console.error("Sign out encountered an error:", error);
        } finally {
          set({
            user: { ...initialUserState },
            dailyGoals: { ...initialDailyGoals },
            history: []
          });
        }
      },

      setIsActiveSession: (isActive) => set({ isActiveSession: isActive }),

      toggleTheme: () => {
        set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' }));
      },

      updateDailyTargets: (newTargets) => {
        const allowed = ['waterTarget', 'calorieTarget', 'focusTarget'];
        const safeTargets = Object.fromEntries(
          Object.entries(newTargets)
            .filter(([key]) => allowed.includes(key))
            .map(([key, val]) => [key, Math.max(0, Number(val) || 0)])
        );
        set((state) => applyActivity(state, safeTargets));
        syncToCloud(get());
      },

      addWater: (ml) => {
        set((state) => {
          const goals = state.dailyGoals;
          const user = state.user;
          const newLogged = goals.waterLogged + ml;
          const target = goals.waterTarget || 3000;
          const ratio = newLogged / target;

          let xpToAward = 0;
          const goalUpdates = { waterLogged: newLogged };

          // 10 XP at 50% hydration (once/day)
          if (ratio >= 0.5 && !goals.waterHalfXpAwarded) {
            xpToAward += 10;
            goalUpdates.waterHalfXpAwarded = true;
          }
          // 15 XP bonus at 100% hydration (once/day)
          if (ratio >= 1 && !goals.waterFullXpAwarded) {
            xpToAward += 15;
            goalUpdates.waterFullXpAwarded = true;
          }

          const userUpdates = xpToAward > 0
            ? awardXp(user.xp, user.level, xpToAward)
            : {};

          if (xpToAward > 0) {
            goalUpdates.dailyXpEarned = (Number(goals.dailyXpEarned) || 0) + xpToAward;
          }

          return applyActivity(state, goalUpdates, userUpdates);
        });
        syncToCloud(get());
      },

      logCalories: (cals, p, c, f) => {
        set((state) => {
          const goals = state.dailyGoals;
          const user = state.user;
          const newLogged = goals.calorieLogged + cals;
          const target = goals.calorieTarget || 2200;
          const mealCount = (goals.mealLogCount || 0) + 1;

          let xpToAward = 0;
          const goalUpdates = {
            calorieLogged: newLogged,
            macroProtein: goals.macroProtein + p,
            macroCarbs: goals.macroCarbs + c,
            macroFat: goals.macroFat + f,
            mealLogCount: mealCount
          };

          // 5 XP per meal log, capped at 3 logs/day (max 15 XP)
          if (mealCount <= 3) {
            xpToAward += 5;
          }
          // 20 XP bonus for hitting calorie target (once/day)
          if (newLogged >= target && !goals.dietFullXpAwarded) {
            xpToAward += 20;
            goalUpdates.dietFullXpAwarded = true;
          }

          const userUpdates = xpToAward > 0
            ? awardXp(user.xp, user.level, xpToAward)
            : {};

          if (xpToAward > 0) {
            goalUpdates.dailyXpEarned = (Number(goals.dailyXpEarned) || 0) + xpToAward;
          }

          return applyActivity(state, goalUpdates, userUpdates);
        });
        syncToCloud(get());
      },

      addFocusTime: (mins) => {
        set((state) => {
          const goals = state.dailyGoals;
          const user = state.user;
          const newLogged = goals.focusLogged + mins;
          // Each addFocusTime call = 1 completed pomodoro (25 min session)
          const sessionsRewarded = (goals.focusSessionsXpCount || 0) + 1;

          let xpToAward = 0;
          const goalUpdates = {
            focusLogged: newLogged,
            focusSessionsXpCount: sessionsRewarded
          };

          // 15 XP per completed pomodoro, capped at 3 sessions/day (max 45 XP)
          if (sessionsRewarded <= 3) {
            xpToAward = 15;
          }

          const userUpdates = xpToAward > 0
            ? awardXp(user.xp, user.level, xpToAward)
            : {};

          if (xpToAward > 0) {
            goalUpdates.dailyXpEarned = (Number(goals.dailyXpEarned) || 0) + xpToAward;
          }

          return applyActivity(state, goalUpdates, userUpdates);
        });
        syncToCloud(get());
      },

      setMentalComplete: (bool) => {
        set((state) => {
          const goals = state.dailyGoals;
          const user = state.user;

          const goalUpdates = { mentalLogged: bool };
          let userUpdates = {};

          // 20 XP for completing mental health check-in once/day
          if (bool && !goals.mentalXpAwarded) {
            goalUpdates.mentalXpAwarded = true;
            goalUpdates.dailyXpEarned = (Number(goals.dailyXpEarned) || 0) + 20;
            userUpdates = awardXp(user.xp, user.level, 20);
          }

          return applyActivity(state, goalUpdates, userUpdates);
        });
        syncToCloud(get());
      },

      completeWorkout: () => {
        set((state) => applyActivity(state, { workoutsCompleted: true }));
        syncToCloud(get());
      },

      logExerciseCompletion: (exerciseId, xpAmount = 0) => {
        const { dailyGoals, user } = get();
        const existing = dailyGoals.completedExerciseIds || [];

        if (existing.includes(exerciseId)) return;

        const updated = [...existing, exerciseId];
        const meetsGoal = updated.length >= 4;

        const currentDailyXp = Number(dailyGoals.dailyXpEarned) || 0;
        const currentHighestXp = Number(user.highestDailyXp) || 0;

        const newDailyXp = currentDailyXp + xpAmount;
        const newHighestDailyXp = newDailyXp > currentHighestXp ? newDailyXp : currentHighestXp;

        const currentHighestTrainingXp = Number(user.highestTrainingXp) || 0;
        const newTrainingXp = updated.reduce((sum, id) => sum + (exerciseXpMap[id] || 0), 0);
        const newHighestTrainingXp = newTrainingXp > currentHighestTrainingXp ? newTrainingXp : currentHighestTrainingXp;

        // Use progressive level-up threshold via awardXp helper
        const { xp: newXp, level: newLevel } = awardXp(user.xp, user.level, xpAmount);

        const goalUpdates = {
          completedExerciseIds: updated,
          workoutsCompleted: meetsGoal ? true : dailyGoals.workoutsCompleted,
          dailyXpEarned: newDailyXp,
          trainingXpEarned: newTrainingXp
        };

        const userUpdates = {
          xp: newXp,
          highestDailyXp: newHighestDailyXp,
          highestTrainingXp: newHighestTrainingXp,
          level: newLevel
        };

        set((state) => applyActivity(state, goalUpdates, userUpdates));
        syncToCloud(get());
      },

      resetExerciseCompletion: (exerciseId, xpAmount = 0) => {
        const { dailyGoals, user } = get();
        const existing = dailyGoals.completedExerciseIds || [];

        const updated = existing.filter((id) => id !== exerciseId);
        const stillMeetsGoal = updated.length >= 4;

        const currentDailyXp = Number(dailyGoals.dailyXpEarned) || 0;

        // Subtract XP but don't go below 0, and recalculate level from scratch
        const rawXp = Math.max(0, (Number(user.xp) || 0) - xpAmount);
        // Recompute level from total XP using progressive thresholds
        let remainingXp = rawXp;
        let recalcLevel = 1;
        let thresh = xpForNextLevel(recalcLevel);
        while (remainingXp >= thresh) {
          remainingXp -= thresh;
          recalcLevel += 1;
          thresh = xpForNextLevel(recalcLevel);
        }

        const newTrainingXp = updated.reduce((sum, id) => sum + (exerciseXpMap[id] || 0), 0);

        const goalUpdates = {
          completedExerciseIds: updated,
          workoutsCompleted: stillMeetsGoal,
          dailyXpEarned: Math.max(0, currentDailyXp - xpAmount),
          trainingXpEarned: newTrainingXp
        };

        const userUpdates = {
          xp: rawXp,
          level: recalcLevel
        };

        set((state) => applyActivity(state, goalUpdates, userUpdates));
        syncToCloud(get());
      },

      checkDailyReset: () => {
        set((state) => applyActivity(state));
        syncToCloud(get());
      }
    }),
    {
      name: 'scandi_wellness_cache',
      partialize: (state) => ({
        user: state.user,
        dailyGoals: state.dailyGoals,
        history: state.history,
        theme: state.theme
      }),
      merge: (persistedState, currentState) => {
        if (!persistedState) return currentState;
        return {
          ...currentState,
          ...persistedState,
          theme: persistedState.theme || 'light',
          user: { ...initialUserState, ...persistedState.user },
          dailyGoals: { ...initialDailyGoals, ...persistedState.dailyGoals }
        };
      }
    }
  )
);

export default useHealthStore;
