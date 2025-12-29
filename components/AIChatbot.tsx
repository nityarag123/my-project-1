
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
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
      text: `Hello ${user.fullName}, I'm your KVR Infra AI assistant. How can I help you manage your sites and trucks today?`,
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
    scrollToBottom();
  }, [messages, isLoading]);

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
    setInput('');
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      let modelName = 'gemini-3-pro-preview';
      let config: any = {};

      // Selection logic based on user's mode preference
      if (mode === 'fast') {
        modelName = 'gemini-2.5-flash-lite';
      } else if (mode === 'think') {
        modelName = 'gemini-3-pro-preview';
        config.thinkingConfig = { thinkingBudget: 32768 };
      } else if (mode === 'search') {
        modelName = 'gemini-3-flash-preview';
        config.tools = [{ googleSearch: {} }];
      } else if (mode === 'maps') {
        modelName = 'gemini-2.5-flash';
        config.tools = [{ googleMaps: {} }];
      }

      const response = await ai.models.generateContent({
        model: modelName,
        contents: input,
        config: {
          ...config,
          systemInstruction: `You are a professional assistant for KVR Infra Engineering Works. 
          The user is ${user.fullName}, role: ${user.role}. 
          Provide technical, concise, and helpful information about infrastructure, truck management, and logistics.`
        }
      });

      const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
        title: chunk.web?.title || chunk.maps?.title || 'Source',
        uri: chunk.web?.uri || chunk.maps?.uri || '#'
      })) || [];

      const modelMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response.text || "I'm sorry, I couldn't process that request.",
        timestamp: new Date(),
        sources: sources.length > 0 ? sources : undefined,
        isThinking: mode === 'think'
      };

      setMessages(prev => [...prev, modelMessage]);
    } catch (error) {
      console.error('AI Error:', error);
      setMessages(prev => [...prev, {
        id: 'error',
        role: 'model',
        text: "Error communicating with Gemini. Please check your connection.",
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
        alert("Speech Recognition not supported in this browser.");
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
        <div className="w-[90vw] md:w-[400px] h-[600px] glass rounded-[2.5rem] shadow-2xl border border-white/10 flex flex-col overflow-hidden mb-4 animate-in slide-in-from-bottom-8 duration-300">
          {/* Header */}
          <div className="p-5 border-b border-white/10 bg-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-600/20 flex items-center justify-center text-blue-400">
                <ICONS.AI size={24} />
              </div>
              <div>
                <h4 className="font-bold text-slate-200">KVR Infra AI</h4>
                <div className="flex gap-2 mt-1">
                  <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/20 uppercase font-black tracking-tighter">Gemini 3 Pro</span>
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white p-2">
              <ICONS.Close size={20} />
            </button>
          </div>

          {/* Mode Selector */}
          <div className="px-5 py-2 flex gap-2 overflow-x-auto no-scrollbar border-b border-white/5 bg-white/[0.02]">
            <button 
              onClick={() => setMode('standard')} 
              className={`whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${mode === 'standard' ? 'bg-blue-600 text-white' : 'bg-white/5 text-slate-500'}`}
            >
              Standard
            </button>
            <button 
              onClick={() => setMode('think')} 
              className={`whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${mode === 'think' ? 'bg-purple-600 text-white' : 'bg-white/5 text-slate-500'}`}
            >
              <ICONS.Think size={12} /> Deep Think
            </button>
            <button 
              onClick={() => setMode('fast')} 
              className={`whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${mode === 'fast' ? 'bg-emerald-600 text-white' : 'bg-white/5 text-slate-500'}`}
            >
              <ICONS.Fast size={12} /> Fast
            </button>
            <button 
              onClick={() => setMode('search')} 
              className={`whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${mode === 'search' ? 'bg-orange-600 text-white' : 'bg-white/5 text-slate-500'}`}
            >
              <ICONS.Search size={12} /> Search
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 no-scrollbar">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-3xl ${
                  msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-none' 
                  : 'bg-white/5 border border-white/10 text-slate-200 rounded-tl-none'
                }`}>
                  {msg.isThinking && (
                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/10 text-[10px] font-bold uppercase tracking-widest text-purple-400">
                      <ICONS.Think size={12} /> Deep Reasoning Output
                    </div>
                  )}
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  
                  {msg.sources && (
                    <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Sources:</p>
                      <div className="flex flex-wrap gap-2">
                        {msg.sources.map((s, i) => (
                          <a key={i} href={s.uri} target="_blank" rel="noopener noreferrer" className="text-[10px] bg-white/5 hover:bg-white/10 px-2 py-1 rounded-lg text-blue-400 underline truncate max-w-[150px]">
                            {s.title}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  <span className="text-[9px] opacity-40 mt-2 block text-right">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white/5 border border-white/10 p-4 rounded-3xl rounded-tl-none">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input */}
          <form onSubmit={handleSend} className="p-5 border-t border-white/10 bg-white/5">
            <div className="flex items-center gap-2 bg-slate-900/50 border border-white/10 p-2 rounded-2xl">
              <button 
                type="button" 
                onClick={toggleTranscription}
                className={`p-2 rounded-xl transition-all ${isRecording ? 'bg-red-500 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
              >
                {isRecording ? <ICONS.Mic size={20} className="animate-pulse" /> : <ICONS.Mic size={20} />}
              </button>
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isRecording ? "Listening..." : "Ask Gemini anything..."}
                className="flex-1 bg-transparent border-none focus:outline-none text-sm text-slate-200 py-2"
                disabled={isLoading}
              />
              <button 
                type="submit" 
                disabled={!input.trim() || isLoading}
                className="w-10 h-10 rounded-xl bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center disabled:opacity-30 transition-all shadow-lg shadow-blue-500/20"
              >
                <ICONS.AI size={18} />
              </button>
            </div>
          </form>
        </div>
      )}

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 rounded-[2rem] bg-gradient-to-br from-blue-600 to-blue-500 text-white flex items-center justify-center shadow-2xl shadow-blue-500/40 hover:scale-110 active:scale-95 transition-all group relative"
      >
        {isOpen ? <ICONS.Close size={28} /> : <ICONS.AI size={28} className="group-hover:rotate-12 transition-transform" />}
        {!isOpen && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-slate-900 rounded-full animate-pulse" />
        )}
      </button>
    </div>
  );
};

export default AIChatbot;
