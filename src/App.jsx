import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './config/firebase';
import useHealthStore from './store/healthStore';

// View Components
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Water from './pages/Water';
import Diet from './pages/Diet';
import Focus from './pages/Focus';
import Workout from './pages/Workout';
import MentalHealth from './pages/MentalHealth';
import History from './pages/History';
import Settings from './pages/Settings';

// Layout Components
import Navigation from './components/Navigation';

// ─────────────────────────────────────────────────────────────────────────────
// ThemeProvider
//
// Watches the `theme` value in the Zustand store and synchronises it with the
// <html> element's class list.  When `theme === 'dark'` the `dark` class is
// present, enabling all Tailwind `dark:` variant rules across every component.
// This runs outside the router so it always has effect, even on public routes.
// ─────────────────────────────────────────────────────────────────────────────
const ThemeProvider = ({ children }) => {
  const theme = useHealthStore((state) => state.theme);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  return <>{children}</>;
};

// Immersive Navigation Visibility Controller
const shouldHideNavigation = (pathname, isActiveSession) => {
  if (isActiveSession) return true;
  const publicRoutes = ['/', '/login', '/signup'];
  if (publicRoutes.includes(pathname)) return true;
  return false;
};

// Protected Routing Configuration Wrapper
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useHealthStore((state) => state.user.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Core Application Wrapper
const AppContent = () => {
  const location = useLocation();
  const [isInitializing, setIsInitializing] = useState(true);

  const hydrateUserFromCloud = useHealthStore((state) => state.hydrateUserFromCloud);
  const logout = useHealthStore((state) => state.logout);
  const checkDailyReset = useHealthStore((state) => state.checkDailyReset);
  const isActiveSession = useHealthStore((state) => state.isActiveSession);
  const theme = useHealthStore((state) => state.theme);

  // Hook up periodic daily reset checks (runs on load, and check every 1 minute)
  useEffect(() => {
    checkDailyReset();
    const interval = setInterval(() => {
      checkDailyReset();
    }, 60000);
    return () => clearInterval(interval);
  }, [checkDailyReset]);

  // Real-Time Firebase Auth Session Listener
  useEffect(() => {
    if (!auth) {
      setIsInitializing(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        useHealthStore.setState((state) => ({
          user: {
            ...state.user,
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            isAuthenticated: true
          }
        }));

        await hydrateUserFromCloud(firebaseUser.uid);
      } else {
        await logout();
      }

      setIsInitializing(false);
    });

    return () => unsubscribe();
  }, [hydrateUserFromCloud, logout]);

  // Premium Scandinavian Loading Screen
  if (isInitializing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FBFBF9] dark:bg-[#1A1A1A]">
        <div className="w-16 h-16 rounded-full border-[6px] border-[#DCE4E0] dark:border-[#2E3A35] border-t-[#4A6B5D] dark:border-t-[#6D8C7E] animate-spin shadow-sm mb-8" />
        <p className="text-[#2A2A2A] dark:text-[#FBFBF9] text-xl font-light tracking-widest uppercase">
          Securing Workspace...
        </p>
      </div>
    );
  }

  const hideNav = shouldHideNavigation(location.pathname, isActiveSession);

  return (
    <div className="min-h-screen bg-background dark:bg-[#1A1A1A] flex">
      {!hideNav && <Navigation />}

      <main className={`flex-1 w-full transition-all duration-300 ${!hideNav ? 'md:ml-64 pb-20 md:pb-0' : ''}`}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Welcome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Private Dashboards & Tracking Modules */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/water" element={<ProtectedRoute><Water /></ProtectedRoute>} />
          <Route path="/diet" element={<ProtectedRoute><Diet /></ProtectedRoute>} />
          <Route path="/focus" element={<ProtectedRoute><Focus /></ProtectedRoute>} />
          <Route path="/workout" element={<ProtectedRoute><Workout /></ProtectedRoute>} />
          <Route path="/mental" element={<ProtectedRoute><MentalHealth /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

          {/* Fallback routing logic */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
};

// Structural Browser Router Registration
const App = () => {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;
