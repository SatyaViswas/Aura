import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { auth, db, isFirebaseConnected } from '../config/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';

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
  leveledUpToday: false,
  streakIncrementedToday: false
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
  highestDailyXp: 0
};

const calculateProgress = (goals) => {
  const getClamped = (logged, target) => {
    if (!target || target <= 0) return 0;
    return Math.min(Math.max((logged / target) * 100, 0), 100);
  };

  const water = getClamped(goals.waterLogged, goals.waterTarget);
  const diet = getClamped(goals.calorieLogged, goals.calorieTarget);
  const focus = getClamped(goals.focusLogged, goals.focusTarget);
  
  const completedCount = goals.completedExerciseIds?.length || 0;
  const workout = Math.min((completedCount / 4) * 100, 100);
  const mental = goals.mentalLogged ? 100 : 0;

  return (water + diet + focus + workout + mental) / 5;
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

  // 5. Instantly level up if progress reaches 100% and not already leveled up today
  const progress = calculateProgress(updatedGoals);
  if (progress >= 100 && !updatedGoals.leveledUpToday) {
    updatedGoals.leveledUpToday = true;
    updatedUser.level = (updatedUser.level || 1) + 1;
  }

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
        set((state) => applyActivity(state, { waterLogged: state.dailyGoals.waterLogged + ml }));
        syncToCloud(get());
      },

      logCalories: (cals, p, c, f) => {
        set((state) => applyActivity(state, {
            calorieLogged: state.dailyGoals.calorieLogged + cals,
            macroProtein: state.dailyGoals.macroProtein + p,
            macroCarbs: state.dailyGoals.macroCarbs + c,
            macroFat: state.dailyGoals.macroFat + f
        }));
        syncToCloud(get());
      },

      addFocusTime: (mins) => {
        set((state) => applyActivity(state, { focusLogged: state.dailyGoals.focusLogged + mins }));
        syncToCloud(get());
      },

      setMentalComplete: (bool) => {
        set((state) => applyActivity(state, { mentalLogged: bool }));
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

        const oldXp = Number(user.xp) || 0;
        const newXp = oldXp + xpAmount;
        const oldXpLevel = Math.floor(oldXp / 1000);
        const newXpLevel = Math.floor(newXp / 1000);
        const xpLevelsGained = newXpLevel - oldXpLevel;

        const goalUpdates = {
          completedExerciseIds: updated,
          workoutsCompleted: meetsGoal ? true : dailyGoals.workoutsCompleted,
          dailyXpEarned: newDailyXp
        };

        const userUpdates = {
          xp: newXp,
          highestDailyXp: newHighestDailyXp,
          level: (Number(user.level) || 1) + xpLevelsGained
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

        const goalUpdates = {
          completedExerciseIds: updated,
          workoutsCompleted: stillMeetsGoal,
          dailyXpEarned: Math.max(0, currentDailyXp - xpAmount)
        };

        const userUpdates = {
          xp: Math.max(0, (Number(user.xp) || 0) - xpAmount)
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
