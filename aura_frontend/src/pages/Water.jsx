import React, { useState } from 'react';
import useHealthStore from '../store/healthStore';
import { motion } from 'framer-motion';
import { Droplets, Plus } from 'lucide-react';

const Water = () => {
  const dailyGoals = useHealthStore((state) => state.dailyGoals);
  const addWater = useHealthStore((state) => state.addWater);
  const [customAmount, setCustomAmount] = useState('');

  const { waterLogged, waterTarget } = dailyGoals;
  const progress = Math.min((waterLogged / waterTarget) * 100, 100) || 0;
  
  // SVG Circle calculations
  const radius = 140;
  const stroke = 14;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    const val = parseInt(customAmount, 10);
    if (!isNaN(val) && val > 0) {
      addWater(val);
      setCustomAmount('');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="p-6 md:p-10 lg:p-14 max-w-4xl mx-auto space-y-12"
    >
      <header className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-light text-text-primary tracking-tight">Hydration</h1>
        <p className="text-text-secondary text-lg font-light">Nourish your body, drop by drop.</p>
      </header>

      <section className="p-5 sm:p-7 md:p-8 rounded-[1.5rem] bg-surface border border-border shadow-natural flex flex-col items-center gap-12">
        {/* Progress View Metric Floats */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 w-full border-b border-border pb-6">
          <div>
            <span className="text-xs uppercase tracking-widest text-text-secondary font-medium">Logged</span>
            <div className="text-3xl font-light text-text-primary">{waterLogged} ml</div>
          </div>
          <div className="sm:text-right">
            <span className="text-xs uppercase tracking-widest text-text-secondary font-medium">Daily Target</span>
            <div className="text-3xl font-light text-primary">{waterTarget} ml</div>
          </div>
        </div>

        {/* Visual Ring Matrix */}
        <div className="relative flex items-center justify-center">
          <svg
            height={radius * 2}
            width={radius * 2}
            className="transform -rotate-90"
          >
            {/* Background Ring */}
            <circle
              stroke="var(--color-alert)"
              fill="transparent"
              strokeWidth={stroke}
              r={normalizedRadius}
              cx={radius}
              cy={radius}
            />
            {/* Active Progress Ring */}
            <motion.circle
              stroke="var(--color-primary)"
              fill="transparent"
              strokeWidth={stroke}
              strokeDasharray={circumference + ' ' + circumference}
              style={{ strokeDashoffset }}
              strokeLinecap="round"
              r={normalizedRadius}
              cx={radius}
              cy={radius}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center text-center">
            <Droplets className="w-10 h-10 text-primary mb-2 opacity-80" />
            <span className="text-5xl font-light text-text-primary">{waterLogged}</span>
            <span className="text-sm text-text-secondary uppercase tracking-widest mt-1">/ {waterTarget} ml</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="w-full max-w-md space-y-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full">
            {[250, 500, 750, 1000].map((amount) => (
              <button
                key={amount}
                onClick={() => addWater(amount)}
                className="px-3 py-3 text-xs sm:text-sm rounded-xl font-light w-full transition-all bg-background border border-border hover:bg-alert hover:border-alert hover:text-primary text-text-primary flex items-center justify-center gap-1 shadow-sm"
              >
                <Plus className="w-4 h-4" /> {amount}
              </button>
            ))}
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-surface px-4 text-sm text-text-secondary">or custom amount</span>
            </div>
          </div>

          <form onSubmit={handleCustomSubmit} className="flex gap-4">
            <input
              type="number"
              placeholder="Amount in ml"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              className="flex-1 px-5 py-4 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-text-primary transition-all"
              min="1"
            />
            <button
              type="submit"
              className="px-8 py-4 bg-primary text-white rounded-xl shadow-[0_0_12px_rgba(74,107,93,0.3)] hover:bg-opacity-90 transition-all font-medium tracking-wide"
            >
              Add
            </button>
          </form>
        </div>
      </section>
    </motion.div>
  );
};

export default Water;
