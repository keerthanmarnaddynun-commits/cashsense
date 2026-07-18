import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../types';
import { Bot, User, Send, AlertTriangle, MessageSquareCode } from 'lucide-react';

interface GemmaCopilotProps {
  messages: ChatMessage[];
  onSubmitMessage: (msg: string) => Promise<void>;
  isLoading: boolean;
  inputValue: string;
  onInputChange: (val: string) => void;
  errorMsg?: string | null;
}

export const GemmaCopilot: React.FC<GemmaCopilotProps> = ({
  messages,
  onSubmitMessage,
  isLoading,
  inputValue,
  onInputChange,
  errorMsg,
}) => {
  const [charCount, setCharCount] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCharCount(inputValue.length);
  }, [inputValue]);

  // Scroll to bottom on new messages or loading state change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading, errorMsg]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    onSubmitMessage(inputValue.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Structured AI Response parser
  const formatAIResponse = (text: string) => {
    const lower = text.toLowerCase();
    
    // Check if the response contains structured headers
    const hasHeaders = 
      lower.includes('primary risk') || 
      lower.includes('recommended actions') || 
      lower.includes('safer alternative');

    if (hasHeaders) {
      // Split text based on these specific section headers
      const sections = text.split(/(Primary risk:|Recommended actions:|Safer alternative:)/i);
      let currentHeader = '';

      return (
        <div className="space-y-3.5">
          {sections.map((part, index) => {
            const trimmed = part.trim();
            if (!trimmed) return null;

            const lowerPart = trimmed.toLowerCase();
            if (lowerPart === 'primary risk:') {
              currentHeader = 'primary';
              return null;
            } else if (lowerPart === 'recommended actions:') {
              currentHeader = 'actions';
              return null;
            } else if (lowerPart === 'safer alternative:') {
              currentHeader = 'alternative';
              return null;
            }

            if (currentHeader === 'primary') {
              return (
                <div key={index} className="p-3 bg-rose-500/[0.03] border border-rose-500/10 rounded-xl">
                  <span className="text-[9px] uppercase font-extrabold text-rose-400 block tracking-wider mb-1 flex items-center gap-1">
                    ⚠️ Primary Risk
                  </span>
                  <p className="text-gray-300 font-medium text-xs leading-normal">{trimmed}</p>
                </div>
              );
            } else if (currentHeader === 'actions') {
              return (
                <div key={index} className="p-3 bg-indigo-500/[0.03] border border-indigo-500/10 rounded-xl">
                  <span className="text-[9px] uppercase font-extrabold text-indigo-400 block tracking-wider mb-1 flex items-center gap-1">
                    ⚡ Recommended Actions
                  </span>
                  <p className="text-gray-300 font-medium text-xs leading-normal">{trimmed}</p>
                </div>
              );
            } else if (currentHeader === 'alternative') {
              return (
                <div key={index} className="p-3 bg-emerald-500/[0.03] border border-emerald-500/10 rounded-xl">
                  <span className="text-[9px] uppercase font-extrabold text-emerald-400 block tracking-wider mb-1 flex items-center gap-1">
                    🌱 Safer Alternative
                  </span>
                  <p className="text-gray-300 font-medium text-xs leading-normal">{trimmed}</p>
                </div>
              );
            }

            return <p key={index} className="text-gray-300 leading-normal text-xs">{trimmed}</p>;
          })}
        </div>
      );
    }

    return <p className="whitespace-pre-wrap text-gray-300 leading-normal text-xs">{text}</p>;
  };

  return (
    <div className="glow-sidebar bg-charcoal-dark h-full flex flex-col justify-between sticky top-[84px] h-[calc(100vh-84px)] overflow-hidden">
      
      {/* Sidebar Header */}
      <div className="p-4 border-b border-charcoal-border flex items-center gap-2.5 shrink-0 bg-charcoal-dark/50">
        <Bot className="h-5 w-5 text-indigo-400 animate-pulse" />
        <div>
          <h2 className="text-xs font-bold text-white m-0 tracking-wide uppercase">Gemma Copilot</h2>
          <p className="text-[10px] text-gray-500">Liquidity advisor powered by Gemma AI</p>
        </div>
      </div>

      {/* Message History */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
            <div className="p-3.5 bg-indigo-500/5 rounded-2xl border border-indigo-500/10 text-indigo-400">
              <MessageSquareCode className="h-8 w-8" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-300">Gemma Assistant Ready</p>
              <p className="text-[10px] text-gray-500 mt-1 max-w-[220px] mx-auto leading-normal">
                Click "Analyze with Gemma" on any invoice or request shortfall analysis above.
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div 
                key={msg.id}
                className={`flex gap-2.5 max-w-[88%] ${
                  isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
                }`}
              >
                {/* Avatar */}
                <div className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                  isUser 
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10' 
                    : 'bg-charcoal-card border border-charcoal-border text-indigo-400'
                }`}>
                  {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>

                {/* Text Bubble */}
                <div className="space-y-1">
                  <div className={`rounded-2xl px-4 py-3 text-xs ${
                    isUser 
                      ? 'bg-indigo-600 text-white rounded-tr-none' 
                      : 'bg-charcoal-card text-gray-200 border border-charcoal-border rounded-tl-none'
                  }`}>
                    {isUser ? <p className="whitespace-pre-wrap">{msg.text}</p> : formatAIResponse(msg.text)}
                  </div>
                  {/* Timestamp */}
                  <span className={`text-[9px] text-gray-600 font-semibold block ${isUser ? 'text-right mr-1' : 'ml-1'}`}>
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            );
          })
        )}

        {/* Animated Typing Indicator */}
        {isLoading && (
          <div className="flex gap-2.5 max-w-[85%] mr-auto items-start animate-fade-in">
            <div className="h-7 w-7 rounded-lg bg-charcoal-card border border-charcoal-border text-indigo-400 flex items-center justify-center shrink-0">
              <Bot className="h-4 w-4" />
            </div>
            <div className="bg-charcoal-card text-gray-400 border border-charcoal-border rounded-2xl rounded-tl-none px-4 py-3.5 text-xs flex items-center gap-2">
              <div className="flex items-center gap-1 shrink-0">
                <div className="dot-flashing"></div>
                <div className="dot-flashing"></div>
                <div className="dot-flashing"></div>
              </div>
              <span className="text-[11px] text-indigo-300 font-medium">Gemma is writing...</span>
            </div>
          </div>
        )}

        {/* HTTP 500/API Error Banner */}
        {errorMsg && (
          <div className="bg-rose-950/20 border border-rose-500/30 rounded-xl p-4 flex gap-3 items-start">
            <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-extrabold text-rose-400">
                AI service temporarily unavailable
              </h4>
              <p className="text-[10px] text-rose-300/80 leading-normal">
                {errorMsg}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Sticky Input area with glassmorphism */}
      <form 
        onSubmit={handleSubmit} 
        className="p-4 border-t border-charcoal-border bg-charcoal-dark/95 backdrop-blur-md shrink-0"
      >
        <div className="relative">
          <textarea
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Gemma about liquidity adjustments, templates, or risks..."
            rows={3}
            maxLength={1000}
            className="w-full bg-charcoal-card border border-charcoal-border focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl py-2.5 px-3 text-xs text-white placeholder-gray-500 outline-none resize-none transition-all duration-200"
          />
          <div className="absolute right-2.5 bottom-3 text-[9px] text-gray-600 font-bold">
            {charCount}/1000
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !inputValue.trim()}
          className="mt-3 w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-800/80 disabled:text-gray-500 disabled:cursor-not-allowed text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-lg shadow-indigo-600/10 cursor-pointer"
        >
          <Send className="h-3.5 w-3.5" />
          <span>Ask Gemma</span>
        </button>
      </form>
    </div>
  );
};
