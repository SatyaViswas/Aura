import React, { useState, useEffect } from 'react';
import useHealthStore from '../store/healthStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Droplets, X } from 'lucide-react';

const Water = () => {
  const dailyGoals = useHealthStore((state) => state.dailyGoals);
  const addWater = useHealthStore((state) => state.addWater);
  const user = useHealthStore((state) => state.user);
  
  const { waterLogged, waterTarget } = dailyGoals;
  const progress = Math.min((waterLogged / waterTarget) * 100, 100) || 0;
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [droplets, setDroplets] = useState([]);
  const [ghostTexts, setGhostTexts] = useState([]);
  const [isRippling, setIsRippling] = useState(false);
  const [customAmount, setCustomAmount] = useState('');

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);

  const handleLogWater = (amount) => {
    if (!amount || isNaN(amount) || amount <= 0) return;
    const id = Date.now();
    
    // Trigger droplet fall
    setDroplets(prev => [...prev, { id, amount }]);
    setCustomAmount(''); // clear custom input
    
    setTimeout(() => {
      // Remove droplet as it hits water
      setDroplets(prev => prev.filter(d => d.id !== id));
      
      // Trigger ripple effect
      setIsRippling(true);
      setTimeout(() => setIsRippling(false), 800);
      
      // Add water to global store
      addWater(amount);
      
      // Show ghost text floating up
      setGhostTexts(prev => [...prev, { id, amount }]);
      
      setTimeout(() => {
        setGhostTexts(prev => prev.filter(g => g.id !== id));
      }, 1500);
      
    }, 500); // Fall duration
  };

  const waterTopY = 280 - (280 * progress / 100);
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="w-full h-full flex justify-center">
      {/* Stage 1: The Minimalist Dashboard Preview Card */}
      <div 
        onClick={() => setIsModalOpen(true)}
        className="w-full h-full bg-white dark:bg-[#262626] border border-black/[0.03] dark:border-white/[0.05] rounded-[1.5rem] p-6 flex flex-row items-center justify-between hover:shadow-[0_15px_40px_-10px_rgba(42,42,42,0.08)] dark:hover:shadow-[0_15px_40px_-10px_rgba(0,0,0,0.3)] shadow-[0_10px_40px_-10px_rgba(42,42,42,0.04)] dark:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.25)] transition-all cursor-pointer gap-4"
      >
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="w-12 h-12 rounded-[1rem] bg-[#DCE4E0] dark:bg-[#2E3A35] flex items-center justify-center shrink-0">
             <Droplets className="w-6 h-6 text-[#4A6B5D] dark:text-[#6D8C7E]" />
          </div>
          <div className="flex flex-col">
             <span className="text-[#2A2A2A] dark:text-[#FBFBF9] text-base font-medium tracking-wide">Hydration</span>
             <span className="text-[#767676] dark:text-[#A3A3A3] text-sm mt-0.5 font-light">{waterLogged} / {waterTarget} ml</span>
          </div>
        </div>
        <div className="flex items-center justify-center relative w-14 h-14 shrink-0">
           <svg className="w-14 h-14 transform -rotate-90">
              <circle cx="28" cy="28" r={radius} stroke="currentColor" strokeWidth="4" fill="none" className="text-black/[0.05] dark:text-white/10" />
              <circle 
                cx="28" 
                cy="28" 
                r={radius} 
                stroke="currentColor" 
                strokeWidth="4" 
                fill="none" 
                strokeDasharray={circumference} 
                strokeDashoffset={strokeDashoffset} 
                strokeLinecap="round" 
                className="text-[#4A6B5D] dark:text-[#6D8C7E] transition-all duration-700 ease-out"
              />
           </svg>
           <span className="absolute text-[11px] font-medium text-[#2A2A2A] dark:text-[#FBFBF9]">{Math.round(progress)}%</span>
        </div>
      </div>

      {/* Stage 2: The Immersive Hydro-Kinetic Logging Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-white/60 dark:bg-[#0A0C0B]/80 backdrop-blur-md"
            />
            
            {/* Modal Content */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative z-10 bg-white/95 dark:bg-[#111412]/95 backdrop-blur-xl border border-black/[0.05] dark:border-white/10 p-6 md:p-8 rounded-3xl max-w-sm w-full shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] dark:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] flex flex-col items-center"
            >
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="absolute top-5 right-5 text-black/40 hover:text-black/90 dark:text-white/40 dark:hover:text-white/90 transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>

              <header className="text-center mb-8 w-full mt-2">
                <h2 className="text-2xl font-light tracking-wide text-[#2A2A2A] dark:text-white/95">Log Hydration</h2>
                <p className="text-[#4A6B5D] dark:text-[#7CA992] text-[10px] font-medium tracking-[0.2em] uppercase mt-1">
                  Daily Goal: {waterTarget}ml
                </p>
              </header>

              {/* Kinetic Liquid Container */}
              <div className="relative flex justify-center mb-8 z-10 w-full">
                <div className="relative w-32 h-[280px] rounded-[2.5rem] border border-black/10 dark:border-white/20 shadow-[inset_0_0_20px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_0_20px_rgba(255,255,255,0.05)] bg-black/[0.02] dark:bg-white/5 backdrop-blur-md overflow-hidden">
                  
                  {/* Percentage Display Inside Container */}
                  <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none">
                    <span className="text-4xl font-thin text-[#4A6B5D]/30 dark:text-white/20 tracking-tighter">{Math.round(progress)}%</span>
                  </div>

                  {/* Droplets Layer */}
                  <div className="absolute inset-0 z-20 pointer-events-none">
                    <AnimatePresence>
                      {droplets.map(d => (
                        <motion.div
                          key={d.id}
                          initial={{ y: -20, opacity: 0, scale: 0.5 }}
                          animate={{ y: waterTopY, opacity: [0, 1, 1], scale: [0.5, 1, 1] }}
                          exit={{ opacity: 0, scale: 0 }}
                          transition={{ duration: 0.5, ease: "easeIn" }}
                          className="absolute left-1/2 -translate-x-1/2 drop-shadow-[0_0_8px_rgba(74,107,93,0.6)]"
                        >
                          <div 
                            className="w-4 h-4 bg-gradient-to-br from-[#7CA992] to-[#4A6B5D]"
                            style={{ borderRadius: "0 50% 50% 50%", transform: "rotate(45deg) translate(-10%, -10%)" }}
                          />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>

                  {/* Liquid Fill */}
                  <motion.div 
                    className="absolute bottom-0 left-0 w-full z-10"
                    initial={{ height: `${progress}%` }}
                    animate={{ 
                      height: `${progress}%`,
                      y: isRippling ? [0, 6, -4, 2, -1, 0] : 0
                    }}
                    transition={{ 
                      height: { type: "spring", stiffness: 45, damping: 15 },
                      y: { duration: 0.8, ease: "easeInOut" }
                    }}
                  >
                    {/* Back Wave */}
                    <motion.div
                      animate={{ 
                        x: ["0%", "-50%"],
                        scaleY: isRippling ? [1, 1.6, 0.7, 1.2, 1] : 1
                      }}
                      transition={{ 
                        x: { repeat: Infinity, duration: 6, ease: "linear" },
                        scaleY: { duration: 0.8, ease: "easeInOut" }
                      }}
                      className="absolute top-0 left-0 w-[200%] h-10 -translate-y-[95%] origin-bottom"
                    >
                      <svg viewBox="0 0 400 100" preserveAspectRatio="none" className="w-full h-full">
                        <path d="M 0 50 Q 50 15 100 50 T 200 50 T 300 50 T 400 50 V 101 H 0 Z" fill="#4A6B5D" opacity="0.4"/>
                      </svg>
                    </motion.div>
                    
                    {/* Front Wave */}
                    <motion.div
                      animate={{ 
                        x: ["-50%", "0%"],
                        scaleY: isRippling ? [1, 2, 0.5, 1.4, 1] : 1
                      }}
                      transition={{ 
                        x: { repeat: Infinity, duration: 4, ease: "linear" },
                        scaleY: { duration: 0.8, ease: "easeInOut" }
                      }}
                      className="absolute top-0 left-0 w-[200%] h-12 -translate-y-[90%] origin-bottom"
                    >
                      <svg viewBox="0 0 400 100" preserveAspectRatio="none" className="w-full h-full">
                        <path d="M 0 50 Q 50 75 100 50 T 200 50 T 300 50 T 400 50 V 101 H 0 Z" fill="#4A6B5D" opacity="0.6"/>
                      </svg>
                    </motion.div>

                    {/* Main Liquid Body */}
                    <div className="absolute top-0 left-0 w-full h-full bg-[#4A6B5D] opacity-60 backdrop-blur-sm" />

                    {/* Ghost Texts */}
                    <AnimatePresence>
                      {ghostTexts.map(g => (
                        <motion.div
                          key={g.id}
                          initial={{ opacity: 0, y: 0, scale: 0.8 }}
                          animate={{ opacity: 1, y: -50, scale: 1.1 }}
                          exit={{ opacity: 0, y: -70 }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                          className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full text-[#2A2A2A] dark:text-white font-medium tracking-wide text-sm pointer-events-none drop-shadow-sm z-30"
                        >
                          +{g.amount}ml
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </motion.div>
                </div>
              </div>

              {/* Preset Buttons */}
              <div className="flex gap-3 w-full mb-5">
                {[250, 500].map((amount) => (
                  <motion.button
                    key={amount}
                    whileTap={{ scale: 0.92 }}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => handleLogWater(amount)}
                    className="flex-1 py-3 rounded-xl bg-black/[0.03] dark:bg-white/5 border border-black/5 dark:border-white/10 text-[#2A2A2A] dark:text-white/90 font-medium text-sm tracking-wide shadow-sm backdrop-blur-md transition-all hover:bg-black/[0.06] dark:hover:bg-white/10"
                  >
                    <span className="opacity-50">+</span>{amount}<span className="opacity-50 text-xs ml-0.5">ml</span>
                  </motion.button>
                ))}
              </div>

              {/* Custom Input */}
              <div className="flex items-center gap-3 w-full">
                <input 
                  type="number"
                  placeholder="0"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="font-mono text-center w-24 h-12 bg-black/[0.03] dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-lg text-[#2A2A2A] dark:text-white/90 focus:outline-none focus:border-[#4A6B5D] dark:focus:border-[#7CA992]/50 focus:ring-1 focus:ring-[#4A6B5D]/50 dark:focus:ring-[#7CA992]/50 transition-all placeholder:text-black/30 dark:placeholder:text-white/30"
                />
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  onClick={() => handleLogWater(parseInt(customAmount, 10))}
                  className="flex-1 h-12 rounded-lg bg-[#4A6B5D] text-white font-medium text-sm tracking-wide shadow-[0_0_15px_rgba(74,107,93,0.3)] hover:bg-[#5A7B6D] transition-colors"
                >
                  Log Custom
                </motion.button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Water;
