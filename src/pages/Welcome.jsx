import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, Dumbbell, Droplets, Flame, Target, Brain, Cloud, HardDrive } from 'lucide-react';
import useHealthStore from '../store/healthStore';

const Welcome = () => {
  const navigate = useNavigate();
  const cloudSyncStatus = useHealthStore((state) => state.cloudSyncStatus);
  const isCloudActive = cloudSyncStatus === 'Cloud Sync Active';

  return (
    <div className="min-h-screen flex flex-col bg-background text-text-primary">
      <main className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 max-w-6xl mx-auto w-full">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full flex flex-col items-center text-center space-y-12"
        >
          {/* Hero Header */}
          <div className="space-y-6">
            <div className="inline-flex p-5 bg-alert rounded-full text-primary shadow-sm mb-4">
              <Activity className="w-12 h-12" />
            </div>
            <h1 className="text-4xl md:text-6xl font-light tracking-tight">
              Aura <span className="font-medium text-primary">Wellness</span>
            </h1>
            <p className="text-text-secondary text-lg md:text-xl font-light max-w-2xl leading-relaxed mx-auto">
              Your mindful companion for holistic wellbeing. A unified architecture designed to optimize every facet of your human experience.
            </p>
          </div>

          {/* 5-Pillar Editorial Grid */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 w-full pt-10 pb-14 border-y border-[#E5E7EB]">
            <div className="flex flex-col items-center gap-3">
              <Dumbbell className="w-7 h-7 text-primary" strokeWidth={1.5} />
              <h3 className="font-medium text-sm tracking-wider uppercase">Training</h3>
              <p className="text-xs text-text-secondary">AI Form Correction</p>
            </div>
            <div className="flex flex-col items-center gap-3">
              <Flame className="w-7 h-7 text-primary" strokeWidth={1.5} />
              <h3 className="font-medium text-sm tracking-wider uppercase">Nutrition</h3>
              <p className="text-xs text-text-secondary">Macro Tracking</p>
            </div>
            <div className="flex flex-col items-center gap-3">
              <Droplets className="w-7 h-7 text-primary" strokeWidth={1.5} />
              <h3 className="font-medium text-sm tracking-wider uppercase">Hydration</h3>
              <p className="text-xs text-text-secondary">Fluid Matrix</p>
            </div>
            <div className="flex flex-col items-center gap-3">
              <Target className="w-7 h-7 text-primary" strokeWidth={1.5} />
              <h3 className="font-medium text-sm tracking-wider uppercase">Focus</h3>
              <p className="text-xs text-text-secondary">Deep Work Engine</p>
            </div>
            <div className="flex flex-col items-center gap-3">
              <Brain className="w-7 h-7 text-primary" strokeWidth={1.5} />
              <h3 className="font-medium text-sm tracking-wider uppercase">Mind & Body</h3>
              <p className="text-xs text-text-secondary">Somatic Breathing</p>
            </div>
          </div>

          <button 
            onClick={() => navigate('/login')}
            className="px-10 py-5 bg-primary text-white rounded-2xl shadow-[0_15px_40px_-10px_rgba(74,107,93,0.4)] hover:bg-opacity-90 hover:scale-[1.02] transition-all font-medium tracking-wide text-lg"
          >
            Enter Workspace
          </button>
        </motion.div>
      </main>

      {/* Footer Connectivity Status Node */}
      <footer className="w-full p-6 border-t border-[#E5E7EB] bg-surface flex justify-center items-center">
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium tracking-wide border shadow-sm ${
          isCloudActive 
            ? 'bg-alert text-primary border-primary/20' 
            : 'bg-background text-text-secondary border-[#E5E7EB]'
        }`}>
          {isCloudActive ? <Cloud className="w-4 h-4" /> : <HardDrive className="w-4 h-4" />}
          {cloudSyncStatus}
        </div>
      </footer>
    </div>
  );
};

export default Welcome;
