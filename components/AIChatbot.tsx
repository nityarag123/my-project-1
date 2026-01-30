
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
      text: `Welcome to InfraPulse 360, ${user.fullName}. I am your integrated AI command assistant. I can analyze site logistics, track unit metrics, and provide real-time infrastructure intelligence. How shall we proceed?`,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [mode, setMode] = useState<'standard' | 'fast' | 'think' | 'search' | 'maps'>('standard');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isLoading, isOpen]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      // Create a new GoogleGenAI instance right before making an API call
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      let modelName = 'gemini-3-pro-preview';
      let config: any = {};
      let toolConfig: any = undefined;

      // Mode configuration with correct model naming as per guidelines
      if (mode === 'fast') {
        modelName = 'gemini-flash-lite-latest';
      } else if (mode === 'think') {
        modelName = 'gemini-3-pro-preview';
        config.thinkingConfig = { thinkingBudget: 32768 };
      } else if (mode === 'search') {
        modelName = 'gemini-3-flash-preview';
        config.tools = [{ googleSearch: {} }];
      } else if (mode === 'maps') {
        modelName = 'gemini-flash-latest';
        config.tools = [{ googleMaps: {} }];
        
        // Try to get geolocation for better maps results
        const position = await new Promise<GeolocationPosition | null>((resolve) => {
          navigator.geolocation.getCurrentPosition(resolve, () => resolve(null), { timeout: 3000 });
        });
        
        if (position) {
          toolConfig = {
            retrievalConfig: {
              latLng: {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
              }
            }
          };
        }
      }

      const response = await ai.models.generateContent({
        model: modelName,
        contents: currentInput,
        config: {
          ...config,
          toolConfig,
          systemInstruction: `You are the core intelligence of InfraPulse 360, a high-end engineering and logistics management ecosystem. 
          The current user is ${user.fullName}, role: ${user.role}. 
          Always maintain a professional, analytical, and efficient tone. Provide data-driven insights and technical support.`
        }
      });

      const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
        title: chunk.web?.title || chunk.maps?.title || 'System Grounding',
        uri: chunk.web?.uri || chunk.maps?.uri || '#'
      })) || [];

      const modelMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response.text || "System alert: Processing encountered a null response.",
        timestamp: new Date(),
        sources: sources.length > 0 ? sources : undefined,
        isThinking: mode === 'think'
      };

      setMessages(prev => [...prev, modelMessage]);
    } catch (error) {
      console.error('AI Interaction Error:', error);
      setMessages(prev => [...prev, {
        id: 'error-' + Date.now(),
        role: 'model',
        text: "Neural bridge failure. Please verify system credentials and connectivity.",
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTranscription = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        alert("Audio bridge not supported in this terminal.");
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsRecording(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => prev + ' ' + transcript);
      };
      recognition.onerror = () => setIsRecording(false);
      recognition.onend = () => setIsRecording(false);

      recognition.start();
      recognitionRef.current = recognition;
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="w-[90vw] md:w-[420px] h-[650px] glass rounded-[2.5rem] shadow-2xl border border-white/10 flex flex-col overflow-hidden mb-4 animate-in slide-in-from-bottom-8 duration-300">
          {/* Header */}
          <div className="p-5 border-b border-white/10 bg-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-600/20 flex items-center justify-center text-blue-400 border border-blue-500/20">
                <ICONS.AI size={24} />
              </div>
              <div>
                <h4 className="font-bold text-slate-100 uppercase tracking-tighter">InfraPulse AI</h4>
                <div className="flex gap-2 mt-1">
                  <span className="text-[9px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-md border border-blue-500/20 uppercase font-black tracking-widest">Core Active</span>
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white p-2 transition-colors">
              <ICONS.Close size={22} />
            </button>
          </div>

          {/* Context/Mode Switcher */}
          <div className="px-4 py-2 flex gap-2 overflow-x-auto no-scrollbar border-b border-white/5 bg-white/[0.01]">
            {[
              { id: 'standard', label: 'Pro', icon: <ICONS.Chat size={12} /> },
              { id: 'think', label: 'Deep Logic', icon: <ICONS.Think size={12} /> },
              { id: 'fast', label: 'Lite', icon: <ICONS.Fast size={12} /> },
              { id: 'search', label: 'Web', icon: <ICONS.Search size={12} /> },
              { id: 'maps', label: 'Geo', icon: <ICONS.Location size={12} /> },
            ].map((m) => (
              <button 
                key={m.id}
                onClick={() => setMode(m.id as any)} 
                className={`whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border ${
                  mode === m.id 
                  ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20' 
                  : 'bg-white/5 border-white/5 text-slate-500 hover:text-slate-300'
                }`}
              >
                {m.icon} {m.label}
              </button>
            ))}
          </div>

          {/* Chat Stream */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6 no-scrollbar bg-[radial-gradient(circle_at_bottom,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
                <div className={`max-w-[85%] p-4 rounded-[1.8rem] shadow-xl ${
                  msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-none' 
                  : 'bg-slate-800/80 border border-white/10 text-slate-200 rounded-tl-none'
                }`}>
                  {msg.isThinking && (
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/10 text-[9px] font-black uppercase tracking-[0.2em] text-purple-400">
                      <ICONS.Think size={12} className="animate-pulse" /> Recursive Reasoning Module
                    </div>
                  )}
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  
                  {msg.sources && (
                    <div className="mt-4 pt-3 border-t border-white/5 space-y-2">
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Validated Grounding</p>
                      <div className="flex flex-wrap gap-2">
                        {msg.sources.map((s, i) => (
                          <a key={i} href={s.uri} target="_blank" rel="noopener noreferrer" className="text-[10px] bg-white/5 hover:bg-white/10 px-2.5 py-1.5 rounded-lg text-blue-400 underline decoration-blue-500/30 underline-offset-4 truncate max-w-[180px] transition-colors">
                            {s.title}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  <span className="text-[9px] opacity-30 mt-3 block text-right font-medium">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-800/80 border border-white/10 p-5 rounded-[1.8rem] rounded-tl-none">
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

          {/* Footer Input */}
          <div className="p-5 border-t border-white/10 bg-slate-900/80 backdrop-blur-md">
            <form onSubmit={handleSend} className="flex items-center gap-2 bg-white/5 border border-white/10 p-2 rounded-[1.5rem] focus-within:border-blue-500/50 transition-all">
              <button 
                type="button" 
                onClick={toggleTranscription}
                className={`p-3 rounded-xl transition-all ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                title="Voice Input"
              >
                <ICONS.Mic size={20} />
              </button>
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isRecording ? "Capturing audio..." : "Command your ecosystem..."}
                className="flex-1 bg-transparent border-none focus:outline-none text-sm text-slate-100 py-2 placeholder-slate-600"
                disabled={isLoading}
              />
              <button 
                type="submit" 
                disabled={!input.trim() || isLoading}
                className="w-11 h-11 rounded-xl bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center disabled:opacity-20 disabled:cursor-not-allowed transition-all shadow-xl shadow-blue-600/20 active:scale-95"
              >
                <ICONS.AI size={20} />
              </button>
            </form>
            <p className="text-[8px] text-center text-slate-600 mt-3 font-bold uppercase tracking-widest">Integrated Gemini Intelligence</p>
          </div>
        </div>
      )}

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 rounded-[2rem] bg-gradient-to-br from-blue-600 to-blue-500 text-white flex items-center justify-center shadow-2xl shadow-blue-600/40 hover:scale-110 active:scale-90 transition-all group relative border border-white/20"
      >
        {isOpen ? <ICONS.Close size={28} /> : <ICONS.AI size={28} className="group-hover:rotate-12 transition-transform" />}
        {!isOpen && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 border-4 border-slate-900 rounded-full animate-pulse" />
        )}
      </button>
    </div>
  );
};

export default AIChatbot;
