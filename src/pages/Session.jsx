import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useHealthStore from '../store/healthStore';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

const Session = () => {
  const setIsActiveSession = useHealthStore((state) => state.setIsActiveSession);
  const addFocusTime = useHealthStore((state) => state.addFocusTime);
  const navigate = useNavigate();

  useEffect(() => {
    setIsActiveSession(true);
    return () => setIsActiveSession(false);
  }, [setIsActiveSession]);

  const endSession = () => {
    // In a real app, this would use a real timer duration
    addFocusTime(25);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-text-primary text-background flex flex-col items-center justify-center relative">
      <button 
        onClick={endSession}
        className="absolute top-8 right-8 p-3 rounded-full bg-surface/10 hover:bg-surface/20 transition-colors text-background"
      >
        <X className="w-6 h-6" />
      </button>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
        className="flex flex-col items-center space-y-8"
      >
        <div className="w-64 h-64 rounded-full border-2 border-primary/30 flex items-center justify-center relative">
          <motion.div 
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="absolute inset-0 rounded-full bg-primary/10 blur-xl"
          />
          <h2 className="text-6xl font-light z-10">25:00</h2>
        </div>
        
        <p className="text-text-secondary text-lg font-light tracking-widest uppercase">
          Deep Focus
        </p>
      </motion.div>
    </div>
  );
};

export default Session;
