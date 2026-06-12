import React, { useState, useRef, useEffect, useMemo } from 'react';
import useHealthStore from '../store/healthStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Wind, Music, Calendar, ChevronDown, RotateCcw, Mic, X, Volume2, MoreHorizontal } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { BACKEND_URL } from '../config/api';

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
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef(null);

  // Keep track of latest messages in a ref for safe use in non-dependent sync effect
  const messagesRef = useRef(messages);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Compute displayed messages: only display today's live messages if date is 'today',
  // otherwise fetch historical archived logs from the history store.
  const displayedMessages = useMemo(() => {
    if (selectedDate === 'today') {
      return messages;
    }
    const entry = history.find((e) => e.date === selectedDate);
    return entry?.goals?.mentalChat || [
      {
        id: 1,
        role: 'model',
        parts: [{ text: "Hello. I'm Nivi. Welcome to this quiet space. How are your mind and body feeling right now?" }]
      }
    ];
  }, [selectedDate, messages, history]);

  // Voice Mode State
  const [isVoiceModeActive, setIsVoiceModeActive] = useState(false);
  const [voiceGender, setVoiceGender] = useState('female');
  const [aiProcessing, setAiProcessing] = useState(false);
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [micListening, setMicListening] = useState(false);
  const recognitionRef = useRef(null);
  const handleSendMessageRef = useRef();
  const isVoiceModeActiveRef = useRef(isVoiceModeActive);
  const playerA = useRef(new Audio());
  const playerB = useRef(new Audio());
  const activePlayerRef = useRef('A');
  const audioQueueRef = useRef([]);
  const isPlayingRef = useRef(false);

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
  const ambientPlayerRef = useRef(null);

  // Absolute paths pointing straight to your new public/audio folder structure
  const audioTracks = [
    { id: '40hz', name: '40hz', url: '/audio/40hz.mp3' },
    { id: 'meditation', name: 'Deep meditation', url: '/audio/Deep meditation.mp3' },
    { id: 'healing', name: 'Healing Energy', url: '/audio/Healing Energy.mp3' }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };


  // Sync today's chat from store to local state when store changes externally (e.g. daily reset or hydration)
  useEffect(() => {
    const isLocalDifferent = JSON.stringify(messagesRef.current) !== JSON.stringify(dailyGoals.mentalChat);
    if (isLocalDifferent) {
      setMessages(
        (dailyGoals.mentalChat && dailyGoals.mentalChat.length > 0) ? dailyGoals.mentalChat : [
          {
            id: 1,
            role: 'model',
            parts: [{ text: "Hello. I'm Nivi. Welcome to this quiet space. How are your mind and body feeling right now?" }]
          }
        ]
      );
    }
  }, [dailyGoals.mentalChat]);

  // Save today's chat changes back to the store
  useEffect(() => {
    if (isStreaming) return; // Do not save during active stream
    
    // Only dispatch save operations if the messages array actually contains new updates 
    // compared to our current global state value
    const isLocalDifferent = JSON.stringify(messages) !== JSON.stringify(dailyGoals.mentalChat);

    if (isLocalDifferent && (messages.length > 1 || messages[0]?.id !== 1)) {
      saveMentalChat(messages);
    }
  }, [messages, saveMentalChat, dailyGoals.mentalChat, isStreaming]);

  // Scroll to bottom when displayed messages change
  useEffect(() => {
    scrollToBottom();
  }, [displayedMessages, isTyping]);

  // Control playback based on breathingActive state
  useEffect(() => {
    if (!ambientPlayerRef.current) return;
    if (breathingActive) {
      ambientPlayerRef.current.play().catch(e => console.warn('Audio playback blocked:', e));
    } else {
      ambientPlayerRef.current.pause();
    }
  }, [breathingActive]);

  // Control track change mid-session
  useEffect(() => {
    if (!ambientPlayerRef.current) return;
    if (breathingActive) {
      ambientPlayerRef.current.load();
      ambientPlayerRef.current.play().catch(e => console.warn('Audio playback blocked on track change:', e));
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
  const playNextInQueue = async () => {
    if (audioQueueRef.current.length === 0) {
      isPlayingRef.current = false;
      setAiSpeaking(false);
      try {
        if (isVoiceModeActiveRef.current && recognitionRef.current) {
          recognitionRef.current.start();
        }
      } catch (e) {
        console.warn("Auto-mic blocked, waiting for tap", e);
      }
      return;
    }

    isPlayingRef.current = true;
    setAiSpeaking(true);
    const nextUrl = audioQueueRef.current.shift();

    const currentPlayer = activePlayerRef.current === 'A' ? playerA.current : playerB.current;

    if (!currentPlayer.src.includes(nextUrl)) {
      currentPlayer.src = nextUrl;
    }

    currentPlayer.onended = () => {
      activePlayerRef.current = activePlayerRef.current === 'A' ? 'B' : 'A';
      playNextInQueue();
    };

    if (audioQueueRef.current.length > 0) {
      const otherPlayer = activePlayerRef.current === 'A' ? playerB.current : playerA.current;
      otherPlayer.src = audioQueueRef.current[0];
      otherPlayer.load();
    }

    try {
      await currentPlayer.play();
    } catch (e) {
      if (e.name === 'AbortError') {
        // Silently catch AbortError
      } else {
        console.warn("Neural audio streaming playback failure:", e);
        activePlayerRef.current = activePlayerRef.current === 'A' ? 'B' : 'A';
        playNextInQueue();
      }
    }
  };

  const enqueueAudio = (textToSpeak) => {
    if (!textToSpeak || !textToSpeak.trim()) return;
    let sanitizedText = textToSpeak.replace(/[*#_\[\]`]/g, '').replace(/\.\s/g, '... ');
    if (sanitizedText.endsWith('.')) {
      sanitizedText = sanitizedText.slice(0, -1) + '...';
    }
    const encodedText = encodeURIComponent(sanitizedText);
    const streamUrl = `${BACKEND_URL}/api/tts?text=${encodedText}&gender=${voiceGender}&t=${Date.now()}`;

    audioQueueRef.current.push(streamUrl);
    if (!isPlayingRef.current) {
      playNextInQueue();
    } else if (audioQueueRef.current.length === 1) {
      const otherPlayer = activePlayerRef.current === 'A' ? playerB.current : playerA.current;
      otherPlayer.src = streamUrl;
      otherPlayer.load();
    }
  };

  const speakResponse = (textToSpeak) => {
    audioQueueRef.current = [];
    try { playerA.current.pause(); playerA.current.src = ""; } catch (e) {}
    try { playerB.current.pause(); playerB.current.src = ""; } catch (e) {}
    isPlayingRef.current = false;
    enqueueAudio(textToSpeak);
  };

  const startListeningGracefully = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (e) {
        setMicListening(false);
      }
    }
  };

  const handleCircleTap = () => {
    if (aiSpeaking) {
      // Barge-in
      audioQueueRef.current = [];
      try { playerA.current.pause(); playerA.current.src = ""; } catch (e) {}
      try { playerB.current.pause(); playerB.current.src = ""; } catch (e) {}
      setAiSpeaking(false);
      isPlayingRef.current = false;
      startListeningGracefully();
    } else if (!micListening && !aiSpeaking && !aiProcessing) {
      // Manual trigger
      startListeningGracefully();
    }
  };

  const toggleVoiceMode = () => {
    const nextState = !isVoiceModeActive;
    setIsVoiceModeActive(nextState);
    if (nextState) {
      playerA.current.src = "data:audio/mp3;base64,/";
      playerA.current.play().catch(() => {});
      playerB.current.src = "data:audio/mp3;base64,/";
      playerB.current.play().catch(() => {});

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!recognitionRef.current && SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;

        recognitionRef.current.onstart = () => setMicListening(true);
        recognitionRef.current.onend = () => setMicListening(false);

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
      audioQueueRef.current = [];
      try { playerA.current.pause(); playerA.current.src = ""; } catch (e) {}
      try { playerB.current.pause(); playerB.current.src = ""; } catch (e) {}
      isPlayingRef.current = false;
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
      audioQueueRef.current = [];
      try { playerA.current.pause(); playerA.current.src = ""; } catch (e) {}
      try { playerB.current.pause(); playerB.current.src = ""; } catch (e) {}
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
    setIsStreaming(true);
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

      const msgId = Date.now() + 1;
      setMessages((prev) => [
        ...prev,
        { id: msgId, role: 'model', parts: [{ text: '' }] }
      ]);

      if (isVoiceModeActive) {
        audioQueueRef.current = [];
        try { playerA.current.pause(); playerA.current.src = ""; } catch (e) {}
        try { playerB.current.pause(); playerB.current.src = ""; } catch (e) {}
        isPlayingRef.current = false;
      }

      const result = await chatSession.sendMessageStream(userText);

      let fullResponse = "";
      let sentenceBuffer = "";

      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        fullResponse += chunkText;
        sentenceBuffer += chunkText;

        setMessages((prev) => prev.map(msg =>
          msg.id === msgId ? { ...msg, parts: [{ text: fullResponse }] } : msg
        ));

        if (isVoiceModeActive) {
          if (sentenceBuffer.length >= 130) {
            const lastBoundary = Math.max(
              sentenceBuffer.lastIndexOf('. '),
              sentenceBuffer.lastIndexOf('! '),
              sentenceBuffer.lastIndexOf('? '),
              sentenceBuffer.lastIndexOf('\n')
            );
            
            if (lastBoundary !== -1) {
              const splitIndex = lastBoundary + 1;
              const readyText = sentenceBuffer.slice(0, splitIndex).trim();
              if (readyText) enqueueAudio(readyText);
              sentenceBuffer = sentenceBuffer.slice(splitIndex).trim();
            }
          }
        }
      }

      if (isVoiceModeActive && sentenceBuffer.trim()) {
        enqueueAudio(sentenceBuffer.trim());
      }

      setMentalComplete(true);

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
      setIsStreaming(false);
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
        {/* Nivi AI Companion Interface */}
        <section className="bg-surface rounded-[1.5rem] p-8 shadow-natural flex flex-col min-h-[600px] lg:h-[650px] relative">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-border">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-alert flex items-center justify-center text-primary font-medium text-lg shadow-inner">
                N
              </div>
              <div>
                <h2 className="text-xl font-medium text-text-primary">Nivi</h2>
                <p className="text-sm text-text-secondary">AI Companion</p>
              </div>
            </div>

            <div className="flex items-center flex-wrap gap-2 w-full sm:w-auto sm:justify-end">
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
              {displayedMessages.map((msg) => (
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

          <form onSubmit={handleSendMessage} className="flex flex-wrap sm:flex-nowrap gap-3 items-center w-full mt-auto pt-4">
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
              className="flex-1 min-w-[150px] px-6 py-4 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-text-primary transition-all text-sm disabled:opacity-50 disabled:bg-background"
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
        <section className="bg-surface rounded-[1.5rem] p-8 md:p-12 shadow-natural flex flex-col justify-between min-h-[600px] lg:h-[650px] relative overflow-hidden">
          <div className="z-10 relative">
            <h2 className="text-2xl font-light text-text-primary mb-2">Breathwork</h2>
            <p className="text-text-secondary text-[15px] font-light mb-8">Synchronize your breath to the expanding circle to trigger a parasympathetic response.</p>

            {/* Ambient Sound Selector Tabs */}
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-text-secondary font-medium flex items-center gap-1.5 mb-3">
                <Music className="w-3.5 h-3.5" /> Ambient Soundscape
              </label>
              <div className="flex flex-wrap gap-2 bg-background p-1.5 rounded-xl w-full sm:w-fit">
                {audioTracks.map((track) => (
                  <button
                    key={track.id}
                    onClick={() => setSelectedTrack(track.id)}
                    className={`px-3 py-2 sm:px-5 sm:py-2.5 text-xs sm:text-sm rounded-lg transition-all ${selectedTrack === track.id
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
        ref={ambientPlayerRef}
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
            className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-neutral-950/85 backdrop-blur-xl"
          >
            {/* Header placeholder */}
            <div className="w-full p-8 flex justify-center">
              <span className="text-white/40 text-xs font-light tracking-[0.2em] uppercase">Nivi Quantum Interface</span>
            </div>

            {/* Quantum Aura Orb */}
            <div className="flex-1 flex flex-col items-center justify-center relative w-full">
              
              <motion.button
                onClick={handleCircleTap}
                className="relative group outline-none flex items-center justify-center cursor-pointer"
                style={{ width: '320px', height: '320px' }}
                animate={{
                  scale: aiSpeaking ? [1, 1.15, 1] : micListening ? [1, 1.08, 1] : aiProcessing ? 0.9 : [1, 1.02, 1]
                }}
                transition={{
                  duration: aiSpeaking ? 0.6 : micListening ? 0.4 : aiProcessing ? 2 : 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                {/* Layer 3: Atmospheric Glow Ring */}
                <motion.div 
                  className="absolute inset-0 rounded-full pointer-events-none"
                  animate={{
                    scale: aiSpeaking ? [1, 1.4, 1] : micListening ? [1, 1.15, 1] : aiProcessing ? [0.8, 0.9, 0.8] : [1, 1.05, 1],
                    opacity: aiSpeaking ? 0.5 : micListening ? 0.4 : aiProcessing ? 0.2 : 0.15,
                    background: aiSpeaking ? 'radial-gradient(circle, rgba(167,243,208,0.5) 0%, rgba(74,107,93,0) 70%)' 
                      : micListening ? 'radial-gradient(circle, rgba(94,234,212,0.4) 0%, rgba(20,184,166,0) 70%)'
                      : aiProcessing ? 'radial-gradient(circle, rgba(209,213,219,0.3) 0%, rgba(156,163,175,0) 70%)'
                      : 'radial-gradient(circle, rgba(74,107,93,0.3) 0%, rgba(0,0,0,0) 70%)'
                  }}
                  transition={{
                    duration: aiSpeaking ? 1 : micListening ? 2 : aiProcessing ? 3 : 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />

                {/* Layer 2: Fluid Energy Mesh Base */}
                <motion.div
                  animate={{
                    rotate: aiProcessing ? 360 : 0,
                    borderRadius: [
                      "42% 58% 70% 30% / 45% 45% 55% 55%",
                      "55% 45% 30% 70% / 60% 30% 70% 40%",
                      "70% 30% 50% 50% / 30% 70% 50% 50%",
                      "45% 55% 40% 60% / 55% 45% 60% 40%",
                      "42% 58% 70% 30% / 45% 45% 55% 55%"
                    ],
                  }}
                  transition={{
                    rotate: { duration: aiProcessing ? 2 : 10, repeat: Infinity, ease: "linear" },
                    borderRadius: { duration: 8, repeat: Infinity, ease: "linear" }
                  }}
                  className={`absolute inset-8 mix-blend-screen blur-xl opacity-80 transition-colors duration-700 ${
                    aiSpeaking ? 'bg-gradient-to-tr from-emerald-400 via-teal-300 to-cyan-400'
                    : micListening ? 'bg-gradient-to-br from-teal-400 to-emerald-200'
                    : aiProcessing ? 'bg-gradient-to-t from-gray-300 via-slate-400 to-gray-500'
                    : 'bg-gradient-to-tr from-[#4A6B5D] to-gray-400'
                  }`}
                />

                {/* Layer 2: Fluid Energy Mesh Highlight */}
                <motion.div
                  animate={{
                    rotate: aiProcessing ? -360 : 0,
                    borderRadius: [
                      "50% 50% 50% 50% / 50% 50% 50% 50%",
                      "60% 40% 60% 40% / 40% 60% 40% 60%",
                      "50% 50% 50% 50% / 50% 50% 50% 50%"
                    ]
                  }}
                  transition={{
                    rotate: { duration: aiProcessing ? 3 : 12, repeat: Infinity, ease: "linear" },
                    borderRadius: { duration: 5, repeat: Infinity, ease: "easeInOut" }
                  }}
                  className={`absolute inset-12 mix-blend-plus-lighter blur-xl opacity-60 transition-colors duration-700 ${
                    aiSpeaking ? 'bg-gradient-to-bl from-teal-300 to-emerald-500'
                    : micListening ? 'bg-gradient-to-tl from-emerald-300 to-teal-400'
                    : aiProcessing ? 'bg-gradient-to-b from-slate-200 to-gray-400'
                    : 'bg-gradient-to-bl from-[#4A6B5D]/50 to-white/30'
                  }`}
                />

                {/* Layer 1: Core Dot */}
                <div className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center backdrop-blur-md shadow-[inset_0_0_20px_rgba(255,255,255,0.2)] border border-white/20 transition-colors duration-500 ${
                    aiSpeaking ? 'bg-white/20' : micListening ? 'bg-white/10' : aiProcessing ? 'bg-white/5' : 'bg-[#4A6B5D]/30'
                }`}>
                   {aiSpeaking ? <Volume2 className="w-8 h-8 text-white" /> : micListening ? <Mic className="w-8 h-8 text-white" /> : aiProcessing ? <MoreHorizontal className="w-8 h-8 text-white/80 animate-pulse" /> : <div className="w-4 h-4 bg-white/60 rounded-full" />}
                </div>

              </motion.button>

              {/* Status Text Below Orb */}
              <div className="mt-12 flex flex-col items-center">
                <span className={`text-[11px] font-medium tracking-[0.3em] uppercase ${aiSpeaking ? 'text-white' : micListening ? 'text-emerald-400' : 'text-white/50'}`}>
                  {aiSpeaking ? "Tap to Interrupt" : aiProcessing ? "Computing" : micListening ? "Listening..." : "Tap Orb to Speak"}
                </span>
              </div>
            </div>

            {/* Overlay Control Deck */}
            <div className="w-full pb-12 pt-6 flex flex-col items-center gap-10">
              {/* Floating Pill Voice Selector */}
              <div className="flex items-center bg-white/5 border border-white/10 rounded-full p-1.5 backdrop-blur-md shadow-2xl relative">
                {/* Active Slider Background */}
                <motion.div
                  className="absolute top-1.5 bottom-1.5 w-[80px] bg-white rounded-full shadow-sm"
                  initial={false}
                  animate={{ x: voiceGender === 'female' ? 0 : 80 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
                
                <button
                  onClick={() => setVoiceGender('female')}
                  className={`relative z-10 w-[80px] py-2 rounded-full text-xs font-semibold tracking-wide transition-colors duration-200 ${voiceGender === 'female' ? 'text-black' : 'text-white/60 hover:text-white'}`}
                >
                  Female
                </button>
                <button
                  onClick={() => setVoiceGender('male')}
                  className={`relative z-10 w-[80px] py-2 rounded-full text-xs font-semibold tracking-wide transition-colors duration-200 ${voiceGender === 'male' ? 'text-black' : 'text-white/60 hover:text-white'}`}
                >
                  Male
                </button>
              </div>

              {/* Minimalist Exit Button */}
              <button
                onClick={toggleVoiceMode}
                className="w-14 h-14 rounded-full bg-white/5 border border-white/10 text-white/50 hover:bg-white/10 hover:text-white flex items-center justify-center transition-all backdrop-blur-md hover:scale-105"
                title="Exit Voice Mode"
              >
                <X className="w-6 h-6 stroke-[1.5]" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default MentalHealth;