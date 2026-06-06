import React, { useState, useEffect, useRef } from 'react';
import useHealthStore from '../store/healthStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Check, Plus, Trash2 } from 'lucide-react';

const Focus = () => {
  const addFocusTime = useHealthStore((state) => state.addFocusTime);
  
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [customMinutes, setCustomMinutes] = useState('');
  const audioRef = useRef(null);

  useEffect(() => {
    // Basic fallback alert sound
    audioRef.current = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-software-interface-start-2574.mp3');
  }, []);

  // Initialize tasks from localStorage on mount
  useEffect(() => {
    try {
      const storedTasks = localStorage.getItem('aura_tasks');
      if (storedTasks) {
        const parsedTasks = JSON.parse(storedTasks);
        setTasks(parsedTasks);
      }
    } catch (error) {
      console.log('Error loading tasks from localStorage:', error);
      setTasks([]);
    }
  }, []);

  // Initialize timer state from localStorage on mount
  useEffect(() => {
    const storedEndTime = localStorage.getItem('aura_timer_endTimestamp');
    const storedDuration = localStorage.getItem('aura_timer_duration');

    if (storedEndTime && storedDuration) {
      const endTimestamp = parseInt(storedEndTime, 10);
      const now = Date.now();
      const remainingMs = endTimestamp - now;
      const remainingSeconds = Math.ceil(remainingMs / 1000);

      if (remainingSeconds > 0) {
        // Timer is still active, resume it
        setTimeLeft(remainingSeconds);
        setIsActive(true);
      } else {
        // Timer has expired, trigger completion
        localStorage.removeItem('aura_timer_endTimestamp');
        localStorage.removeItem('aura_timer_duration');
        setTimeLeft(parseInt(storedDuration, 10));
        setIsActive(false);
        addFocusTime(25);
        if (audioRef.current) {
          audioRef.current.play().catch(e => console.log('Audio play blocked:', e));
        }
      }
    }
  }, [addFocusTime]);

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    } else if (isActive && timeLeft === 0) {
      clearInterval(interval);
      setIsActive(false);
      // Clear localStorage when timer completes
      localStorage.removeItem('aura_timer_endTimestamp');
      localStorage.removeItem('aura_timer_duration');
      addFocusTime(25);
      if (audioRef.current) {
        audioRef.current.play().catch(e => console.log('Audio play blocked:', e));
      }
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, addFocusTime]);

  const toggleTimer = () => {
    const newIsActive = !isActive;
    setIsActive(newIsActive);

    if (newIsActive) {
      // Save end timestamp to localStorage
      const endTimestamp = Date.now() + (timeLeft * 1000);
      localStorage.setItem('aura_timer_endTimestamp', endTimestamp.toString());
      localStorage.setItem('aura_timer_duration', (25 * 60).toString());
    } else {
      // User paused the timer, clear localStorage
      localStorage.removeItem('aura_timer_endTimestamp');
      localStorage.removeItem('aura_timer_duration');
    }
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(25 * 60);
    // Clear localStorage when resetting
    localStorage.removeItem('aura_timer_endTimestamp');
    localStorage.removeItem('aura_timer_duration');
  };

  const handleAddMinutes = (minutesToAdd) => {
    const newTimeLeft = timeLeft + (minutesToAdd * 60);
    setTimeLeft(newTimeLeft);
    
    // Update localStorage if timer is active
    if (isActive) {
      const endTimestamp = Date.now() + (newTimeLeft * 1000);
      localStorage.setItem('aura_timer_endTimestamp', endTimestamp.toString());
      localStorage.setItem('aura_timer_duration', newTimeLeft.toString());
    }
  };

  const handleSetCustomDuration = (e) => {
    e.preventDefault();
    const minutes = parseInt(customMinutes, 10);
    if (!isNaN(minutes) && minutes > 0) {
      // Clear existing timer and set new duration
      setIsActive(false);
      const newDurationSeconds = minutes * 60;
      setTimeLeft(newDurationSeconds);
      
      // Clear localStorage for fresh timer
      localStorage.removeItem('aura_timer_endTimestamp');
      localStorage.removeItem('aura_timer_duration');
      
      setCustomMinutes('');
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    if (newTask.trim()) {
      const updatedTasks = [...tasks, { id: Date.now(), text: newTask.trim(), completed: false }];
      setTasks(updatedTasks);
      localStorage.setItem('aura_tasks', JSON.stringify(updatedTasks));
      setNewTask('');
    }
  };

  const toggleTask = (id) => {
    const updatedTasks = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    setTasks(updatedTasks);
    localStorage.setItem('aura_tasks', JSON.stringify(updatedTasks));
  };

  const deleteTask = (id, e) => {
    e.stopPropagation();
    const updatedTasks = tasks.filter(t => t.id !== id);
    setTasks(updatedTasks);
    localStorage.setItem('aura_tasks', JSON.stringify(updatedTasks));
  };

  const progress = ((25 * 60 - timeLeft) / (25 * 60)) * 100;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="p-6 md:p-10 lg:p-14 max-w-5xl mx-auto space-y-12"
    >
      <header className="space-y-2 text-center md:text-left">
        <h1 className="text-3xl md:text-4xl font-light text-text-primary tracking-tight">Deep Work</h1>
        <p className="text-text-secondary text-lg font-light">Eliminate distractions. Find flow.</p>
      </header>

      {/* Countdown Timer Engine */}
      <section className="bg-surface rounded-[1.5rem] p-12 md:p-20 shadow-natural flex flex-col items-center relative overflow-hidden">
        {/* Subtle background progress fill */}
        <div 
          className="absolute bottom-0 left-0 right-0 bg-alert/30 transition-all duration-1000 ease-linear"
          style={{ height: `${progress}%` }}
        />
        
        <div className="relative z-10 flex flex-col items-center">
          <div className="text-[6rem] md:text-[10rem] font-light text-primary tracking-tighter tabular-nums mb-12">
            {formatTime(timeLeft)}
          </div>
          
          <div className="flex items-center gap-6">
            <button 
              onClick={resetTimer}
              className="p-5 rounded-full bg-background text-text-secondary hover:text-primary hover:bg-alert transition-all shadow-sm"
              aria-label="Reset Timer"
            >
              <RotateCcw className="w-7 h-7" />
            </button>
            <button 
              onClick={toggleTimer}
              className="p-8 rounded-full bg-primary text-white shadow-[0_0_25px_rgba(74,107,93,0.4)] hover:scale-105 transition-all"
              aria-label={isActive ? "Pause Timer" : "Start Timer"}
            >
              {isActive ? <Pause className="w-10 h-10 fill-current" /> : <Play className="w-10 h-10 fill-current ml-1" />}
            </button>
          </div>

          {/* Quick-Add Time Controls */}
          <div className="w-full max-w-md space-y-8 mt-12">
            <div className="grid grid-cols-3 gap-4">
              {[5, 10, 25].map((minutes) => (
                <button
                  key={minutes}
                  onClick={() => handleAddMinutes(minutes)}
                  className="py-4 px-2 bg-background border border-border rounded-xl hover:bg-alert hover:border-alert hover:text-primary transition-all text-text-primary font-medium flex items-center justify-center gap-1 shadow-sm"
                >
                  <Plus className="w-4 h-4" /> {minutes}m
                </button>
              ))}
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-surface px-4 text-sm text-text-secondary">or custom duration</span>
              </div>
            </div>

            <form onSubmit={handleSetCustomDuration} className="flex gap-4">
              <input
                type="number"
                placeholder="Enter custom minutes"
                value={customMinutes}
                onChange={(e) => setCustomMinutes(e.target.value)}
                className="flex-1 px-5 py-4 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-text-primary transition-all"
                min="1"
              />
              <button
                type="submit"
                className="px-8 py-4 bg-primary text-white rounded-xl shadow-[0_0_12px_rgba(74,107,93,0.3)] hover:bg-opacity-90 transition-all font-medium tracking-wide"
              >
                Set
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Task Block Grid */}
      <section className="space-y-8">
        <h2 className="text-2xl font-light text-text-primary ml-2">Session Intentions</h2>
        
        <form onSubmit={handleAddTask} className="flex gap-4">
          <input
            type="text"
            placeholder="What will you accomplish?"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            className="flex-1 px-6 py-5 bg-surface shadow-sm border border-transparent focus:border-alert rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/10 text-text-primary transition-all text-lg font-light"
          />
          <button
            type="submit"
            className="px-8 py-5 bg-surface text-primary border border-transparent shadow-sm rounded-2xl hover:bg-alert transition-all flex items-center justify-center"
            disabled={!newTask.trim()}
          >
            <Plus className="w-6 h-6" />
          </button>
        </form>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence>
            {tasks.map(task => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`flex items-center p-6 rounded-2xl shadow-sm cursor-pointer transition-all ${task.completed ? 'bg-background opacity-60' : 'bg-surface hover:shadow-natural'}`}
                onClick={() => toggleTask(task.id)}
              >
                <div className={`w-7 h-7 rounded-md border flex items-center justify-center mr-5 transition-colors ${task.completed ? 'bg-primary border-primary text-white' : 'border-border bg-background text-transparent'}`}>
                  <Check className="w-4 h-4" />
                </div>
                <span className={`text-lg font-light flex-1 ${task.completed ? 'text-text-secondary line-through' : 'text-text-primary'}`}>
                  {task.text}
                </span>
                <button
                  onClick={(e) => deleteTask(task.id, e)}
                  className="ml-4 p-2 text-text-secondary hover:text-alert hover:bg-alert/10 rounded-lg transition-colors"
                  aria-label="Delete task"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </section>
    </motion.div>
  );
};

export default Focus;
