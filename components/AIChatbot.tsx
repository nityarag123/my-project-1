
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { ICONS } from '../constants';
import { ChatMessage, User } from '../types';

interface AIChatbotProps {
  user: User;
}

const AIChatbot: React.FC<AIChatbotProps> = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: `Tactical Interface Initialized. Hello, ${user.fullName}. I am InfraPulse 360's operational core. I've analyzed our current fleet telemetry—how can I optimize our logistics today?`,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'standard' | 'think' | 'search'>('standard');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fix: Added scrolling to bottom for better UX
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { id: Date.now().toString(), role: 'user', text: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      // Fix: Follow @google/genai guidelines for client initialization and content generation
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      let modelName = 'gemini-3-pro-preview';
      let config: any = {};

      if (mode === 'think') {
        config.thinkingConfig = { thinkingBudget: 16000 };
      } else if (mode === 'search') {
        config.tools = [{ googleSearch: {} }];
      }

      const response = await ai.models.generateContent({
        model: modelName,
        contents: currentInput,
        config: {
          ...config,
          systemInstruction: `You are the InfraPulse 360 Strategic Advisor. 
          You have real-time access to a logistics and engineering database.
          Role: ${user.role} | Security Clearance: Level 5.
          Provide data-driven insights on:
          - Predictive Delay Detection (Traffic/Weather integration).
          - Smart Auto-Assignment logic.
          - Site Productivity analysis.
          - Cost Leakage detection.
          Tone: Professional, Analytical, Decisive.`
        }
      });

      // Fix: Extract search grounding sources as required by Gemini API guidelines
      const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
        title: chunk.web?.title || chunk.web?.uri,
        uri: chunk.web?.uri
      })).filter((s: any) => s.uri);

      const modelMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response.text || "Diagnostic failed. Please repeat query.",
        timestamp: new Date(),
        isThinking: mode === 'think',
        sources: sources
      };

      setMessages(prev => [...prev, modelMessage]);
    } catch (error) {
      setMessages(prev => [...prev, { id: 'err', role: 'model', text: "Neural bridge disrupted.", timestamp: new Date() }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="w-[90vw] md:w-[450px] h-[700px] glass rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] border border-white/10 flex flex-col overflow-hidden mb-6 animate-in slide-in-from-bottom-12 duration-500">
          <div className="p-6 border-b border-white/10 bg-white/5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/20 flex items-center justify-center text-blue-400 border border-blue-500/20">
                <ICONS.AI size={32} />
              </div>
              <div>
                <h4 className="font-black text-slate-100 uppercase tracking-tighter text-lg">Advisor Core</h4>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[8px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-md font-black uppercase tracking-widest border border-blue-500/20">Operational AI</span>
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white p-2 transition-colors">
              <ICONS.Close size={24} />
            </button>
          </div>

          <div className="px-6 py-3 flex gap-2 border-b border-white/5 bg-white/[0.01]">
            {[
              { id: 'standard', label: 'Tactical', icon: <ICONS.Zap size={10} /> },
              { id: 'think', label: 'Deep Logic', icon: <ICONS.Think size={10} /> },
              { id: 'search', label: 'Global Search', icon: <ICONS.Search size={10} /> },
            ].map((m) => (
              <button 
                key={m.id}
                onClick={() => setMode(m.id as any)} 
                className={`whitespace-nowrap flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${
                  mode === m.id ? 'bg-blue-600 border-blue-500 text-white shadow-xl shadow-blue-500/20' : 'bg-white/5 border-white/5 text-slate-500 hover:text-slate-300'
                }`}
              >
                {m.icon} {m.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar bg-[radial-gradient(circle_at_bottom,_rgba(30,58,138,0.15),_transparent)]">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4`}>
                <div className={`max-w-[85%] p-5 rounded-[2rem] shadow-2xl ${
                  msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-slate-800/80 border border-white/10 text-slate-200 rounded-tl-none'
                }`}>
                  {msg.isThinking && (
                    <div className="flex items-center gap-2 mb-4 pb-2 border-b border-white/10 text-[8px] font-black uppercase tracking-[0.3em] text-purple-400">
                      <ICONS.Think size={12} className="animate-pulse" /> Recursive Strategy Analysis
                    </div>
                  )}
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  
                  {/* Fix: Added display of search grounding sources for better transparency */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-white/10">
                      <p className="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-2">Sources</p>
                      <div className="flex flex-wrap gap-2">
                        {msg.sources.map((source, idx) => (
                          <a 
                            key={idx} 
                            href={source.uri} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[9px] bg-white/5 hover:bg-white/10 text-blue-400 px-2 py-1 rounded-lg border border-white/5 transition-all"
                          >
                            {source.title}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <span className="text-[8px] opacity-30 mt-4 block text-right font-bold">{msg.timestamp.toLocaleTimeString()}</span>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-800/80 border border-white/10 p-6 rounded-[2rem] rounded-tl-none">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-6 border-t border-white/10 bg-slate-900/90 backdrop-blur-xl">
            <form onSubmit={handleSend} className="flex items-center gap-3 bg-white/5 border border-white/10 p-2.5 rounded-[1.8rem] focus-within:border-blue-500/50 transition-all">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Query global operations..."
                className="flex-1 bg-transparent border-none focus:outline-none text-sm text-slate-100 px-4 py-2 placeholder-slate-600"
                disabled={isLoading}
              />
              <button 
                type="submit" 
                disabled={!input.trim() || isLoading}
                className="w-12 h-12 rounded-[1.2rem] bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center disabled:opacity-20 transition-all shadow-xl shadow-blue-600/30"
              >
                <ICONS.AI size={24} />
              </button>
            </form>
          </div>
        </div>
      )}

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-20 h-20 rounded-[2.5rem] bg-white text-slate-900 flex items-center justify-center shadow-[0_0_50px_rgba(255,255,255,0.2)] hover:scale-110 active:scale-90 transition-all group border-4 border-slate-900"
      >
        {isOpen ? <ICONS.Close size={32} /> : <ICONS.AI size={32} className="group-hover:rotate-12 transition-transform" />}
      </button>
    </div>
  );
};

export default AIChatbot;
