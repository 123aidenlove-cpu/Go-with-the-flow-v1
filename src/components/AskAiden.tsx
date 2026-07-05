import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, Sparkles } from 'lucide-react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { SmartImage } from './ui/SmartImage';
import { APP_ASSETS } from '../config/assets';
import { generateAidenResponse } from '../utils/aidenBrain';

interface Message {
  role: 'user' | 'aiden';
  text: string;
}

interface AskAidenProps {
  onBack: () => void;
}

export const AskAiden: React.FC<AskAidenProps> = ({ onBack }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'aiden',
      text: "Hi! I am Aiden, your personal Clarinet guide. Having trouble with a note, squeaking, breathing, or your instrument? Ask me anything!",
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to the bottom of the chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userText = inputValue.trim();
    
    // Add user message
    setMessages((prev) => [...prev, { role: 'user', text: userText }]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI thinking delay (1.5 seconds)
    setTimeout(() => {
      const response = generateAidenResponse(userText);
      setMessages((prev) => [...prev, { role: 'aiden', text: response }]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="w-full h-screen bg-slate-900 text-slate-100 flex flex-col justify-between select-none" id="ask-aiden-container">
      {/* Top Header */}
      <header className="p-4 bg-slate-800 border-b border-slate-700 flex items-center justify-between z-10 shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          aria-label="Back to Map"
          className="text-slate-200 border-slate-700 hover:bg-slate-700 hover:text-white"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to Map
        </Button>

        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-blue-600/20 border border-blue-500/30 flex items-center justify-center p-1">
            <SmartImage src={APP_ASSETS.ui.avatarOwl} alt="Aiden the Owl" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-base font-display font-black leading-tight text-white flex items-center gap-1.5">
              Ask Aiden
              <Sparkles size={14} className="text-yellow-400 animate-pulse" />
            </h1>
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span>
              Online Tutor
            </span>
          </div>
        </div>

        {/* Empty placeholder to keep balance */}
        <div className="w-[100px] hidden md:block"></div>
      </header>

      {/* Chat History Area */}
      <main className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-950 flex flex-col">
        {messages.map((msg, idx) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={idx}
              className={`flex items-start gap-3 max-w-[80%] ${
                isUser ? 'self-end flex-row-reverse' : 'self-start'
              }`}
            >
              {/* Avatar on Left (for Aiden) */}
              {!isUser && (
                <div className="w-8 h-8 rounded-full overflow-hidden bg-blue-500/20 border border-blue-500/30 p-0.5 shrink-0">
                  <SmartImage src={APP_ASSETS.ui.avatarOwl} alt="Aiden" className="w-full h-full" />
                </div>
              )}

              {/* Chat Bubble */}
              <div
                className={`p-4 rounded-2xl text-sm leading-relaxed font-sans shadow-md ${
                  isUser
                    ? 'bg-blue-600 text-white rounded-tr-none font-medium'
                    : 'bg-slate-800 text-slate-100 rounded-tl-none border border-slate-700/60'
                }`}
              >
                {msg.text}
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-start gap-3 self-start max-w-[80%] animate-pulse">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-blue-500/20 border border-blue-500/30 p-0.5 shrink-0">
              <SmartImage src={APP_ASSETS.ui.avatarOwl} alt="Aiden" className="w-full h-full" />
            </div>
            <div className="bg-slate-800 text-slate-400 border border-slate-700/60 p-4 rounded-2xl rounded-tl-none text-xs flex items-center gap-2">
              <span className="font-semibold">Aiden is thinking</span>
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce delay-100"></span>
                <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce delay-200"></span>
                <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce delay-300"></span>
              </div>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </main>

      {/* Input Message Area */}
      <footer className="p-4 bg-slate-800 border-t border-slate-700 flex gap-3 shrink-0">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Ask me anything: 'My clarinet is squeaking!', 'How to play Middle E?'..."
          className="flex-1 bg-slate-900 border border-slate-700 rounded-full px-5 py-3 text-slate-100 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-slate-500 font-sans"
        />
        <Button
          variant="primary"
          size="sm"
          onClick={handleSend}
          aria-label="Send Message"
          className="h-11 w-11 p-0 rounded-full shrink-0 flex items-center justify-center bg-blue-600 border-b-2 border-blue-800 hover:bg-blue-500"
        >
          <Send size={16} />
        </Button>
      </footer>
    </div>
  );
};
