import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Activity,
  Target,
  User,
  Droplets,
  Flame,
  Brain,
  Dumbbell,
  Settings,
  LogOut,
  Settings2,
  CalendarDays,
} from 'lucide-react';
import useHealthStore from '../store/healthStore';

const Navigation = () => {
  const location  = useLocation();
  const navigate  = useNavigate();
  const isActiveSession = useHealthStore((state) => state.isActiveSession);

  const user   = useHealthStore((state) => state.user);
  const logout = useHealthStore((state) => state.logout);

  const [isDesktopMenuOpen, setIsDesktopMenuOpen] = useState(false);
  const [isMobileMenuOpen,  setIsMobileMenuOpen]  = useState(false);

  const hiddenRoutes = ['/', '/login', '/signup'];
  if (hiddenRoutes.includes(location.pathname) || isActiveSession) {
    return null;
  }

  // Shared nav link class factory
  const navLinkClass = (isActive) =>
    `flex items-center gap-3 p-3 rounded-lg transition-colors ${
      isActive
        ? 'bg-[#DCE4E0] dark:bg-[#2E3A35] text-[#4A6B5D] dark:text-[#6D8C7E] font-medium'
        : 'text-text-secondary hover:bg-gray-50 dark:hover:bg-surface/5'
    }`;

  // Compact dropdown — links to /settings instead of embedding target inputs
  const ProfileMenu = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-3 border-b border-[#E5E7EB] dark:border-white/10 pb-4">
        <div className="w-10 h-10 bg-[#DCE4E0] dark:bg-[#2E3A35] rounded-full flex items-center justify-center">
          <User className="w-5 h-5 text-[#4A6B5D] dark:text-[#6D8C7E]" />
        </div>
        <div>
          <p className="font-medium text-text-primary text-[15px]">{user.name}</p>
          <p className="text-xs text-text-secondary font-light">Authenticated Workspace</p>
        </div>
      </div>

      <button
        onClick={() => {
          navigate('/settings');
          setIsDesktopMenuOpen(false);
          setIsMobileMenuOpen(false);
        }}
        className="w-full flex items-center gap-3 p-2 rounded-lg text-text-secondary hover:bg-gray-50 dark:hover:bg-surface/5 transition-colors text-sm font-medium"
      >
        <Settings2 className="w-5 h-5" />
        <span>Settings</span>
      </button>

      <button
        onClick={() => {
          logout();
          setIsDesktopMenuOpen(false);
          setIsMobileMenuOpen(false);
        }}
        className="w-full flex items-center gap-3 p-2 rounded-lg text-text-secondary hover:text-red-500 dark:hover:text-red-400 transition-colors text-sm font-medium"
      >
        <LogOut className="w-5 h-5" />
        <span>Log Out</span>
      </button>
    </div>
  );

  return (
    <>
      {/* ── Desktop Side Rail ────────────────────────────────────────────────── */}
      <nav className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 bg-surface shadow-[0_10px_40px_-10px_rgba(42,42,42,0.04)] dark:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] p-6 z-40 border-r border-border transition-colors duration-300">
        <div className="mb-10 flex items-center gap-2 text-[#4A6B5D] dark:text-[#6D8C7E]">
          <Activity className="w-8 h-8" />
          <span className="text-xl font-semibold tracking-wide">Aura</span>
        </div>

        <ul className="flex flex-col gap-1">
          {[
            { to: '/dashboard', label: 'Dashboard',  Icon: Home        },
            { to: '/water',     label: 'Hydration',   Icon: Droplets    },
            { to: '/diet',      label: 'Nutrition',   Icon: Flame       },
            { to: '/focus',     label: 'Deep Work',   Icon: Target      },
            { to: '/workout',   label: 'Training',    Icon: Dumbbell    },
            { to: '/mental',    label: 'Mind & Body', Icon: Brain       },
            { to: '/history',   label: 'History',     Icon: CalendarDays },
          ].map(({ to, label, Icon }) => (
            <li key={to}>
              <NavLink to={to} className={({ isActive }) => navLinkClass(isActive)}>
                <Icon className="w-5 h-5" />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Desktop Profile Dropdown */}
        <div className="mt-auto pt-6 border-t border-[#E5E7EB] dark:border-white/10 relative">
          <AnimatePresence>
            {isDesktopMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsDesktopMenuOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute bottom-full left-0 mb-4 w-full bg-surface rounded-[1rem] shadow-[0_20px_60px_-15px_rgba(42,42,42,0.15)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] p-5 z-50 border border-[#E5E7EB] dark:border-white/10"
                >
                  <ProfileMenu />
                </motion.div>
              </>
            )}
          </AnimatePresence>

          <button
            onClick={() => setIsDesktopMenuOpen(!isDesktopMenuOpen)}
            className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
              isDesktopMenuOpen
                ? 'bg-[#DCE4E0] dark:bg-[#2E3A35] text-[#4A6B5D] dark:text-[#6D8C7E]'
                : 'hover:bg-gray-50 dark:hover:bg-surface/5'
            }`}
          >
            <div className={`flex items-center gap-3 ${
              isDesktopMenuOpen
                ? 'text-[#4A6B5D] dark:text-[#6D8C7E]'
                : 'text-text-secondary'
            }`}>
              <User className="w-5 h-5" />
              <span className="font-medium text-[15px]">{user.name}</span>
            </div>
            <Settings className={`w-4 h-4 transition-transform duration-300 ${
              isDesktopMenuOpen
                ? 'text-[#4A6B5D] dark:text-[#6D8C7E] rotate-90'
                : 'text-text-secondary opacity-50'
            }`} />
          </button>
        </div>
      </nav>

      {/* ── Mobile Bottom Bar ────────────────────────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface shadow-[0_-10px_40px_-10px_rgba(42,42,42,0.04)] dark:shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.3)] px-4 py-4 flex justify-between items-center z-40 border-t border-[#E5E7EB]/50 dark:border-white/[0.06] transition-colors duration-300">
        {[
          { to: '/dashboard', Icon: Home,         label: 'Home'    },
          { to: '/workout',   Icon: Dumbbell,     label: 'Train'   },
          { to: '/history',   Icon: CalendarDays, label: 'History' },
          { to: '/focus',     Icon: Target,       label: 'Focus'   },
        ].map(({ to, Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 transition-colors ${
                isActive
                  ? 'text-[#4A6B5D] dark:text-[#6D8C7E]'
                  : 'text-text-secondary'
              }`
            }
          >
            <Icon className="w-6 h-6" />
            <span className="text-[11px] font-medium tracking-wide">{label}</span>
          </NavLink>
        ))}

        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className={`flex flex-col items-center gap-1 transition-colors ${
            isMobileMenuOpen
              ? 'text-[#4A6B5D] dark:text-[#6D8C7E]'
              : 'text-text-secondary'
          }`}
        >
          <User className="w-6 h-6" />
          <span className="text-[11px] font-medium tracking-wide">Profile</span>
        </button>
      </nav>

      {/* ── Mobile Profile Modal ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex items-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-[#2A2A2A]/20 dark:bg-black/40 backdrop-blur-[2px]"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
              className="relative w-full bg-surface rounded-t-[2rem] p-8 pb-12 shadow-[0_-20px_40px_-10px_rgba(42,42,42,0.1)] dark:shadow-[0_-20px_40px_-10px_rgba(0,0,0,0.4)]"
            >
              <div className="w-12 h-1.5 bg-[#E5E7EB] dark:bg-surface/10 rounded-full mx-auto mb-8" />
              <ProfileMenu />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navigation;
