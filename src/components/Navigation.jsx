import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Activity, Target, User, Droplets, Flame, Brain, Dumbbell, Settings, LogOut, Sliders } from 'lucide-react';
import useHealthStore from '../store/healthStore';

const Navigation = () => {
  const location = useLocation();
  const isActiveSession = useHealthStore((state) => state.isActiveSession);
  
  // 1. Store Connection & Local Menu States
  const user = useHealthStore((state) => state.user);
  const dailyGoals = useHealthStore((state) => state.dailyGoals);
  const logout = useHealthStore((state) => state.logout);

  const [isDesktopMenuOpen, setIsDesktopMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Hidden on Welcome, Login, Signup, or active session
  const hiddenRoutes = ['/', '/login', '/signup'];
  if (hiddenRoutes.includes(location.pathname) || isActiveSession) {
    return null;
  }

  // State update handlers preventing browser parsing errors natively
  const updateWaterTarget = (val) => {
    const num = parseInt(val, 10);
    if (!isNaN(num)) {
      useHealthStore.setState((state) => ({
        dailyGoals: { ...state.dailyGoals, waterTarget: num }
      }));
    }
  };

  const updateFocusTarget = (val) => {
    const num = parseInt(val, 10);
    if (!isNaN(num)) {
      useHealthStore.setState((state) => ({
        dailyGoals: { ...state.dailyGoals, focusTarget: num }
      }));
    }
  };

  // Reusable Shared Settings Module
  const ProfileSettings = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 border-b border-[#E5E7EB] pb-4">
        <div className="w-10 h-10 bg-alert rounded-full flex items-center justify-center">
          <User className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="font-medium text-text-primary text-[15px]">{user.name}</p>
          <p className="text-xs text-text-secondary font-light">Authenticated Workspace</p>
        </div>
      </div>
      
      <div className="space-y-5">
        <div className="flex items-center gap-2 text-sm text-text-secondary mb-2 font-medium tracking-wide uppercase">
          <Sliders className="w-4 h-4" /> Baseline Targets
        </div>
        
        <div className="flex justify-between items-center gap-4">
          <label className="text-sm font-light text-text-primary">Water Target (ml)</label>
          <input 
            type="number"
            value={dailyGoals.waterTarget}
            onChange={(e) => updateWaterTarget(e.target.value)}
            className="w-24 px-3 py-2 bg-background border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-right font-medium transition-all"
          />
        </div>
        
        <div className="flex justify-between items-center gap-4">
          <label className="text-sm font-light text-text-primary">Deep Focus (min)</label>
          <input 
            type="number"
            value={dailyGoals.focusTarget}
            onChange={(e) => updateFocusTarget(e.target.value)}
            className="w-24 px-3 py-2 bg-background border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-right font-medium transition-all"
          />
        </div>
      </div>

      <button 
        onClick={() => {
          logout();
          setIsDesktopMenuOpen(false);
          setIsMobileMenuOpen(false);
        }}
        className="w-full pt-5 mt-2 border-t border-[#E5E7EB] flex items-center gap-3 text-text-secondary hover:text-red-500 transition-colors"
      >
        <LogOut className="w-5 h-5" />
        <span className="text-sm font-medium tracking-wide">Log Out</span>
      </button>
    </div>
  );

  return (
    <>
      {/* Desktop Side Rail */}
      <nav className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 bg-surface shadow-natural p-6 z-40">
        <div className="mb-10 flex items-center gap-2 text-primary">
           <Activity className="w-8 h-8" />
           <span className="text-xl font-semibold tracking-wide">Aura</span>
        </div>
        <ul className="flex flex-col gap-4">
          <li>
            <NavLink to="/dashboard" className={({isActive}) => `flex items-center gap-3 p-3 rounded-lg transition-colors ${isActive ? 'bg-alert text-primary font-medium' : 'text-text-secondary hover:bg-gray-50'}`}>
              <Home className="w-5 h-5" />
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink to="/water" className={({isActive}) => `flex items-center gap-3 p-3 rounded-lg transition-colors ${isActive ? 'bg-alert text-primary font-medium' : 'text-text-secondary hover:bg-gray-50'}`}>
              <Droplets className="w-5 h-5" />
              Hydration
            </NavLink>
          </li>
          <li>
            <NavLink to="/diet" className={({isActive}) => `flex items-center gap-3 p-3 rounded-lg transition-colors ${isActive ? 'bg-alert text-primary font-medium' : 'text-text-secondary hover:bg-gray-50'}`}>
              <Flame className="w-5 h-5" />
              Nutrition
            </NavLink>
          </li>
          <li>
            <NavLink to="/focus" className={({isActive}) => `flex items-center gap-3 p-3 rounded-lg transition-colors ${isActive ? 'bg-alert text-primary font-medium' : 'text-text-secondary hover:bg-gray-50'}`}>
              <Target className="w-5 h-5" />
              Deep Work
            </NavLink>
          </li>
          <li>
            <NavLink to="/workout" className={({isActive}) => `flex items-center gap-3 p-3 rounded-lg transition-colors ${isActive ? 'bg-alert text-primary font-medium' : 'text-text-secondary hover:bg-gray-50'}`}>
              <Dumbbell className="w-5 h-5" />
              Training
            </NavLink>
          </li>
          <li>
            <NavLink to="/mental" className={({isActive}) => `flex items-center gap-3 p-3 rounded-lg transition-colors ${isActive ? 'bg-alert text-primary font-medium' : 'text-text-secondary hover:bg-gray-50'}`}>
              <Brain className="w-5 h-5" />
              Mind & Body
            </NavLink>
          </li>
        </ul>
        
        {/* 2. Desktop Profile Dropdown Interface */}
        <div className="mt-auto pt-6 border-t border-[#E5E7EB] relative">
           <AnimatePresence>
             {isDesktopMenuOpen && (
               <>
                 <div className="fixed inset-0 z-40" onClick={() => setIsDesktopMenuOpen(false)} />
                 <motion.div 
                   initial={{ opacity: 0, y: 10, scale: 0.95 }}
                   animate={{ opacity: 1, y: 0, scale: 1 }}
                   exit={{ opacity: 0, y: 10, scale: 0.95 }}
                   transition={{ duration: 0.2 }}
                   className="absolute bottom-full left-0 mb-4 w-full bg-[#FFFFFF] rounded-[1rem] shadow-[0_20px_60px_-15px_rgba(42,42,42,0.15)] p-6 z-50 border border-[#E5E7EB]"
                 >
                   <ProfileSettings />
                 </motion.div>
               </>
             )}
           </AnimatePresence>
           
           <button 
             onClick={() => setIsDesktopMenuOpen(!isDesktopMenuOpen)}
             className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${isDesktopMenuOpen ? 'bg-alert text-primary' : 'hover:bg-gray-50'}`}
           >
             <div className={`flex items-center gap-3 ${isDesktopMenuOpen ? 'text-primary' : 'text-text-secondary'}`}>
               <User className="w-5 h-5" />
               <span className="font-medium text-[15px]">{user.name}</span>
             </div>
             <Settings className={`w-4 h-4 transition-transform duration-300 ${isDesktopMenuOpen ? 'text-primary rotate-90' : 'text-text-secondary opacity-50'}`} />
           </button>
        </div>
      </nav>

      {/* Mobile Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface shadow-[0_-10px_40px_-10px_rgba(42,42,42,0.04)] px-6 py-4 flex justify-between items-center z-40 border-t border-[#E5E7EB]/50">
        <NavLink to="/dashboard" className={({isActive}) => `flex flex-col items-center gap-1 transition-colors ${isActive ? 'text-primary' : 'text-text-secondary'}`}>
          <Home className="w-6 h-6" />
          <span className="text-[11px] font-medium tracking-wide">Home</span>
        </NavLink>
        <NavLink to="/water" className={({isActive}) => `flex flex-col items-center gap-1 transition-colors ${isActive ? 'text-primary' : 'text-text-secondary'}`}>
          <Droplets className="w-6 h-6" />
          <span className="text-[11px] font-medium tracking-wide">Water</span>
        </NavLink>
        <NavLink to="/focus" className={({isActive}) => `flex flex-col items-center gap-1 transition-colors ${isActive ? 'text-primary' : 'text-text-secondary'}`}>
          <Target className="w-6 h-6" />
          <span className="text-[11px] font-medium tracking-wide">Focus</span>
        </NavLink>
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className={`flex flex-col items-center gap-1 transition-colors ${isMobileMenuOpen ? 'text-primary' : 'text-text-secondary'}`}
        >
          <User className="w-6 h-6" />
          <span className="text-[11px] font-medium tracking-wide">Profile</span>
        </button>
      </nav>

      {/* 3. Mobile Profile Modal Interface */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex items-end">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-[#2A2A2A]/20 backdrop-blur-[2px]" 
              onClick={() => setIsMobileMenuOpen(false)} 
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="relative w-full bg-[#FFFFFF] rounded-t-[2rem] p-8 pb-12 shadow-[0_-20px_40px_-10px_rgba(42,42,42,0.1)]"
            >
              <div className="w-12 h-1.5 bg-[#E5E7EB] rounded-full mx-auto mb-8" />
              <ProfileSettings />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navigation;
