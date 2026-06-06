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

  // Seamless track swap effect if changed mid-session
  useEffect(() => {
    if (breathingActive && audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      const currentTrackObj = audioTracks.find(t => t.id === selectedTrack);
      audioPlayerRef.current = new Audio(currentTrackObj.url);
      audioPlayerRef.current.loop = true;
      audioPlayerRef.current.play().catch(e => console.log('Audio playback prevented:', e));
    }
  }, [selectedTrack]);

  // Cleanup media element streams immediately on unmount to prevent leaked channels
  useEffect(() => {
    return () => {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current = null;
      }
    };
  }, []);

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

  // Harmonious, steady 8s circle animation (4s expansion / 4s retraction)
  const getBreathAnimation = () => {
    if (!breathingActive) return { scale: 1, opacity: 0.5 };
    return {
      scale: [1, 1.4, 1],
      opacity: [0.5, 1, 0.5],
      transition: {
        duration: 8,
        ease: "easeInOut",
        repeat: Infinity
      }
    };
  };

  const toggleBreathing = () => {
    const nextState = !breathingActive;
    setBreathingActive(nextState);

    if (nextState) {
      const trackObj = audioTracks.find(t => t.id === selectedTrack);
      audioPlayerRef.current = new Audio(trackObj.url);
      audioPlayerRef.current.loop = true;
      audioPlayerRef.current.play().catch(e => console.warn('Audio playback initialization blocked:', e));
      setMentalComplete(true);
    } else {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
    }
  };

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
                    <motion.div
                      className="w-1.5 h-1.5 bg-primary/60 rounded-full"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                    />
                    <motion.div
                      className="w-1.5 h-1.5 bg-primary/60 rounded-full"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                    />
                    <motion.div
                      className="w-1.5 h-1.5 bg-primary/60 rounded-full"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                    />
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

            {/* Ambient Sound Selector Tabs with Exact File Names */}
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

          {/* Central Animated Target Interface */}
          <div className="flex-1 flex items-center justify-center relative z-0 mt-4">
            <motion.div
              className="w-48 h-48 rounded-full bg-primary/10 flex items-center justify-center"
              animate={getBreathAnimation()}
            >
              <div className="w-36 h-36 rounded-full bg-primary/20 flex items-center justify-center">
                <div className="w-24 h-24 rounded-full bg-primary/40 shadow-inner" />
              </div>
            </motion.div>
          </div>

          <div className="z-10 relative flex justify-center mt-6">
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
    </motion.div>
  );
};

export default MentalHealth;