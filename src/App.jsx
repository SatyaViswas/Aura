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

// Layout Components
import Navigation from './components/Navigation';

// 2. Immersive Navigation Visibility Controller
const shouldHideNavigation = (pathname, isActiveSession) => {
  if (isActiveSession) return true;
  const publicRoutes = ['/', '/login', '/signup'];
  if (publicRoutes.includes(pathname)) return true;
  return false;
};

// 5. Protected Routing Configuration Wrapper
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
  const isActiveSession = useHealthStore((state) => state.isActiveSession);

  // 3. Real-Time Firebase Auth Session Listener
  useEffect(() => {
    if (!auth) {
      // Offline fallback handling
      setIsInitializing(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Session Recovery: Capture identity token and flag authentication
        useHealthStore.setState((state) => ({
          user: {
            ...state.user,
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            isAuthenticated: true
          }
        }));
        
        // Invoke background action to load personal records
        await hydrateUserFromCloud(firebaseUser.uid);
      } else {
        // Auth payload is null: wipe browser caches cleanly
        await logout();
      }
      
      // Release initialization lock
      setIsInitializing(false);
    });

    // Cleanup subscription to prevent memory leaks
    return () => unsubscribe();
  }, [hydrateUserFromCloud, logout]);

  // 4. Premium Scandinavian Loading Screen View
  if (isInitializing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FBFBF9]">
        <div className="w-16 h-16 rounded-full border-[6px] border-[#DCE4E0] border-t-[#4A6B5D] animate-spin shadow-sm mb-8" />
        <p className="text-[#2A2A2A] text-xl font-light tracking-widest uppercase">
          Securing Workspace...
        </p>
      </div>
    );
  }

  // Calculate layout visibility
  const hideNav = shouldHideNavigation(location.pathname, isActiveSession);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Conditionally render Navigation UI */}
      {!hideNav && <Navigation />}
      
      {/* Route Projection Canvas */}
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
      <AppContent />
    </BrowserRouter>
  );
};

export default App;
