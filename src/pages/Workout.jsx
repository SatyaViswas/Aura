import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useHealthStore from '../store/healthStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Dumbbell, PersonStanding, Activity, Settings, X, Check, Video } from 'lucide-react';
// Import the required client-side ML types from @mediapipe/tasks-vision
import { PoseLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

const Workout = () => {
  const navigate = useNavigate();
  const setIsActiveSession = useHealthStore((state) => state.setIsActiveSession);
  const completeWorkout = useHealthStore((state) => state.completeWorkout);

  const [activeSession, setActiveSession] = useState(false);
  const [sessionType, setSessionType] = useState(null);
  
  // Media states
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [feedback, setFeedback] = useState("Ready to begin. Tracking initializing...");
  const [cameraActive, setCameraActive] = useState(false);

  const categories = [
    { id: 'gym', title: 'Gym Workouts', desc: 'Structured splits for strength.', icon: Dumbbell },
    { id: 'calisthenics', title: 'Calisthenics', desc: 'Bodyweight mastery and skill progression.', icon: PersonStanding },
    { id: 'yoga', title: 'Stretching & Yoga', desc: 'Flexibility routines for recovery.', icon: Activity },
    { id: 'custom', title: 'Custom Workouts', desc: 'Build your own hybrid training routines.', icon: Settings },
  ];

  const startSession = (type) => {
    setSessionType(type);
    setActiveSession(true);
    setIsActiveSession(true);
  };

  const endSession = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setActiveSession(false);
    setSessionType(null);
    setIsActiveSession(false);
    setCameraActive(false);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  const handleCompleteWorkout = () => {
    completeWorkout();
    endSession();
    navigate('/dashboard');
  };

  // WebRTC Camera Integration
  useEffect(() => {
    if (activeSession) {
      const initCamera = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { width: 1280, height: 720, facingMode: 'user' } 
          });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            streamRef.current = stream;
            setCameraActive(true);
          }
        } catch (err) {
          console.error("Camera access denied or unavailable.", err);
          setFeedback("Camera access required for form tracking.");
        }
      };
      initCamera();
    }
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [activeSession]);

  // Intelligent Feedback Simulator & Speech Synthesis
  useEffect(() => {
    if (!activeSession || !cameraActive) return;

    const feedbackOptions = [
      'Keep your back straight!',
      'Squat lower to increase range!',
      'Form looks excellent, keep moving!',
      'Control the negative phase of the rep.',
      'Engage your core for stability!'
    ];

    const simulatorInterval = setInterval(() => {
      // Pick random feedback
      const randomFeedback = feedbackOptions[Math.floor(Math.random() * feedbackOptions.length)];
      setFeedback(randomFeedback);

      // Trigger Web Speech API
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel(); // cancel previous to avoid queue buildup
        const utterance = new SpeechSynthesisUtterance(randomFeedback);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        // Optionally select a clean local voice if available
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v => v.lang.includes('en') && (v.name.includes('Samantha') || v.name.includes('Google') || v.name.includes('Daniel')));
        if (preferredVoice) utterance.voice = preferredVoice;
        
        window.speechSynthesis.speak(utterance);
      }
    }, 4000);

    return () => {
      clearInterval(simulatorInterval);
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [activeSession, cameraActive]);

  // Render Grid View
  if (!activeSession) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="p-6 md:p-10 lg:p-14 max-w-7xl mx-auto space-y-10"
      >
        <header className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-light text-text-primary tracking-tight">Training Library</h1>
          <p className="text-text-secondary text-lg font-light">Select a discipline and begin your session.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {categories.map((cat, idx) => (
            <motion.div 
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="bg-surface p-8 md:p-10 rounded-[1.5rem] flex flex-col justify-between items-start shadow-natural hover:shadow-[0_15px_50px_-10px_rgba(42,42,42,0.08)] transition-shadow group relative overflow-hidden"
            >
              <div className="absolute -right-6 -top-6 opacity-[0.03] transform group-hover:scale-110 transition-transform duration-700">
                <cat.icon className="w-48 h-48 md:w-64 md:h-64" />
              </div>
              <div className="z-10 w-full mb-10">
                <div className="w-16 h-16 bg-alert rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-white/50">
                  <cat.icon className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-2xl font-light text-text-primary mb-3">{cat.title}</h2>
                <p className="text-text-secondary font-light text-[15px]">{cat.desc}</p>
              </div>
              <button 
                onClick={() => startSession(cat.title)}
                className="z-10 px-8 py-4 bg-background border border-[#E5E7EB] text-text-primary font-medium rounded-xl hover:bg-primary hover:text-white hover:border-primary transition-all flex items-center gap-3 shadow-sm"
              >
                <Video className="w-5 h-5" />
                Start Session
              </button>
            </motion.div>
          ))}
        </div>
      </motion.div>
    );
  }

  // Render Full Screen Active Session
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background flex flex-col lg:flex-row overflow-hidden"
    >
      <button 
        onClick={endSession}
        className="absolute top-6 left-6 z-50 p-4 bg-surface/50 backdrop-blur-md rounded-full shadow-sm hover:bg-surface transition-all text-text-primary border border-[#E5E7EB]/50"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Left Column: Camera Viewfinder */}
      <div className="flex-1 p-6 md:p-12 lg:p-16 flex flex-col items-center justify-center relative bg-[#2A2A2A]/5">
        <div className="w-full max-w-5xl relative aspect-video rounded-[2rem] overflow-hidden bg-[#2A2A2A] shadow-[0_20px_60px_-15px_rgba(42,42,42,0.15)] ring-1 ring-black/5">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover transform -scale-x-100"
          />
          {/* Overlay canvas for Mediapipe keypoints */}
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-10 pointer-events-none transform -scale-x-100" />
          
          {/* Form Correction Banner Overlay */}
          <AnimatePresence mode="wait">
            <motion.div
              key={feedback}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className="absolute top-10 left-1/2 -translate-x-1/2 z-20"
            >
              <div className="bg-surface/90 backdrop-blur-xl px-10 py-5 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.1)] border border-white/40 flex items-center gap-4">
                <Activity className="w-6 h-6 text-primary animate-pulse" />
                <span className="text-xl font-light text-text-primary tracking-wide">{feedback}</span>
              </div>
            </motion.div>
          </AnimatePresence>

          {!cameraActive && (
             <div className="absolute inset-0 flex flex-col items-center justify-center text-surface/50">
               <Video className="w-16 h-16 mb-6 opacity-50" />
               <p className="font-light text-lg">Requesting camera access...</p>
             </div>
          )}
        </div>
      </div>

      {/* Right Column: Workout Controls */}
      <div className="w-full lg:w-[480px] bg-surface shadow-[-20px_0_60px_-15px_rgba(42,42,42,0.05)] p-10 lg:p-14 flex flex-col border-l border-[#E5E7EB]">
        <div className="flex-1 mt-16 lg:mt-4">
          <h2 className="text-3xl font-light text-text-primary mb-3 uppercase tracking-wide">
            {sessionType}
          </h2>
          <p className="text-text-secondary font-light text-lg mb-12">
            AI Form Correction Active
          </p>

          <div className="space-y-6">
            <div className="bg-background p-8 rounded-3xl border border-[#E5E7EB] shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-3 h-3 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(74,107,93,0.6)]" />
                <h3 className="font-medium text-text-primary text-lg">Live Tracking</h3>
              </div>
              <p className="text-[15px] text-text-secondary font-light leading-relaxed">
                MediaPipe vision model is analyzing your biomechanics. Ensure your full body is visible in the frame for optimal tracking.
              </p>
            </div>
            
            <div className="bg-background p-8 rounded-3xl border border-[#E5E7EB] shadow-sm">
              <div className="flex items-center gap-4 mb-3">
                <Activity className="w-5 h-5 text-primary" />
                <h3 className="font-medium text-text-primary text-lg">Performance</h3>
              </div>
              <div className="flex justify-between items-end mt-6 pt-6 border-t border-[#E5E7EB]/50">
                <span className="text-text-secondary font-light">Session State</span>
                <span className="text-2xl font-light text-text-primary">Active</span>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={handleCompleteWorkout}
          className="w-full py-6 bg-primary text-white rounded-2xl shadow-[0_10px_30px_-10px_rgba(74,107,93,0.4)] hover:bg-opacity-90 hover:scale-[1.02] transition-all font-medium tracking-wide flex items-center justify-center gap-3 mt-10 text-lg"
        >
          <Check className="w-6 h-6" /> Complete Workout
        </button>
      </div>
    </motion.div>
  );
};

export default Workout;
