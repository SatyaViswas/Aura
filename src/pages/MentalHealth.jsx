import React, { useState, useRef, useEffect } from 'react';
import useHealthStore from '../store/healthStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Wind, Music } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';

const MentalHealth = () => {
  const setMentalComplete = useHealthStore((state) => state.setMentalComplete);

  // Conversational State and Multi-Turn History (Untouched)
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'model',
      parts: [{ text: "Hello. I'm Nivi. Welcome to this quiet space. How are your mind and body feeling right now?" }]
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

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

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

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


  // Asynchronous Chat Stream Handler (Untouched)
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || isTyping) return;

    const userText = inputText.trim();
    const newUserMsg = { id: Date.now(), role: 'user', parts: [{ text: userText }] };

    setMessages((prev) => [...prev, newUserMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      if (!import.meta.env.VITE_GEMINI_API_KEY) {
        throw new Error("Generative AI Key is missing or undefined.");
      }

      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash-lite',
        systemInstruction: "You are Nivi, a serene, deeply empathetic, and grounded Scandinavian Mind & Body Health Companion built into the Aura platform. Your responses must feel like a calming meditation—clear, gentle, holistic, and completely free of sterile clinical coldness, rigid robotic formats, or excessive corporate exclamation marks. You specialize strictly in mindfulness, somatic grounding exercises, emotional validation, alignment suggestions, stress minimization, and daily balance. If users share physical fatigue, academic stress, or anxiety, reply with highly tailored, practical breathing prompts, journaling entry items, or gentle perspective shifts. Keep responses relatively concise (1-3 paragraphs maximum) to ensure high scannability inside a mobile-responsive chat view block."
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

    } catch (error) {
      console.warn("Nivi Generation Pipeline Exception:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'model',
          parts: [{ text: "I'm currently resting my connection lines. Please take a slow, deep breath, and try again in a moment." }]
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const toggleBreathing = () => {
    const nextState = !breathingActive;
    setBreathingActive(nextState);

    if (nextState) {
      setMentalComplete(true);
    }
  };

  // ── Breathing phase label config ─────────────────────────────────────────
  const phaseConfig = {
    ready: { label: 'Press begin',  sublabel: 'Follow the circle' },
    in:    { label: 'Breathe In',   sublabel: '4 counts'          },
    hold:  { label: 'Hold',         sublabel: '2 counts'          },
    out:   { label: 'Breathe Out',  sublabel: '6 counts'          },
  };
  const phase = phaseConfig[breathPhase];

  // Each ring: [diameter, border-opacity, bg-opacity, rotation-speed (s), rotation-dir, scale-factor]
  const rings = [
    { d: 216, bOp: 0.08, bgOp: 0,    rot: 40,  dir: 1,  sf: 1.00 },
    { d: 180, bOp: 0.12, bgOp: 0,    rot: 28,  dir: -1, sf: 0.97 },
    { d: 144, bOp: 0.18, bgOp: 0.03, rot: 20,  dir: 1,  sf: 0.94 },
    { d: 108, bOp: 0.26, bgOp: 0.06, rot: 14,  dir: -1, sf: 0.90 },
    { d: 72,  bOp: 0.00, bgOp: 0.32, rot: 0,   dir: 1,  sf: 0.85 },
  ];

  const expandedScale = 1.32;
  const scaleTarget  = breathingActive && (breathPhase === 'in' || breathPhase === 'hold') ? expandedScale : 1;
  const scaleDur     = breathPhase === 'in' ? 4 : breathPhase === 'hold' ? 0.5 : 6;

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
        <section className="bg-surface rounded-[1.5rem] p-8 shadow-natural flex flex-col h-[650px]">
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-border">
            <div className="w-12 h-12 rounded-full bg-alert flex items-center justify-center text-primary font-medium text-lg shadow-inner">
              N
            </div>
            <div>
              <h2 className="text-xl font-medium text-text-primary">Nivi</h2>
              <p className="text-sm text-text-secondary">AI Companion</p>
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

          <form onSubmit={handleSendMessage} className="flex gap-4">
            <input
              type="text"
              placeholder="Share what's on your mind..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isTyping}
              className="flex-1 px-6 py-4 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-text-primary transition-all text-sm"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isTyping}
              className="px-6 py-4 bg-primary text-white rounded-xl shadow-[0_10px_30px_-10px_rgba(74,107,93,0.4)] hover:bg-opacity-90 transition-all disabled:opacity-50 flex items-center justify-center"
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
                    className={`px-5 py-2.5 rounded-lg text-sm transition-all ${
                      selectedTrack === track.id
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
    </motion.div>
  );
};

export default MentalHealth;