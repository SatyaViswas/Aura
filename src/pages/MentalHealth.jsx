import React, { useState, useRef, useEffect } from 'react';
import useHealthStore from '../store/healthStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Wind } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';

const MentalHealth = () => {
  const setMentalComplete = useHealthStore((state) => state.setMentalComplete);

  // 3. Conversational State and Multi-Turn History
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

  // Breathing tool states
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathTechnique, setBreathTechnique] = useState('box'); // 'box' or '478'

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // 4. Asynchronous Chat Stream Handler
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || isTyping) return;

    const userText = inputText.trim();
    const newUserMsg = { id: Date.now(), role: 'user', parts: [{ text: userText }] };

    // Instantly append user message and clear input
    setMessages((prev) => [...prev, newUserMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      // 1. Environment Validation
      if (!import.meta.env.VITE_GEMINI_API_KEY) {
        throw new Error("Generative AI Key is missing or undefined.");
      }

      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

      // 2. Absolute Persona Conditioning
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash-lite', // Updated to the latest active model
        systemInstruction: "You are Nivi, a serene, deeply empathetic, and grounded Scandinavian Mind & Body Health Companion built into the Aura platform. Your responses must feel like a calming meditation—clear, gentle, holistic, and completely free of sterile clinical coldness, rigid robotic formats, or excessive corporate exclamation marks. You specialize strictly in mindfulness, somatic grounding exercises, emotional validation, alignment suggestions, stress minimization, and daily balance. If users share physical fatigue, academic stress, or anxiety, reply with highly tailored, practical breathing prompts, journaling entry items, or gentle perspective shifts. Keep responses relatively concise (1-3 paragraphs maximum) to ensure high scannability inside a mobile-responsive chat view block."
      });

      // Map local history to exactly match the required structural schema { role, parts: [{ text }] }
      // Exclude the most recent user message since it's passed into sendMessage directly
      const historyPayload = messages
        .filter((msg) => msg.id !== 1)
        .map((msg) => ({
          role: msg.role,
          parts: [{ text: msg.parts[0].text }]
        }));

      const chatSession = model.startChat({ history: historyPayload });

      // Dispatch explicit string
      const result = await chatSession.sendMessage(userText);
      const responseText = result.response.text();

      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: 'model', parts: [{ text: responseText }] }
      ]);

      // Reward completion
      setMentalComplete(true);

    } catch (error) {
      console.warn("Nivi Generation Pipeline Exception:", error);

      // Fall back gracefully to a friendly error bubble
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

  // Breathing Animation orchestrations (Preserved exactly as requested)
  const getBreathAnimation = () => {
    if (!breathingActive) return { scale: 1, opacity: 0.5 };

    if (breathTechnique === 'box') {
      // 4s inhale, 4s hold, 4s exhale, 4s hold
      return {
        scale: [1, 1.6, 1.6, 1, 1],
        opacity: [0.5, 1, 1, 0.5, 0.5],
        transition: {
          duration: 16,
          ease: "linear",
          times: [0, 0.25, 0.5, 0.75, 1],
          repeat: Infinity
        }
      };
    } else {
      // 4s inhale, 7s hold, 8s exhale (Total 19s)
      return {
        scale: [1, 1.6, 1.6, 1],
        opacity: [0.5, 1, 1, 0.5],
        transition: {
          duration: 19,
          ease: "linear",
          times: [0, 4 / 19, 11 / 19, 1],
          repeat: Infinity
        }
      };
    }
  };

  const toggleBreathing = () => {
    if (!breathingActive) {
      setMentalComplete(true);
    }
    setBreathingActive(!breathingActive);
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
        {/* AI Companion Chat Console */}
        <section className="bg-surface rounded-[1.5rem] p-8 shadow-natural flex flex-col h-[650px]">
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-[#E5E7EB]">
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
                      ? 'bg-background text-text-primary rounded-tr-sm border border-[#E5E7EB]'
                      : 'bg-alert text-primary rounded-tl-sm'
                      }`}
                  >
                    <p className="text-[15px] leading-relaxed font-light whitespace-pre-wrap">{msg.parts[0].text}</p>
                  </div>
                </motion.div>
              ))}

              {/* 5. UI Loading Indicator */}
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
              className="flex-1 px-6 py-4 bg-background border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-text-primary transition-all disabled:opacity-50"
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

        {/* Somatic Coping Graphic Tool (Preserved) */}
        <section className="bg-surface rounded-[1.5rem] p-8 md:p-12 shadow-natural flex flex-col justify-between h-[650px] relative overflow-hidden">
          <div className="z-10 relative">
            <h2 className="text-2xl font-light text-text-primary mb-2">Breathwork</h2>
            <p className="text-text-secondary text-[15px] font-light mb-8">Synchronize your breath to the expanding circle to trigger a parasympathetic response.</p>

            <div className="flex gap-2 bg-background p-1.5 rounded-xl w-fit">
              <button
                onClick={() => { setBreathTechnique('box'); setBreathingActive(false); }}
                className={`px-5 py-2.5 rounded-lg text-sm transition-all ${breathTechnique === 'box' ? 'bg-surface text-primary shadow-sm font-medium' : 'text-text-secondary hover:text-text-primary'}`}
              >
                Box Breathing
              </button>
              <button
                onClick={() => { setBreathTechnique('478'); setBreathingActive(false); }}
                className={`px-5 py-2.5 rounded-lg text-sm transition-all ${breathTechnique === '478' ? 'bg-surface text-primary shadow-sm font-medium' : 'text-text-secondary hover:text-text-primary'}`}
              >
                4-7-8 Relax
              </button>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center relative z-0 mt-8">
            <motion.div
              className="w-48 h-48 rounded-full bg-primary/10 flex items-center justify-center"
              animate={getBreathAnimation()}
            >
              <div className="w-36 h-36 rounded-full bg-primary/20 flex items-center justify-center">
                <div className="w-24 h-24 rounded-full bg-primary/40 shadow-inner" />
              </div>
            </motion.div>
          </div>

          <div className="z-10 relative flex justify-center mt-12">
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
