import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { auth, db, isFirebaseConnected } from '../config/firebase';
import { doc, getDoc, setDoc, collection, query, where, onSnapshot } from 'firebase/firestore';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { workoutData } from '../config/workoutData';

let cloudSnapshotUnsubscribe = null;

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
  waterHalfXpAwarded: false,
  waterFullXpAwarded: false,
  mealLogCount: 0,
  dietFullXpAwarded: false,
  focusSessionsXpCount: 0,
  mentalXpAwarded: false,
  meals: [],
  mentalChat: []
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

const xpForNextLevel = (level) => 1000 + (Math.max(1, level) - 1) * 200;

const awardXp = (currentXp, currentLevel, xpAmount) => {
  let xp = Number(currentXp) || 0;
  let level = Number(currentLevel) || 1;
  xp += xpAmount;

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

  if (updatedUser.lastActiveDate && updatedUser.lastActiveDate !== today) {
    const lastDate = updatedUser.lastActiveDate;
    const d1 = new Date(lastDate);
    const d2 = new Date(today);
    d1.setHours(0, 0, 0, 0);
    d2.setHours(0, 0, 0, 0);
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

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const cutoffDate = thirtyDaysAgo.toISOString().split('T')[0];
    updatedHistory = updatedHistory.filter(entry => entry.date >= cutoffDate);

    updatedGoals = {
      ...initialDailyGoals,
      waterTarget: updatedGoals.waterTarget,
      calorieTarget: updatedGoals.calorieTarget,
      focusTarget: updatedGoals.focusTarget
    };

    updatedUser.currentStreak = streakKept ? updatedUser.currentStreak : 0;
    updatedUser.lastActiveDate = today;
  }

  if (!updatedUser.lastActiveDate) {
    updatedUser.lastActiveDate = today;
  }

  updatedGoals = { ...updatedGoals, ...goalUpdates };

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

  return {
    user: updatedUser,
    dailyGoals: updatedGoals,
    history: updatedHistory
  };
};

const syncToCloud = async (state) => {
  // SHIELD: Prevent writes if the app is still fetching initial data
  if (state.isDownloadingData) {
    console.log("Saving blocked: Still loading initial data from Firebase.");
    return;
  }

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
      // GATEKEEPER FLAG: Locks down the app on boot
      isDownloadingData: true,
      user: { ...initialUserState },
      dailyGoals: { ...initialDailyGoals },
      history: [],
      isActiveSession: false,
      cloudSyncStatus: isFirebaseConnected ? 'Cloud Sync Active' : 'Offline Local Storage Active',
      theme: 'light',

      hydrateUserFromCloud: async (uid) => {
        if (!isFirebaseConnected || !db) return;
        try {
          if (cloudSnapshotUnsubscribe) {
            cloudSnapshotUnsubscribe();
            cloudSnapshotUnsubscribe = null;
          }

          set((state) => ({
            user: { ...initialUserState, uid, email: state.user.email, name: state.user.name, isAuthenticated: true },
            dailyGoals: { ...initialDailyGoals },
            history: []
          }));

          const q = query(collection(db, 'users'), where('user.uid', '==', uid));

          cloudSnapshotUnsubscribe = onSnapshot(q, (querySnapshot) => {
            if (!querySnapshot.empty) {
              const docSnap = querySnapshot.docs[0];
              const data = docSnap.data();

              if (data.user?.uid !== uid) {
                alert("Error: User document context mismatch. Anonymous or incorrect mapping detected.");
                get().logout();
                return;
              }

              const cloudUser = { ...initialUserState, ...data.user, isAuthenticated: true };
              const cloudGoals = { ...initialDailyGoals, ...data.dailyGoals };
              const cloudHistory = data.history || [];

              const cloudState = {
                user: cloudUser,
                dailyGoals: cloudGoals,
                history: cloudHistory
              };

              const finalState = applyActivity(cloudState);
              const needsSync = finalState.user.lastActiveDate !== cloudState.user.lastActiveDate;

              // RELEASE THE GATE: Data is fully merged
              set({ ...finalState, isDownloadingData: false });

              if (needsSync) {
                syncToCloud(get());
              }
            } else {
              alert("Error: Real-time sync failed. No valid user profile found for this UID.");
              get().logout();
              set({ isDownloadingData: false });
            }
          }, (error) => {
            console.error("Real-time listener failed:", error);
            set({ isDownloadingData: false });
          });

        } catch (error) {
          console.warn("Failed to initialize cloud real-time listener:", error);
          set({ isDownloadingData: false });
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
            isDownloadingData: false, // New account, safe to unlock
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
            isDownloadingData: true, // Lock immediately upon login until hydrate triggers
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
          if (cloudSnapshotUnsubscribe) {
            cloudSnapshotUnsubscribe();
            cloudSnapshotUnsubscribe = null;
          }
          if (isFirebaseConnected && auth) {
            await signOut(auth);
          }
        } catch (error) {
          console.error("Sign out encountered an error:", error);
        } finally {
          set({
            isDownloadingData: true,
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
        if (get().isDownloadingData) return;
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
        if (get().isDownloadingData) return;
        set((state) => {
          const goals = state.dailyGoals;
          const user = state.user;
          const newLogged = goals.waterLogged + ml;
          const target = goals.waterTarget || 3000;
          const ratio = newLogged / target;

          let xpToAward = 0;
          const goalUpdates = { waterLogged: newLogged };

          if (ratio >= 0.5 && !goals.waterHalfXpAwarded) {
            xpToAward += 10;
            goalUpdates.waterHalfXpAwarded = true;
          }
          if (ratio >= 1 && !goals.waterFullXpAwarded) {
            xpToAward += 15;
            goalUpdates.waterFullXpAwarded = true;
          }

          const userUpdates = xpToAward > 0 ? awardXp(user.xp, user.level, xpToAward) : {};

          if (xpToAward > 0) {
            goalUpdates.dailyXpEarned = (Number(goals.dailyXpEarned) || 0) + xpToAward;
          }

          return applyActivity(state, goalUpdates, userUpdates);
        });
        syncToCloud(get());
      },

      logCalories: (cals, p, c, f, mealName = '', mealType = '') => {
        if (get().isDownloadingData) return;
        set((state) => {
          const goals = state.dailyGoals;
          const user = state.user;
          const newLogged = goals.calorieLogged + cals;
          const target = goals.calorieTarget || 2200;
          const mealCount = (goals.mealLogCount || 0) + 1;

          const newMeal = { id: Date.now(), name: mealName, type: mealType, cals, p, c, f };
          const updatedMeals = [...(goals.meals || []), newMeal];

          let xpToAward = 0;
          const goalUpdates = {
            calorieLogged: newLogged,
            macroProtein: goals.macroProtein + p,
            macroCarbs: goals.macroCarbs + c,
            macroFat: goals.macroFat + f,
            mealLogCount: mealCount,
            meals: updatedMeals
          };

          if (mealCount <= 3) {
            xpToAward += 5;
          }
          if (newLogged >= target && !goals.dietFullXpAwarded) {
            xpToAward += 20;
            goalUpdates.dietFullXpAwarded = true;
          }

          const userUpdates = xpToAward > 0 ? awardXp(user.xp, user.level, xpToAward) : {};

          if (xpToAward > 0) {
            goalUpdates.dailyXpEarned = (Number(goals.dailyXpEarned) || 0) + xpToAward;
          }

          return applyActivity(state, goalUpdates, userUpdates);
        });
        syncToCloud(get());
      },

      addFocusTime: (mins) => {
        if (get().isDownloadingData) return;
        set((state) => {
          const goals = state.dailyGoals;
          const user = state.user;
          const newLogged = goals.focusLogged + mins;
          const sessionsRewarded = (goals.focusSessionsXpCount || 0) + 1;

          let xpToAward = 0;
          const goalUpdates = {
            focusLogged: newLogged,
            focusSessionsXpCount: sessionsRewarded
          };

          if (sessionsRewarded <= 3) {
            xpToAward = 15;
          }

          const userUpdates = xpToAward > 0 ? awardXp(user.xp, user.level, xpToAward) : {};

          if (xpToAward > 0) {
            goalUpdates.dailyXpEarned = (Number(goals.dailyXpEarned) || 0) + xpToAward;
          }

          return applyActivity(state, goalUpdates, userUpdates);
        });
        syncToCloud(get());
      },

      setMentalComplete: (bool) => {
        if (get().isDownloadingData) return;
        set((state) => {
          const goals = state.dailyGoals;
          const user = state.user;

          const goalUpdates = { mentalLogged: bool };
          let userUpdates = {};

          if (bool && !goals.mentalXpAwarded) {
            goalUpdates.mentalXpAwarded = true;
            goalUpdates.dailyXpEarned = (Number(goals.dailyXpEarned) || 0) + 20;
            userUpdates = awardXp(user.xp, user.level, 20);
          }

          return applyActivity(state, goalUpdates, userUpdates);
        });
        syncToCloud(get());
      },

      saveMentalChat: (chatLog) => {
        if (get().isDownloadingData) return;
        set((state) => applyActivity(state, { mentalChat: chatLog }));
        syncToCloud(get());
      },

      completeWorkout: () => {
        if (get().isDownloadingData) return;
        const { dailyGoals, user } = get();
        const currentHighestTrainingXp = Number(user.highestTrainingXp) || 0;
        const currentTrainingXp = Number(dailyGoals.trainingXpEarned) || 0;
        const newHighestTrainingXp = currentTrainingXp > currentHighestTrainingXp ? currentTrainingXp : currentHighestTrainingXp;

        const userUpdates = {
          highestTrainingXp: newHighestTrainingXp
        };

        set((state) => applyActivity(state, { workoutsCompleted: true }, userUpdates));
        syncToCloud(get());
      },

      logExerciseCompletion: (exerciseId, xpAmount = 0) => {
        if (get().isDownloadingData) return;
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
        if (get().isDownloadingData) return;
        const { dailyGoals, user } = get();
        const existing = dailyGoals.completedExerciseIds || [];

        const updated = existing.filter((id) => id !== exerciseId);
        const stillMeetsGoal = updated.length >= 4;

        const currentDailyXp = Number(dailyGoals.dailyXpEarned) || 0;

        const rawXp = Math.max(0, (Number(user.xp) || 0) - xpAmount);
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
        if (get().isDownloadingData) return;
        set((state) => applyActivity(state));
        syncToCloud(get());
      }
    }),
    {
      name: 'scandi_wellness_cache',
      partialize: (state) => ({
        // Ensure the gatekeeper flag is NOT persisted, so it always defaults to true on reload
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