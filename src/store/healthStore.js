/**
 * @file healthStore.js
 * @description Production-grade global state store for Aura built with Zustand.
 * Handles user authentication pipelines, real-time Cloud Firestore synchronization,
 * defensive localStorage hydration merges, and real-time XP high-score calculations.
 */

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
  // Persistent array of completed exercise ID strings.
  completedExerciseIds: [],
  // Running tally of XP earned across all exercise completions for the current day.
  dailyXpEarned: 0
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
  // Absolute personal-best watermark: the highest dailyXpEarned value ever recorded.
  highestDailyXp: 0
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
      // 'light' | 'dark' — controls the `dark` class on <html> via ThemeProvider
      theme: 'light',

      // Real-Time Cloud Data Hydration & Synchronization Middleware
      hydrateUserFromCloud: async (uid) => {
        if (!isFirebaseConnected || !db) return;
        try {
          const userDocRef = doc(db, 'users', uid);
          const docSnap = await getDoc(userDocRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            const today = new Date().toISOString().split('T')[0];

            // Defensive spreading forces fallback attributes to merge correctly
            const cloudUser = { ...initialUserState, ...data.user };
            const cloudGoals = { ...initialDailyGoals, ...data.dailyGoals };
            const cloudHistory = data.history || [];

            // ── Scenario A: It is a New Day ───────────────────────────────────────
            if (cloudUser.lastActiveDate !== today) {
              let streakKept = false;

              if (cloudUser.lastActiveDate !== null) {
                const waterMet = cloudGoals.waterLogged >= cloudGoals.waterTarget;
                const caloriesMet = cloudGoals.calorieLogged >= cloudGoals.calorieTarget;
                const focusMet = cloudGoals.focusLogged >= cloudGoals.focusTarget;
                const workoutMet = cloudGoals.workoutsCompleted === true;
                const mentalMet = cloudGoals.mentalLogged === true;

                if (waterMet && caloriesMet && focusMet && workoutMet && mentalMet) {
                  streakKept = true;
                }
              }

              const updatedHistory = [
                ...cloudHistory,
                {
                  date: cloudUser.lastActiveDate,
                  goals: cloudGoals,
                  streakKept
                }
              ];

              const resolvedUser = {
                ...cloudUser,
                isAuthenticated: true,
                currentStreak: streakKept ? (cloudUser.currentStreak || 0) + 1 : 0,
                lastActiveDate: today
              };

              const resolvedGoals = { ...initialDailyGoals };

              set({
                user: resolvedUser,
                dailyGoals: resolvedGoals,
                history: updatedHistory
              });

              syncToCloud(get());

              // ── Scenario B: Same Day Session Resume ───────────────────────────────
            } else {
              set({
                user: { ...cloudUser, isAuthenticated: true },
                dailyGoals: { ...cloudGoals },
                history: cloudHistory
              });
            }
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
              isAuthenticated: true
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

      /**
       * toggleTheme
       * Flips the theme between 'light' and 'dark'.  The ThemeProvider in
       * App.jsx watches this value and applies / removes the `dark` class on
       * <html> so all Tailwind dark: variants activate instantly.
       */
      toggleTheme: () => {
        set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' }));
      },

      /**
       * updateDailyTargets(newTargets)
       * Merges a partial object of target overrides into `dailyGoals`.
       * Only accepts the three editable target keys to prevent accidental
       * pollution of logged progress values.
       *
       * @param {{ waterTarget?: number, calorieTarget?: number, focusTarget?: number }} newTargets
       */
      updateDailyTargets: (newTargets) => {
        const allowed = ['waterTarget', 'calorieTarget', 'focusTarget'];
        const safeTargets = Object.fromEntries(
          Object.entries(newTargets)
            .filter(([key]) => allowed.includes(key))
            .map(([key, val]) => [key, Math.max(0, Number(val) || 0)])
        );
        set((state) => ({
          dailyGoals: { ...state.dailyGoals, ...safeTargets }
        }));
        syncToCloud(get());
      },

      addWater: (ml) => {
        set((state) => ({
          dailyGoals: { ...state.dailyGoals, waterLogged: state.dailyGoals.waterLogged + ml }
        }));
        syncToCloud(get());
      },

      logCalories: (cals, p, c, f) => {
        set((state) => ({
          dailyGoals: {
            ...state.dailyGoals,
            calorieLogged: state.dailyGoals.calorieLogged + cals,
            macroProtein: state.dailyGoals.macroProtein + p,
            macroCarbs: state.dailyGoals.macroCarbs + c,
            macroFat: state.dailyGoals.macroFat + f
          }
        }));
        syncToCloud(get());
      },

      addFocusTime: (mins) => {
        set((state) => ({
          dailyGoals: { ...state.dailyGoals, focusLogged: state.dailyGoals.focusLogged + mins }
        }));
        syncToCloud(get());
      },

      setMentalComplete: (bool) => {
        set((state) => ({
          dailyGoals: { ...state.dailyGoals, mentalLogged: bool }
        }));
        syncToCloud(get());
      },

      completeWorkout: () => {
        set((state) => ({
          dailyGoals: { ...state.dailyGoals, workoutsCompleted: true }
        }));
        syncToCloud(get());
      },

      /**
       * logExerciseCompletion
       * Synchronous Transaction Architecture: Combines values on a single execution
       * thread to eliminate asynchronous UI updates or lag spikes.
       */
      logExerciseCompletion: (exerciseId, xpAmount = 0) => {
        const { dailyGoals, user, history } = get();
        const existing = dailyGoals.completedExerciseIds || [];

        if (existing.includes(exerciseId)) return;

        const updated = [...existing, exerciseId];
        const meetsGoal = updated.length >= 4;

        // Force baseline numerical defaults to guarantee safe operations
        const currentDailyXp = Number(dailyGoals.dailyXpEarned) || 0;
        const currentHighestXp = Number(user.highestDailyXp) || 0;

        const newDailyXp = currentDailyXp + xpAmount;
        const newHighestDailyXp = newDailyXp > currentHighestXp ? newDailyXp : currentHighestXp;

        const updatedGoals = {
          ...dailyGoals,
          completedExerciseIds: updated,
          workoutsCompleted: meetsGoal ? true : dailyGoals.workoutsCompleted,
          dailyXpEarned: newDailyXp
        };

        const updatedUser = {
          ...user,
          xp: (Number(user.xp) || 0) + xpAmount,
          highestDailyXp: newHighestDailyXp
        };

        // Mutate local store state synchronously
        set({
          dailyGoals: updatedGoals,
          user: updatedUser
        });

        // Pipe directly to Firestore to prevent background race conditions
        if (isFirebaseConnected && user?.uid) {
          const userDocRef = doc(db, 'users', user.uid);
          setDoc(userDocRef, {
            user: updatedUser,
            dailyGoals: updatedGoals,
            history
          }, { merge: true }).catch(err => console.warn("Firestore sync deferred:", err));
        }
      },

      /**
       * resetExerciseCompletion
       * Rolls back individual exercise achievements synchronously, adjusting
       * running daily totals while leaving the absolute highestDailyXp watermark intact.
       */
      resetExerciseCompletion: (exerciseId, xpAmount = 0) => {
        const { dailyGoals, user, history } = get();
        const existing = dailyGoals.completedExerciseIds || [];

        const updated = existing.filter((id) => id !== exerciseId);
        const stillMeetsGoal = updated.length >= 4;

        const currentDailyXp = Number(dailyGoals.dailyXpEarned) || 0;
        const currentHighestXp = Number(user.highestDailyXp) || 0;

        const updatedGoals = {
          ...dailyGoals,
          completedExerciseIds: updated,
          workoutsCompleted: stillMeetsGoal,
          dailyXpEarned: Math.max(0, currentDailyXp - xpAmount)
        };

        const updatedUser = {
          ...user,
          xp: Math.max(0, (Number(user.xp) || 0) - xpAmount)
          // highestDailyXp is omitted here to preserve historical records
        };

        set({
          dailyGoals: updatedGoals,
          user: updatedUser
        });

        if (isFirebaseConnected && user?.uid) {
          const userDocRef = doc(db, 'users', user.uid);
          setDoc(userDocRef, {
            user: updatedUser,
            dailyGoals: updatedGoals,
            history
          }, { merge: true }).catch(err => console.warn("Firestore sync deferred:", err));
        }
      },

      checkDailyReset: () => {
        const state = get();
        const today = new Date().toISOString().split('T')[0];

        if (state.user.lastActiveDate !== today) {
          let streakKept = false;

          if (state.user.lastActiveDate !== null) {
            const waterMet = state.dailyGoals.waterLogged >= state.dailyGoals.waterTarget;
            const caloriesMet = state.dailyGoals.calorieLogged >= state.dailyGoals.calorieTarget;
            const focusMet = state.dailyGoals.focusLogged >= state.dailyGoals.focusTarget;
            const workoutMet = state.dailyGoals.workoutsCompleted;
            const mentalMet = state.dailyGoals.mentalLogged;

            if (waterMet && caloriesMet && focusMet && workoutMet && mentalMet) {
              streakKept = true;
            }
          }

          set((state) => ({
            history: [
              ...state.history,
              {
                date: state.user.lastActiveDate,
                goals: state.dailyGoals,
                streakKept
              }
            ],
            user: {
              ...state.user,
              currentStreak: streakKept ? state.user.currentStreak + 1 : 0,
              lastActiveDate: today
            },
            dailyGoals: { ...initialDailyGoals }
          }));
          syncToCloud(get());
        }
      }
    }),
    {
      name: 'scandi_wellness_cache',
      partialize: (state) => ({
        user: state.user,
        dailyGoals: state.dailyGoals,
        history: state.history,
        // Persist theme preference so the user's dark/light choice survives
        // page reloads without flashing the wrong mode on mount.
        theme: state.theme
      }),
      // FIX: Custom merge rehydrator securely updates old localStorage files on boot
      merge: (persistedState, currentState) => {
        if (!persistedState) return currentState;
        return {
          ...currentState,
          ...persistedState,
          // Preserve theme, defaulting to 'light' for first-time users
          theme: persistedState.theme || 'light',
          user: {
            ...initialUserState,
            ...persistedState.user
          },
          dailyGoals: {
            ...initialDailyGoals,
            ...persistedState.dailyGoals
          }
        };
      }
    }
  )
);

export default useHealthStore;