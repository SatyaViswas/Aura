import React, { useState, useRef, useEffect, useMemo } from 'react';
import useHealthStore from '../store/healthStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Wind, Music, Calendar, ChevronDown, RotateCcw, Mic, X } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';

const MentalHealth = () => {
  const setMentalComplete = useHealthStore((state) => state.setMentalComplete);
  const saveMentalChat = useHealthStore((state) => state.saveMentalChat);
  const dailyGoals = useHealthStore((state) => state.dailyGoals);
  const history = useHealthStore((state) => state.history);

  // Conversational State and Multi-Turn History
  const [selectedDate, setSelectedDate] = useState('today');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [messages, setMessages] = useState(
    (dailyGoals.mentalChat && dailyGoals.mentalChat.length > 0) ? dailyGoals.mentalChat : [
      {
        id: 1,
        role: 'model',
        parts: [{ text: "Hello. I'm Nivi. Welcome to this quiet space. How are your mind and body feeling right now?" }]
      }
    ]
  );
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Voice Mode State
  const [isVoiceModeActive, setIsVoiceModeActive] = useState(false);
  const [voiceGender, setVoiceGender] = useState('female');
  const [aiProcessing, setAiProcessing] = useState(false);
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [micListening, setMicListening] = useState(false);
  const recognitionRef = useRef(null);
  const handleSendMessageRef = useRef();
  const isVoiceModeActiveRef = useRef(isVoiceModeActive);
  const webAudioRef = useRef(new Audio());

  useEffect(() => {
    isVoiceModeActiveRef.current = isVoiceModeActive;
  }, [isVoiceModeActive]);

  // Filter out dates that have mental chats logged (excluding today)
  const chatDates = useMemo(() => {
    return history
      .filter((entry) => entry.goals?.mentalChat && entry.goals.mentalChat.length > 0)
      .map((entry) => entry.date)
      .sort((a, b) => b.localeCompare(a)); // newest first
  }, [history]);

  const formatDropdownDate = (isoDate) => {
    if (isoDate === 'today') return 'Today';
    const d = new Date(isoDate + 'T12:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Breathing & Audio configuration states
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState('ready'); // 'ready' | 'in' | 'hold' | 'out'
  const breathTimerRef = useRef(null);
  const [selectedTrack, setSelectedTrack] = useState('40hz');
  const audioPlayerRef = useRef(null);

  // Absolute paths pointing straight to your new public/audio folder structure
  const audioTracks = [
    { id: '40hz', name: '40hz', url: '/audio/40hz.mp3' },
    { id: 'meditation', name: 'Deep meditation', url: '/audio/Deep meditation.mp3' },
    { id: 'healing', name: 'Healing Energy', url: '/audio/Healing Energy.mp3' }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };


  // Load chat logs when date changes
  useEffect(() => {
    if (selectedDate === 'today') {
      setMessages(
        (dailyGoals.mentalChat && dailyGoals.mentalChat.length > 0) ? dailyGoals.mentalChat : [
          {
            id: 1,
            role: 'model',
            parts: [{ text: "Hello. I'm Nivi. Welcome to this quiet space. How are your mind and body feeling right now?" }]
          }
        ]
      );
    } else {
      const entry = history.find((e) => e.date === selectedDate);
      if (entry && entry.goals?.mentalChat) {
        setMessages(entry.goals.mentalChat);
      }
    }
  }, [selectedDate]);

  useEffect(() => {
    scrollToBottom();
    if (selectedDate === 'today') {
      if (messages.length > 1 || messages[0].id !== 1) {
        saveMentalChat(messages);
      }
    }
  }, [messages, isTyping, saveMentalChat, selectedDate]);

  // Control playback based on breathingActive state
  useEffect(() => {
    if (!audioPlayerRef.current) return;
    if (breathingActive) {
      audioPlayerRef.current.play().catch(e => console.warn('Audio playback blocked:', e));
    } else {
      audioPlayerRef.current.pause();
    }
  }, [breathingActive]);

  // Control track change mid-session
  useEffect(() => {
    if (!audioPlayerRef.current) return;
    if (breathingActive) {
      audioPlayerRef.current.load();
      audioPlayerRef.current.play().catch(e => console.warn('Audio playback blocked on track change:', e));
    }
  }, [selectedTrack]);

  // Breathing phase cycle: 4s in → 2s hold → 6s out → repeat
  useEffect(() => {
    if (!breathingActive) {
      setBreathPhase('ready');
      clearTimeout(breathTimerRef.current);
      return;
    }

    const cycle = () => {
      setBreathPhase('in');
      breathTimerRef.current = setTimeout(() => {
        setBreathPhase('hold');
        breathTimerRef.current = setTimeout(() => {
          setBreathPhase('out');
          breathTimerRef.current = setTimeout(() => {
            cycle();
          }, 6000);
        }, 2000);
      }, 4000);
    };

    cycle();
    return () => clearTimeout(breathTimerRef.current);
  }, [breathingActive]);


  const handleResetChat = () => {
    const defaultMessage = [
      {
        id: 1,
        role: 'model',
        parts: [{ text: "Hello. I'm Nivi. Welcome to this quiet space. How are your mind and body feeling right now?" }]
      }
    ];
    // Wipe local UI state
    setMessages(defaultMessage);
    // Force wipe the dailyGoals state cache and sync an empty array to Firestore
    saveMentalChat(defaultMessage);
  };

  // ── Dual-Engine Audio Pipeline ───────────────────────────────────────────
  const speakResponse = async (textToSpeak) => {
    try {
      // Clear any currently playing audio stream immediately
      if (webAudioRef.current) {
        webAudioRef.current.pause();
        webAudioRef.current.src = "";
      }
      setAiSpeaking(true);
      
      const response = await fetch('http://localhost:8000/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToSpeak, gender: voiceGender })
      });
      
      if (!response.ok) throw new Error("Failed to fetch server neural voice stream");
      
      const blob = await response.blob();
      const audioUrl = URL.createObjectURL(blob);
      
      webAudioRef.current.src = audioUrl;
      
      // When the audio finishes playing naturally, restart the mic listener loop automatically
      webAudioRef.current.onended = () => {
        setAiSpeaking(false);
        if (isVoiceModeActiveRef.current && recognitionRef.current) {
          try { recognitionRef.current.start(); } catch(e) {}
        }
      };
      
      await webAudioRef.current.play();
    } catch (error) {
      console.warn("Neural audio playback failure:", error);
      setAiSpeaking(false);
    }
  };

  const toggleVoiceMode = () => {
    const nextState = !isVoiceModeActive;
    setIsVoiceModeActive(nextState);
    if (nextState) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!recognitionRef.current && SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;

        recognitionRef.current.onstart = () => setMicListening(true);
        recognitionRef.current.onend = () => setMicListening(false);

        // 3. Cross-Browser Mic Interruption (Barge-In)
        recognitionRef.current.onsoundstart = () => {
          if (webAudioRef.current && !webAudioRef.current.paused) {
            webAudioRef.current.pause();
            webAudioRef.current.src = "";
            setAiSpeaking(false);
            setMicListening(true);
          }
        };

        recognitionRef.current.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          if (transcript && handleSendMessageRef.current) {
            handleSendMessageRef.current(null, transcript);
          }
        };
      }
      speakResponse("Hello, I am here. How are your mind and body feeling?");
    } else {
      // 4. CLEANUP ON CLOSING VOICE OVERLAY
      if (webAudioRef.current) {
        webAudioRef.current.pause();
        webAudioRef.current.src = "";
      }
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) { }
      }
      setAiSpeaking(false);
      setMicListening(false);
      setAiProcessing(false);
    }
  };

  useEffect(() => {
    return () => {
      if (webAudioRef.current) {
        webAudioRef.current.pause();
        webAudioRef.current.src = "";
      }
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) { }
      }
    };
  }, []);

  // Asynchronous Chat Stream Handler
  const handleSendMessage = async (e, forcedText = null) => {
    if (e) e.preventDefault();
    const userText = forcedText || inputText.trim();
    if (!userText || isTyping || aiProcessing) return;

    const newUserMsg = { id: Date.now(), role: 'user', parts: [{ text: userText }] };

    setMessages((prev) => [...prev, newUserMsg]);
    if (!forcedText) setInputText('');
    setIsTyping(true);
    if (isVoiceModeActive) setAiProcessing(true);

    try {
      if (!import.meta.env.VITE_GEMINI_API_KEY) {
        throw new Error("Generative AI Key is missing or undefined.");
      }

      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

      const baseSystemInstruction = `You are Nivi, an advanced AI wellness, fitness, and productivity coach built into the Aura platform. You possess the full intelligence, creativity, and capabilities of a world-class AI, but your expertise is strictly focused on mastering these five pillars for the user:

1. Training: Generate full workout plans, exercise splits, form cues, and fitness advice.
2. Diet: Create meal plans, calculate macros/calories, and give nutrition advice.
3. Deep Focus: Build productivity schedules, Pomodoro routines, and time-management strategies.
4. Hydration: Provide water intake strategies and tracking advice.
5. Mind & Body: Provide mental health support, stress management, and breathwork routines.

### Core Directives:
- BE FLEXIBLE AND POWERFUL: Act as a fully capable AI assistant. If the user asks for a 4-day gym split, write the complete plan. If they ask a random doubt related to these topics, answer it fully and scientifically.
- NO OVER-APOLOGIZING: Never say "I cannot generate plans" or "I only focus on gentle movement." You are authorized to create aggressive workout plans, strict diets, or intense focus routines if the user wants them.
- TONE: Expert, highly encouraging, adaptable, and direct. Use clean markdown (bullet points, bold text) for readability.
- BOUNDARY PIVOT: If a user asks something completely unrelated to human optimization (e.g., writing Python code, politics, or math), gently pivot back: "I specialize entirely in your training, focus, diet, hydration, and mind-body balance! Let's get back to optimizing your day."`;

      const voiceInstructionOverride = `

[CRITICAL REAL-TIME VOICE PROTOCOL]
- You are speaking aloud directly into the user's headphones or device speakers. Long paragraphs sound exhausting and ruin the conversational loop.
- THE GOLDEN RULE: For standard questions, check-ins, or casual doubts, your response MUST be under 30 words (maximum of 1 or 2 short, crisp sentences). Answer instantly, clearly, and close the turn immediately to let the user reply.
- THE VERBAL TRANSITION RULE: Start your phrases with punchy, natural verbal transitions like 'Got it,' 'Sure thing,' 'Absolutely,' or 'Let's track that.'
- THE "PLAN GENERATION" EXCEPTION: If and only if the user explicitly demands a structured blueprint (e.g., 'Give me a full 3-day workout plan' or 'Write out a meal plan'), you are permitted to break the 30-word limit. However, format it as a highly condensed verbal outline (e.g., 'Day 1: Push exercises. Day 2: Pull exercises. Day 3: Legs. Want me to break down the exact reps for Day 1?'). Never list more than 3 bullet points at a time without checking in with the user first.
- FORMATTING RESTRICTION: Strip away all raw markdown layout artifacts like asterisks (**), hashtags (#), or numerical headers. Speak in clean, unadorned conversational prose.`;

      const systemInstruction = isVoiceModeActive
        ? baseSystemInstruction + voiceInstructionOverride
        : baseSystemInstruction;

      const model = genAI.getGenerativeModel({
        model: 'gemini-3.1-flash-lite',
        systemInstruction: systemInstruction
      });
      const historyPayload = messages
        .filter((msg) => msg.id !== 1)
        .map((msg) => ({
          role: msg.role,
          parts: [{ text: msg.parts[0].text }]
        }));

      const chatSession = model.startChat({ history: historyPayload });
      const result = await chatSession.sendMessage(userText);
      const responseText = result.response.text();

      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: 'model', parts: [{ text: responseText }] }
      ]);

      setMentalComplete(true);
      if (isVoiceModeActive) speakResponse(responseText);

    } catch (error) {
      console.warn("Nivi Generation Pipeline Exception:", error);
      const errorMsg = "I'm currently resting my connection lines. Please take a slow, deep breath, and try again in a moment.";
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'model',
          parts: [{ text: errorMsg }]
        }
      ]);
      if (isVoiceModeActive) speakResponse(errorMsg);
    } finally {
      setIsTyping(false);
      setAiProcessing(false);
    }
  };

  useEffect(() => {
    handleSendMessageRef.current = handleSendMessage;
  }, [handleSendMessage]);

  const toggleBreathing = () => {
    const nextState = !breathingActive;
    setBreathingActive(nextState);

    if (nextState) {
      setMentalComplete(true);
    }
  };

  // ── Breathing phase label config ─────────────────────────────────────────
  const phaseConfig = {
    ready: { label: 'Press begin', sublabel: 'Follow the circle' },
    in: { label: 'Breathe In', sublabel: '4 counts' },
    hold: { label: 'Hold', sublabel: '2 counts' },
    out: { label: 'Breathe Out', sublabel: '6 counts' },
  };
  const phase = phaseConfig[breathPhase];

  // Each ring: [diameter, border-opacity, bg-opacity, rotation-speed (s), rotation-dir, scale-factor]
  const rings = [
    { d: 216, bOp: 0.08, bgOp: 0, rot: 40, dir: 1, sf: 1.00 },
    { d: 180, bOp: 0.12, bgOp: 0, rot: 28, dir: -1, sf: 0.97 },
    { d: 144, bOp: 0.18, bgOp: 0.03, rot: 20, dir: 1, sf: 0.94 },
    { d: 108, bOp: 0.26, bgOp: 0.06, rot: 14, dir: -1, sf: 0.90 },
    { d: 72, bOp: 0.00, bgOp: 0.32, rot: 0, dir: 1, sf: 0.85 },
  ];

  const expandedScale = 1.32;
  const scaleTarget = breathingActive && (breathPhase === 'in' || breathPhase === 'hold') ? expandedScale : 1;
  const scaleDur = breathPhase === 'in' ? 4 : breathPhase === 'hold' ? 0.5 : 6;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="p-6 md:p-10 lg:p-14 max-w-6xl mx-auto space-y-8"
    >
      <header className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-light text-text-primary tracking-tight">Mind & Body</h1>
        <p className="text-text-secondary text-lg font-light">Reflect, breathe, and realign.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Nivi AI Companion Interface */}
        <section className="bg-surface rounded-[1.5rem] p-8 shadow-natural flex flex-col h-[650px] relative">
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-border">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-alert flex items-center justify-center text-primary font-medium text-lg shadow-inner">
                N
              </div>
              <div>
                <h2 className="text-xl font-medium text-text-primary">Nivi</h2>
                <p className="text-sm text-text-secondary">AI Companion</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Clear Current Chat Action */}
              {selectedDate === 'today' && (
                <button
                  type="button"
                  onClick={handleResetChat}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-background border border-border text-xs text-text-secondary hover:text-red-600 hover:border-red-200 transition-all font-light"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Clear Chat</span>
                </button>
              )}

              {/* Minimialistic Date Selector Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-background border border-border text-xs text-text-secondary hover:text-text-primary hover:border-primary/20 transition-all font-light"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{selectedDate === 'today' ? 'Today' : formatDropdownDate(selectedDate)}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <>
                      {/* Invisible Backdrop to close on click outside */}
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsDropdownOpen(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 z-20 w-44 bg-surface border border-border rounded-xl shadow-xl p-1.5 flex flex-col space-y-0.5"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedDate('today');
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors flex items-center justify-between ${selectedDate === 'today'
                            ? 'bg-[#DCE4E0] text-[#4A6B5D] font-medium'
                            : 'text-text-secondary hover:bg-background hover:text-text-primary'
                            }`}
                        >
                          <span>Today</span>
                        </button>
                        {chatDates.map((dateStr) => (
                          <button
                            key={dateStr}
                            type="button"
                            onClick={() => {
                              setSelectedDate(dateStr);
                              setIsDropdownOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors flex items-center justify-between ${selectedDate === dateStr
                              ? 'bg-[#DCE4E0] text-[#4A6B5D] font-medium'
                              : 'text-text-secondary hover:bg-background hover:text-text-primary'
                              }`}
                          >
                            <span>{formatDropdownDate(dateStr)}</span>
                          </button>
                        ))}
                        {chatDates.length === 0 && (
                          <div className="px-3 py-2 text-[10px] text-text-secondary/50 italic text-center">
                            No past chats
                          </div>
                        )}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-5 pr-2 no-scrollbar mb-6">
            <AnimatePresence>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-5 rounded-2xl ${msg.role === 'user'
                      ? 'bg-background text-text-primary rounded-tr-sm border border-border'
                      : 'bg-alert text-primary rounded-tl-sm'
                      }`}
                  >
                    <p className="text-[15px] leading-relaxed font-light whitespace-pre-wrap">{msg.parts[0].text}</p>
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex justify-start"
                >
                  <div className="p-5 rounded-2xl bg-alert text-primary rounded-tl-sm flex items-center gap-2">
                    <motion.div className="w-1.5 h-1.5 bg-primary/60 rounded-full" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0 }} />
                    <motion.div className="w-1.5 h-1.5 bg-primary/60 rounded-full" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }} />
                    <motion.div className="w-1.5 h-1.5 bg-primary/60 rounded-full" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="flex gap-4 items-center">
            {selectedDate === 'today' && (
              <button
                type="button"
                onClick={toggleVoiceMode}
                title="Activate Voice Mode"
                className="w-12 h-12 rounded-xl bg-background border border-border flex items-center justify-center text-text-secondary hover:text-primary hover:border-primary/20 transition-all shadow-sm shrink-0"
              >
                <Mic className="w-5 h-5" />
              </button>
            )}
            <input
              type="text"
              placeholder={selectedDate === 'today' ? "Share what's on your mind..." : "Viewing archived chat transcript"}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isTyping || selectedDate !== 'today'}
              className="flex-1 px-6 py-4 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-text-primary transition-all text-sm disabled:opacity-50 disabled:bg-background"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isTyping || selectedDate !== 'today'}
              className="px-6 py-4 bg-primary text-white rounded-xl shadow-[0_10px_30px_-10px_rgba(74,107,93,0.4)] hover:bg-opacity-90 transition-all disabled:opacity-50 flex items-center justify-center shrink-0"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </section>

        {/* Dynamic Soundscape Controller & Breathwork Somatic Ring */}
        <section className="bg-surface rounded-[1.5rem] p-8 md:p-12 shadow-natural flex flex-col justify-between h-[650px] relative overflow-hidden">
          <div className="z-10 relative">
            <h2 className="text-2xl font-light text-text-primary mb-2">Breathwork</h2>
            <p className="text-text-secondary text-[15px] font-light mb-8">Synchronize your breath to the expanding circle to trigger a parasympathetic response.</p>

            {/* Ambient Sound Selector Tabs */}
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-text-secondary font-medium flex items-center gap-1.5 mb-3">
                <Music className="w-3.5 h-3.5" /> Ambient Soundscape
              </label>
              <div className="flex flex-wrap gap-2 bg-background p-1.5 rounded-xl w-fit">
                {audioTracks.map((track) => (
                  <button
                    key={track.id}
                    onClick={() => setSelectedTrack(track.id)}
                    className={`px-5 py-2.5 rounded-lg text-sm transition-all ${selectedTrack === track.id
                      ? 'bg-surface text-primary shadow-sm font-medium'
                      : 'text-text-secondary hover:text-text-primary'
                      }`}
                  >
                    {track.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── Multi-Circle Soothing Breathing Animation ── */}
          <div className="flex-1 flex items-center justify-center relative z-0 mt-2">
            <div className="relative flex items-center justify-center" style={{ width: 240, height: 240 }}>

              {/* Wide ambient glow that breathes softly behind all rings */}
              <AnimatePresence>
                {breathingActive && (
                  <motion.div
                    key="glow"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{
                      opacity: [0.0, 0.08, 0.0],
                      scale: [1, scaleTarget * 1.18, 1],
                    }}
                    exit={{ opacity: 0 }}
                    transition={{
                      duration: breathPhase === 'in' ? 4 : breathPhase === 'hold' ? 0.5 : 6,
                      ease: [0.43, 0.13, 0.23, 0.96],
                      repeat: 0,
                    }}
                    className="absolute rounded-full bg-primary"
                    style={{ width: 280, height: 280 }}
                  />
                )}
              </AnimatePresence>

              {/* Concentric rings with staggered scale, rotation, and opacity */}
              {rings.map((ring, i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full"
                  style={{
                    width: ring.d,
                    height: ring.d,
                    border: ring.bOp > 0 ? `1px solid rgba(74,107,93,${ring.bOp})` : 'none',
                    backgroundColor: ring.bgOp > 0 ? `rgba(74,107,93,${ring.bgOp})` : 'transparent',
                  }}
                  animate={{
                    scale: breathingActive ? scaleTarget * ring.sf : ring.sf * 0.98,
                    opacity: breathingActive
                      ? breathPhase === 'in'
                        ? [1, 1 + (0.5 * (1 - i * 0.1))]
                        : breathPhase === 'out'
                          ? [1 + (0.5 * (1 - i * 0.1)), 1]
                          : 1
                      : 0.6 + i * 0.08,
                    rotate: ring.rot > 0
                      ? breathingActive ? [0, 360 * ring.dir] : 0
                      : 0,
                  }}
                  transition={{
                    scale: {
                      duration: scaleDur,
                      ease: [0.43, 0.13, 0.23, 0.96],
                    },
                    opacity: {
                      duration: breathPhase === 'in' ? 4 : breathPhase === 'out' ? 6 : 0.5,
                      ease: 'easeInOut',
                    },
                    rotate: {
                      duration: ring.rot,
                      ease: 'linear',
                      repeat: Infinity,
                      repeatType: 'loop',
                    },
                  }}
                />
              ))}

              {/* Solid core dot */}
              <motion.div
                className="absolute rounded-full bg-primary"
                style={{ width: 9, height: 9 }}
                animate={{
                  scale: breathingActive ? (breathPhase === 'in' || breathPhase === 'hold' ? 2 : 1) : 1,
                  opacity: breathingActive ? 1 : 0.45,
                }}
                transition={{ duration: breathPhase === 'in' ? 4 : 6, ease: 'easeInOut' }}
              />
            </div>
          </div>

          {/* Breathing phase label below animation */}
          <div className="flex flex-col items-center justify-center h-14 z-10 relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={breathPhase}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="flex flex-col items-center gap-0.5"
              >
                <span className="text-base font-medium text-primary tracking-wide">
                  {phase.label}
                </span>
                <span className="text-xs text-text-secondary uppercase tracking-widest font-medium">
                  {phase.sublabel}
                </span>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Begin / Stop button */}
          <div className="z-10 relative flex justify-center mt-4">
            <button
              onClick={toggleBreathing}
              className="px-10 py-5 bg-primary text-white rounded-2xl shadow-[0_0_20px_rgba(74,107,93,0.3)] hover:scale-105 transition-all font-medium tracking-wide flex items-center gap-3"
            >
              <Wind className="w-6 h-6" />
              {breathingActive ? 'Stop Session' : 'Begin Breathing'}
            </button>
          </div>
        </section>
      </div>
      <audio
        ref={audioPlayerRef}
        src={audioTracks.find(t => t.id === selectedTrack)?.url}
        loop
      />

      {/* ── Fluid Voice Mode Overlay ── */}
      <AnimatePresence>
        {isVoiceModeActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-black/80 backdrop-blur-md"
          >
            {/* Header placeholder */}
            <div className="w-full p-8 flex justify-center">
              <span className="text-white/50 text-sm font-light tracking-widest uppercase">Nivi Voice Interface</span>
            </div>

            {/* Fluid Morphing Circle */}
            <div className="flex-1 flex items-center justify-center relative w-full">
              <motion.div
                animate={{
                  borderRadius: [
                    "42% 58% 70% 30% / 45% 45% 55% 55%",
                    "55% 45% 30% 70% / 60% 30% 70% 40%",
                    "70% 30% 50% 50% / 30% 70% 50% 50%",
                    "45% 55% 40% 60% / 55% 45% 60% 40%",
                    "42% 58% 70% 30% / 45% 45% 55% 55%"
                  ],
                  scale: aiSpeaking ? [1, 1.3, 1] : micListening ? [1, 1.05, 1] : aiProcessing ? [0.9, 0.95, 0.9] : 1,
                  rotate: aiProcessing ? 360 : 0
                }}
                transition={{
                  borderRadius: { duration: 8, repeat: Infinity, ease: "linear" },
                  scale: {
                    duration: aiSpeaking ? 0.4 : micListening ? 3 : aiProcessing ? 2 : 1,
                    repeat: Infinity,
                    ease: "easeInOut"
                  },
                  rotate: { duration: 10, repeat: Infinity, ease: "linear" }
                }}
                className={`w-64 h-64 shadow-[0_0_80px_rgba(74,107,93,0.6)] ${aiSpeaking ? 'bg-primary' : micListening ? 'bg-[#DCE4E0]' : 'bg-primary/50'}`}
              />

              {/* Status Text Overlay */}
              <div className="absolute flex flex-col items-center">
                <span className={`text-sm font-medium tracking-widest uppercase ${aiSpeaking ? 'text-white' : micListening ? 'text-primary' : 'text-white/80'}`}>
                  {aiSpeaking ? "Speaking" : aiProcessing ? "Thinking" : micListening ? "Listening" : "Ready"}
                </span>
              </div>
            </div>

            {/* Overlay Control Deck */}
            <div className="w-full pb-12 pt-6 flex flex-col items-center gap-8 bg-gradient-to-t from-black to-transparent">
              {/* Voice Toggle Switch */}
              <div className="flex items-center bg-white/10 rounded-full p-1 backdrop-blur-sm">
                <button
                  onClick={() => setVoiceGender('female')}
                  className={`px-6 py-2 rounded-full text-xs font-medium transition-all ${voiceGender === 'female' ? 'bg-white text-black' : 'text-white/60 hover:text-white'}`}
                >
                  Female
                </button>
                <button
                  onClick={() => setVoiceGender('male')}
                  className={`px-6 py-2 rounded-full text-xs font-medium transition-all ${voiceGender === 'male' ? 'bg-white text-black' : 'text-white/60 hover:text-white'}`}
                >
                  Male
                </button>
              </div>

              {/* Exit Button */}
              <button
                onClick={toggleVoiceMode}
                className="w-16 h-16 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/50 flex items-center justify-center transition-all shadow-[0_0_30px_rgba(239,68,68,0.2)] hover:shadow-[0_0_40px_rgba(239,68,68,0.6)] hover:scale-105"
                title="Exit Voice Mode"
              >
                <X className="w-8 h-8" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default MentalHealth;