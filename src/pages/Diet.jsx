import React, { useState } from 'react';
import useHealthStore from '../store/healthStore';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Plus } from 'lucide-react';

const Diet = () => {
  const dailyGoals = useHealthStore((state) => state.dailyGoals);
  const logCalories = useHealthStore((state) => state.logCalories);
  const theme = useHealthStore((state) => state.theme);
  
  const [activeTab, setActiveTab] = useState('Breakfast');
  const [mealName, setMealName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fats, setFats] = useState('');

  const { calorieLogged, calorieTarget, macroProtein, macroCarbs, macroFat } = dailyGoals;
  const calorieProgress = Math.min((calorieLogged / calorieTarget) * 100, 100) || 0;

  const macroData = [
    { name: 'Protein', value: macroProtein || 1 }, 
    { name: 'Carbs', value: macroCarbs || 1 },
    { name: 'Fats', value: macroFat || 1 },
  ];
  const totalMacros = macroProtein + macroCarbs + macroFat;
  const COLORS = theme === 'dark' ? ['#6D8C7E', '#BCA88E', '#E2D9C8'] : ['#4A6B5D', '#BCA88E', '#E2D9C8']; // Organic neutral shades

  const handleLogMeal = (e) => {
    e.preventDefault();
    const c = parseInt(calories, 10) || 0;
    const p = parseInt(protein, 10) || 0;
    const cb = parseInt(carbs, 10) || 0;
    const f = parseInt(fats, 10) || 0;
    
    if (c > 0) {
      logCalories(c, p, cb, f, mealName, activeTab);
      setMealName('');
      setCalories('');
      setProtein('');
      setCarbs('');
      setFats('');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="p-6 md:p-10 lg:p-14 max-w-6xl mx-auto space-y-10"
    >
      <header className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-light text-text-primary tracking-tight">Nutrition</h1>
        <p className="text-text-secondary text-lg font-light">Fuel your body with intention.</p>
      </header>

      {/* Calorie Tracker Header */}
      <section className="bg-surface rounded-[1.5rem] p-8 md:p-10 shadow-natural space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-xl font-light text-text-primary">Daily Energy</h2>
            <p className="text-text-secondary text-sm mt-1">Caloric intake overview</p>
          </div>
          <div className="text-right">
            <span className="text-4xl font-light text-primary">{calorieLogged}</span>
            <span className="text-text-secondary ml-1">/ {calorieTarget} kcal</span>
          </div>
        </div>
        <div className="w-full h-4 bg-background rounded-full overflow-hidden shadow-inner">
          <motion.div 
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${calorieProgress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Macro Distribution Matrix */}
        <section className="lg:col-span-5 bg-surface rounded-[1.5rem] p-8 md:p-10 shadow-natural flex flex-col items-center min-h-[450px]">
          <h2 className="text-xl font-light text-text-primary self-start mb-6">Macronutrients</h2>
          <div className="w-full flex-1 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={totalMacros === 0 ? [{name: 'Empty', value: 1}] : macroData}
                  innerRadius={90}
                  outerRadius={120}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {totalMacros === 0 ? (
                    <Cell fill={theme === 'dark' ? '#2E3A35' : '#DCE4E0'} />
                  ) : (
                    macroData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))
                  )}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', backgroundColor: theme === 'dark' ? '#262626' : '#FFFFFF' }} 
                  itemStyle={{ color: theme === 'dark' ? '#FBFBF9' : '#2A2A2A', fontWeight: 300 }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-4xl font-light text-text-primary">{totalMacros}</span>
              <span className="text-xs text-text-secondary uppercase tracking-widest mt-1">Total Grams</span>
            </div>
          </div>
          <div className="w-full flex justify-between mt-8 px-2 md:px-6">
            <div className="flex flex-col items-center">
              <div className="w-4 h-4 rounded-full mb-2" style={{ backgroundColor: COLORS[0] }} />
              <span className="text-sm font-light text-text-secondary">Protein ({macroProtein}g)</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-4 h-4 rounded-full mb-2" style={{ backgroundColor: COLORS[1] }} />
              <span className="text-sm font-light text-text-secondary">Carbs ({macroCarbs}g)</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-4 h-4 rounded-full mb-2" style={{ backgroundColor: COLORS[2] }} />
              <span className="text-sm font-light text-text-secondary">Fats ({macroFat}g)</span>
            </div>
          </div>
        </section>

        {/* Meal Input Console */}
        <section className="lg:col-span-7 bg-surface rounded-[1.5rem] p-8 md:p-10 shadow-natural flex flex-col">
          <h2 className="text-xl font-light text-text-primary mb-6">Log Meal</h2>
          
          <div className="flex gap-2 p-1 bg-background rounded-xl mb-8 overflow-x-auto no-scrollbar">
            {['Breakfast', 'Lunch', 'Dinner', 'Snacks'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === tab ? 'bg-surface text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <form onSubmit={handleLogMeal} className="flex-1 flex flex-col gap-8">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary ml-1">Meal Description</label>
              <input
                type="text"
                placeholder="e.g. Avocado Toast with Egg"
                value={mealName}
                onChange={(e) => setMealName(e.target.value)}
                className="w-full px-5 py-4 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-text-primary transition-all"
                required
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-secondary ml-1">Calories</label>
                <input
                  type="number"
                  placeholder="kcal"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  className="w-full px-5 py-4 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-text-primary transition-all"
                  required
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-secondary ml-1">Protein (g)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={protein}
                  onChange={(e) => setProtein(e.target.value)}
                  className="w-full px-5 py-4 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-text-primary transition-all"
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-secondary ml-1">Carbs (g)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={carbs}
                  onChange={(e) => setCarbs(e.target.value)}
                  className="w-full px-5 py-4 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-text-primary transition-all"
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-secondary ml-1">Fats (g)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={fats}
                  onChange={(e) => setFats(e.target.value)}
                  className="w-full px-5 py-4 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-text-primary transition-all"
                  min="0"
                />
              </div>
            </div>

            <button
              type="submit"
              className="mt-auto py-4 w-full bg-primary text-white rounded-xl shadow-[0_0_12px_rgba(74,107,93,0.3)] hover:bg-opacity-90 transition-all font-medium tracking-wide flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" /> Log {activeTab}
            </button>
          </form>
        </section>
      </div>
    </motion.div>
  );
};

export default Diet;
