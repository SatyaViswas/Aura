import React, { useState } from 'react';
import useHealthStore from '../store/healthStore';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Plus, Loader2, Sparkles, Coffee, Sun, Moon, Apple, Flame, ChevronDown, ChevronUp, Mic, Send, X } from 'lucide-react';
import { BACKEND_URL } from '../config/api';

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

  const [aiInput, setAiInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [expandedMeal, setExpandedMeal] = useState(null);
  const [mobileAiInput, setMobileAiInput] = useState('');

  const [modalMealType, setModalMealType] = useState(null);
  const [showAiSectionSelector, setShowAiSectionSelector] = useState(false);
  const [pendingAiPrompt, setPendingAiPrompt] = useState('');

  const { calorieLogged, calorieTarget, macroProtein, macroCarbs, macroFat, meals = [] } = dailyGoals;
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
      setModalMealType(null);
    }
  };

  const handleAiLogSubmit = async (e) => {
    e.preventDefault();
    if (!aiInput.trim()) return;

    setIsAnalyzing(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/nutrition/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          food_description: aiInput,
          meal_type: activeTab
        })
      });

      if (!response.ok) throw new Error('Failed to parse nutrition');

      const parsedData = await response.json();

      logCalories(
        parsedData.calories,
        parsedData.protein,
        parsedData.carbs,
        parsedData.fat,
        parsedData.display_name,
        activeTab
      );

      setAiInput('');
    } catch (error) {
      console.error('AI Log Error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleMobileAiSubmit = async (e) => {
    e.preventDefault();
    if (!mobileAiInput.trim()) return;

    setPendingAiPrompt(mobileAiInput);
    setMobileAiInput('');
    setShowAiSectionSelector(true);
  };

  const executeMobileAiLog = async (mealType) => {
    setShowAiSectionSelector(false);
    setIsAnalyzing(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/nutrition/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          food_description: pendingAiPrompt,
          meal_type: mealType
        })
      });

      if (!response.ok) throw new Error('Failed to parse nutrition');

      const parsedData = await response.json();

      logCalories(
        parsedData.calories,
        parsedData.protein,
        parsedData.carbs,
        parsedData.fat,
        parsedData.display_name,
        mealType
      );
    } catch (error) {
      console.error('AI Log Error:', error);
    } finally {
      setIsAnalyzing(false);
      setPendingAiPrompt('');
    }
  };

  return (
    <>
      {/* -------------------- DESKTOP LAYOUT -------------------- */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="hidden md:block p-6 md:p-10 lg:p-14 max-w-6xl mx-auto space-y-10"
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
                  data={totalMacros === 0 ? [{ name: 'Empty', value: 1 }] : macroData}
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
                className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab ? 'bg-surface text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* AI Smart Log Panel */}
          <div className="mb-6 space-y-3">
            <label className="text-sm font-medium text-text-secondary ml-1">AI Smart Log (Beta)</label>
            <form onSubmit={handleAiLogSubmit} className="flex flex-col sm:flex-row gap-3 items-stretch w-full">
              <input
                type="text"
                placeholder="e.g., I ate 2 classic chicken shawarmas and drank a glass of buttermilk..."
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                className="flex-1 px-5 py-4 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-text-primary transition-all"
                disabled={isAnalyzing}
              />
              <button
                type="submit"
                disabled={isAnalyzing || !aiInput.trim()}
                className="py-4 px-6 bg-primary text-white rounded-xl shadow-[0_0_12px_rgba(74,107,93,0.3)] hover:bg-opacity-90 disabled:opacity-70 disabled:cursor-not-allowed transition-all font-medium tracking-wide flex items-center justify-center gap-2 whitespace-nowrap"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Ask AI
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="relative flex items-center py-2 mb-6">
            <div className="flex-grow border-t border-border"></div>
            <span className="flex-shrink-0 mx-4 text-text-secondary text-sm font-light">or log manually</span>
            <div className="flex-grow border-t border-border"></div>
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

      {/* Today's Meals Section */}
      <section className="bg-surface rounded-[1.5rem] p-8 md:p-10 shadow-natural mt-8">
        <h2 className="text-xl font-light text-text-primary mb-6">Today's Meals</h2>

        {meals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-text-secondary/60">
            <Apple className="w-12 h-12 mb-3 opacity-20" />
            <p className="font-light">No meals logged yet today.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {['Breakfast', 'Lunch', 'Snacks', 'Dinner'].map(mealType => {
              const categoryMeals = meals.filter(m => m.type === mealType);
              if (categoryMeals.length === 0) return null;

              const iconMap = {
                Breakfast: <Coffee className="w-5 h-5" />,
                Lunch: <Sun className="w-5 h-5" />,
                Snacks: <Apple className="w-5 h-5" />,
                Dinner: <Moon className="w-5 h-5" />
              };

              return (
                <div key={mealType} className="space-y-4">
                  <div className="flex items-center gap-2 text-text-primary pb-2 border-b border-border/50">
                    <div className="p-2 bg-background rounded-lg text-primary">
                      {iconMap[mealType] || <Flame className="w-5 h-5" />}
                    </div>
                    <h3 className="text-lg font-medium">{mealType}</h3>
                    <span className="ml-auto text-sm text-text-secondary font-light">
                      {categoryMeals.reduce((acc, m) => acc + (m.cals || 0), 0)} kcal
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categoryMeals.map(meal => (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        key={meal.id}
                        className="bg-background border border-border p-5 rounded-2xl flex flex-col justify-between hover:border-primary/20 transition-all duration-300"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <h4 className="font-medium text-text-primary break-words pr-2 leading-tight">{meal.name}</h4>
                          <div className="flex items-center gap-1 bg-surface px-2 py-1 rounded-md text-primary shrink-0">
                            <Flame className="w-3.5 h-3.5" />
                            <span className="text-sm font-semibold">{meal.cals}</span>
                          </div>
                        </div>

                        <div className="flex justify-between mt-auto pt-4 border-t border-border/50">
                          <div className="flex flex-col items-center">
                            <span className="text-[10px] text-text-secondary uppercase tracking-wider mb-1">Protein</span>
                            <span className="text-sm font-medium text-text-primary">{meal.p}g</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <span className="text-[10px] text-text-secondary uppercase tracking-wider mb-1">Carbs</span>
                            <span className="text-sm font-medium text-text-primary">{meal.c}g</span>
                          </div>
                          <div className="flex flex-col items-center">
<span className="text-[10px] text-text-secondary uppercase tracking-wider mb-1">Fats</span>
                            <span className="text-sm font-medium text-text-primary">{meal.f}g</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
      </motion.div>

      {/* -------------------- MOBILE LAYOUT -------------------- */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="block md:hidden p-4 pb-[calc(11rem+env(safe-area-inset-bottom))] space-y-6"
      >
        <header className="space-y-1">
          <h1 className="text-3xl font-light text-text-primary tracking-tight">Nutrition</h1>
        </header>

        {/* Component 1: Compressed Macro Dashboard */}
        <section className="bg-surface rounded-3xl p-5 shadow-natural flex items-center gap-6">
          <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90 drop-shadow-sm">
              <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" className="text-background" />
              <circle 
                cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" 
                strokeDasharray="283" strokeDashoffset={283 - (283 * calorieProgress / 100)} 
                className="text-primary transition-all duration-1000 ease-out" 
                strokeLinecap="round" 
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-bold text-text-primary leading-none">{Math.max(0, calorieTarget - calorieLogged)}</span>
              <span className="text-[10px] text-text-secondary uppercase tracking-wider mt-1">Left</span>
            </div>
          </div>

          <div className="flex-1 space-y-3">
            {[
              { label: 'Protein', value: macroProtein, color: COLORS[0], target: 150 },
              { label: 'Carbs', value: macroCarbs, color: COLORS[1], target: 250 },
              { label: 'Fat', value: macroFat, color: COLORS[2], target: 70 }
            ].map((macro) => (
              <div key={macro.label} className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-text-secondary">{macro.label}</span>
                  <span className="text-text-primary">{macro.value}g</span>
                </div>
                <div className="w-full h-1.5 bg-background rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{ 
                      width: `${Math.min((macro.value / macro.target) * 100, 100)}%`,
                      backgroundColor: macro.color 
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Component 2: Collapsible Meal Deck */}
        <section className="space-y-3">
          {['Breakfast', 'Lunch', 'Dinner', 'Snacks'].map((mealType) => {
            const categoryMeals = meals.filter(m => m.type === mealType);
            const totalCals = categoryMeals.reduce((acc, m) => acc + (m.cals || 0), 0);
            const isExpanded = expandedMeal === mealType;

            const iconMap = {
              Breakfast: <Coffee className="w-4 h-4" />,
              Lunch: <Sun className="w-4 h-4" />,
              Snacks: <Apple className="w-4 h-4" />,
              Dinner: <Moon className="w-4 h-4" />
            };

            return (
              <div key={mealType} className="bg-surface rounded-2xl overflow-hidden shadow-sm">
                <button 
                  onClick={() => setExpandedMeal(isExpanded ? null : mealType)}
                  className="w-full flex items-center justify-between p-4 min-h-[44px]"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-background rounded-xl text-primary">
                      {iconMap[mealType] || <Flame className="w-4 h-4" />}
                    </div>
                    <span className="text-base font-medium text-text-primary">{mealType}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-light text-text-secondary">{totalCals} kcal</span>
                    {isExpanded ? <ChevronUp className="w-5 h-5 text-text-secondary" /> : <ChevronDown className="w-5 h-5 text-text-secondary" />}
                  </div>
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-border/50"
                    >
                      <div className="p-4 space-y-3">
                        {categoryMeals.length === 0 ? (
                          <p className="text-sm text-text-secondary/60 text-center py-2 font-light">No items logged</p>
                        ) : (
                          categoryMeals.map(meal => (
                            <div key={meal.id} className="flex justify-between items-center bg-background rounded-xl p-3">
                              <div>
                                <p className="text-sm font-medium text-text-primary truncate max-w-[150px]">{meal.name}</p>
                                <p className="text-[10px] text-text-secondary mt-0.5">
                                  {meal.p}g P • {meal.c}g C • {meal.f}g F
                                </p>
                              </div>
                              <div className="flex items-center gap-1 text-primary bg-primary/10 px-2 py-1 rounded-md min-w-[44px] justify-center min-h-[44px]">
                                <Flame className="w-3 h-3" />
                                <span className="text-xs font-semibold">{meal.cals}</span>
                              </div>
                            </div>
                          ))
                        )}
                        <button 
                          onClick={() => { setActiveTab(mealType); setModalMealType(mealType); }}
                          className="w-full mt-2 py-3 border border-dashed border-primary/30 rounded-xl text-primary text-sm font-medium flex justify-center items-center gap-2 min-h-[44px]"
                        >
                          <Plus className="w-4 h-4" /> Add to {mealType}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </section>
      </motion.div>

      {/* Component 3: Bottom Sticky "Ask Ava" AI Drawer */}
      <div className="block md:hidden fixed bottom-[calc(6.25rem+env(safe-area-inset-bottom))] left-4 right-4 z-40">
        <div 
          className="border border-border backdrop-blur-xl shadow-2xl rounded-2xl p-3 flex items-center gap-3"
          style={{ backgroundColor: theme === 'dark' ? 'rgba(38, 38, 38, 0.8)' : 'rgba(255, 255, 255, 0.8)' }}
        >
          <form onSubmit={handleMobileAiSubmit} className="flex-1 flex items-center gap-2 relative">
            <input
              type="text"
              placeholder="Ask Ava to log a meal..."
              value={mobileAiInput}
              onChange={(e) => setMobileAiInput(e.target.value)}
              disabled={isAnalyzing}
              className="flex-1 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary/30 min-h-[44px] text-text-primary placeholder:text-text-secondary"
              style={{ backgroundColor: theme === 'dark' ? 'rgba(26, 26, 26, 0.5)' : 'rgba(251, 251, 249, 0.5)' }}
            />
            {isAnalyzing ? (
              <Loader2 className="w-5 h-5 animate-spin text-primary absolute right-3" />
            ) : (
              <button 
                type="submit"
                disabled={!mobileAiInput.trim()}
                className="w-[44px] h-[44px] shrink-0 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg disabled:opacity-50 transition-opacity"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            )}
          </form>
        </div>
      </div>

      {/* -------------------- MODALS (MOBILE) -------------------- */}
      <AnimatePresence>
        {showAiSectionSelector && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-background/80 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              className="w-full max-w-md bg-surface border border-border rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl"
            >
              <h3 className="text-xl font-medium text-text-primary mb-4 text-center">Which meal is this for?</h3>
              <div className="grid grid-cols-2 gap-3">
                {['Breakfast', 'Lunch', 'Snacks', 'Dinner'].map(type => (
                  <button
                    key={type}
                    onClick={() => executeMobileAiLog(type)}
                    className="py-4 rounded-xl bg-background border border-border text-text-primary font-medium hover:border-primary/50 transition-colors"
                  >
                    {type}
                  </button>
                ))}
              </div>
              <button 
                onClick={() => { setShowAiSectionSelector(false); setPendingAiPrompt(''); }}
                className="w-full mt-4 py-3 rounded-xl text-text-secondary font-medium hover:bg-background transition-colors"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}

        {modalMealType && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-background/80 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              className="w-full max-w-md bg-surface border border-border rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-medium text-text-primary">Add to {modalMealType}</h3>
                <button onClick={() => setModalMealType(null)} className="p-2 text-text-secondary hover:text-text-primary rounded-full hover:bg-background transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* AI Smart Log Panel */}
              <div className="mb-6 space-y-3">
                <label className="text-sm font-medium text-text-secondary ml-1">AI Smart Log (Beta)</label>
                <form onSubmit={(e) => { e.preventDefault(); setModalMealType(null); handleAiLogSubmit(e); }} className="flex flex-col gap-3">
                  <input
                    type="text"
                    placeholder="e.g., 2 slices of avocado toast..."
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    className="w-full px-5 py-4 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-text-primary transition-all text-sm"
                    disabled={isAnalyzing}
                  />
                  <button
                    type="submit"
                    disabled={isAnalyzing || !aiInput.trim()}
                    className="w-full py-4 bg-primary text-white rounded-xl shadow-lg hover:bg-opacity-90 disabled:opacity-70 flex items-center justify-center gap-2 font-medium"
                  >
                    {isAnalyzing ? <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing...</> : <><Sparkles className="w-5 h-5" /> Ask AI</>}
                  </button>
                </form>
              </div>

              <div className="relative flex items-center py-2 mb-6">
                <div className="flex-grow border-t border-border"></div>
                <span className="flex-shrink-0 mx-4 text-text-secondary text-sm font-light">or log manually</span>
                <div className="flex-grow border-t border-border"></div>
              </div>

              <form onSubmit={handleLogMeal} className="flex flex-col gap-5">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-text-secondary ml-1">Description</label>
                  <input type="text" placeholder="Food name" value={mealName} onChange={(e) => setMealName(e.target.value)} required className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm text-text-primary" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-text-secondary ml-1">Calories</label>
                    <input type="number" placeholder="kcal" value={calories} onChange={(e) => setCalories(e.target.value)} required min="0" className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm text-text-primary" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-text-secondary ml-1">Protein (g)</label>
                    <input type="number" placeholder="0" value={protein} onChange={(e) => setProtein(e.target.value)} min="0" className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm text-text-primary" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-text-secondary ml-1">Carbs (g)</label>
                    <input type="number" placeholder="0" value={carbs} onChange={(e) => setCarbs(e.target.value)} min="0" className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm text-text-primary" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-text-secondary ml-1">Fats (g)</label>
                    <input type="number" placeholder="0" value={fats} onChange={(e) => setFats(e.target.value)} min="0" className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm text-text-primary" />
                  </div>
                </div>
                <button type="submit" className="w-full mt-2 py-4 bg-primary text-white rounded-xl shadow-lg hover:bg-opacity-90 font-medium flex items-center justify-center gap-2">
                  <Plus className="w-5 h-5" /> Log {modalMealType}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Diet;
