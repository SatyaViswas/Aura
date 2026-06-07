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
  Menu,
  X,
} from 'lucide-react';
import useHealthStore from '../store/healthStore';

const Navigation = () => {
  const location  = useLocation();
  const navigate  = useNavigate();
  const isActiveSession = useHealthStore((state) => state.isActiveSession);

  const user   = useHealthStore((state) => state.user);
  const logout = useHealthStore((state) => state.logout);

  const [isDesktopMenuOpen, setIsDesktopMenuOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);


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
      {/* ── Mobile Top Navbar ────────────────────────────────────────────────── */}
      <nav className="md:hidden fixed top-0 left-0 right-0 h-16 bg-surface shadow-[0_10px_40px_-10px_rgba(42,42,42,0.04)] dark:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] px-6 flex items-center justify-between z-40 border-b border-border transition-colors duration-300">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileDrawerOpen(true)}
            className="p-2 -ml-2 rounded-lg text-text-secondary hover:bg-gray-50 dark:hover:bg-surface/5 transition-colors"
            aria-label="Open navigation menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2 text-[#4A6B5D] dark:text-[#6D8C7E]">
            <Activity className="w-6 h-6" />
            <span className="text-lg font-semibold tracking-wide">Aura</span>
          </div>
        </div>
      </nav>

      {/* ── Mobile Side Drawer ───────────────────────────────────────────────── */}
      <AnimatePresence>
        {isMobileDrawerOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-[#2A2A2A]/20 dark:bg-black/40 backdrop-blur-[2px]"
              onClick={() => setIsMobileDrawerOpen(false)}
            />
            {/* Drawer Body */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
              className="relative w-72 max-w-[80vw] h-full bg-surface shadow-[20px_0_40px_-10px_rgba(42,42,42,0.1)] dark:shadow-[20px_0_40px_-10px_rgba(0,0,0,0.4)] flex flex-col p-6 border-r border-border"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2 text-[#4A6B5D] dark:text-[#6D8C7E]">
                  <Activity className="w-8 h-8" />
                  <span className="text-xl font-semibold tracking-wide">Aura</span>
                </div>
                <button
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="p-2 rounded-lg text-text-secondary hover:bg-gray-50 dark:hover:bg-surface/5 transition-colors"
                  aria-label="Close navigation menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Links */}
              <ul className="flex flex-col gap-1 overflow-y-auto flex-1">
                {[
                  { to: '/dashboard', label: 'Dashboard',  Icon: Home        },
                  { to: '/water',     label: 'Hydration',   Icon: Droplets    },
                  { to: '/diet',      label: 'Nutrition',   Icon: Flame       },
                  { to: '/focus',     label: 'Deep Work',   Icon: Target      },
                  { to: '/workout',   label: 'Training',    Icon: Dumbbell    },
                  { to: '/mental',    label: 'Mind & Body', Icon: Brain       },
                  { to: '/history',   label: 'History',     Icon: CalendarDays },
                  { to: '/settings',  label: 'Settings',     Icon: Settings2   },
                ].map(({ to, label, Icon }) => (
                  <li key={to}>
                    <NavLink
                      to={to}
                      onClick={() => setIsMobileDrawerOpen(false)}
                      className={({ isActive }) => navLinkClass(isActive)}
                    >
                      <Icon className="w-5 h-5" />
                      {label}
                    </NavLink>
                  </li>
                ))}
              </ul>

              {/* Footer / Logout */}
              <div className="pt-6 border-t border-[#E5E7EB] dark:border-white/10 mt-auto">
                <button
                  onClick={() => {
                    logout();
                    setIsMobileDrawerOpen(false);
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-lg text-text-secondary hover:text-red-500 dark:hover:text-red-400 transition-colors text-sm font-medium"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Log Out</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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

      {/* Bottom bar removed — hamburger side drawer is the sole mobile nav */}

    </>
  );
};

export default Navigation;
