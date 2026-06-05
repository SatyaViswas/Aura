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
  mentalLogged: false
};

const initialUserState = {
  uid: null,
  email: null,
  name: 'Guest',
  level: 1,
  xp: 0,
  currentStreak: 0,
  lastActiveDate: null,
  isAuthenticated: false
};

const syncToCloud = async (state) => {
  if (!isFirebaseConnected || !state.user || !state.user.uid) return;
  
  try {
    const userDocRef = doc(db, 'users', state.user.uid);
    // Non-blocking background sync mapped to the user directory
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

      // Real-Time Cloud Data Hydration & Synchronization Middleware
      hydrateUserFromCloud: async (uid) => {
        if (!isFirebaseConnected || !db) return;
        try {
          const userDocRef = doc(db, 'users', uid);
          const docSnap = await getDoc(userDocRef);
          
          if (docSnap.exists()) {
            const data = docSnap.data();
            set({
              user: { ...data.user, isAuthenticated: true }, // Ensure isAuthenticated stays true
              dailyGoals: data.dailyGoals || { ...initialDailyGoals },
              history: data.history || []
            });
          }
        } catch (error) {
          console.warn("Failed to hydrate from cloud. Using baseline or local data:", error);
        }
      },

      // Asynchronous Authentication Action Pipeline
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
          
          // Instantly initialize their standalone cloud user tracking folder
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
          
          // First set basic auth state
          set((state) => ({
            user: {
              ...state.user,
              uid,
              email,
              isAuthenticated: true
            }
          }));
          
          // Hydrate their unique data files
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
          // Completely clear the tracking variables, flush local states back to the baseline zero models
          set({
            user: { ...initialUserState },
            dailyGoals: { ...initialDailyGoals },
            history: []
          });
        }
      },

      setIsActiveSession: (isActive) => set({ isActiveSession: isActive }),

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
        history: state.history 
      }) 
    }
  )
);

export default useHealthStore;
