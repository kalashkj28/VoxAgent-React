import React, { useRef, useEffect } from 'react';
import type { ChatMessage } from '../types/voxagent';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { Bot, RotateCcw, Download, Sparkles } from 'lucide-react';

const SUGGESTIONS = [
  { icon: '🌤️', label: 'Mumbai Weather', query: "What's the current weather in Mumbai?" },
  { icon: '📅', label: 'Book 3 PM Slot', query: 'Book an appointment for tomorrow at 3 PM for AI project review' },
  { icon: '🤖', label: 'Tech Stack', query: 'Tell me about your architecture and tech stack' },
  { icon: '🔍', label: 'AI News Search', query: 'Search the latest news about AI voice agents in 2026' },
  { icon: '🎓', label: 'Creator Profile', query: 'Who created you and what is his background?' },
];

interface ChatPanelProps {
  messages: ChatMessage[];
  isTyping: boolean;
  isStreaming: boolean;
  onSendMessage: (text: string) => void;
  onInterrupt: () => void;
  onReplayAudio?: (message: ChatMessage) => void;
  onClearChat?: () => void;
  onExportChat?: () => void;
  disabled?: boolean;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  messages,
  isTyping,
  isStreaming,
  onSendMessage,
  onInterrupt,
  onReplayAudio,
  onClearChat,
  onExportChat,
  disabled = false,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new messages or typing changes
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'auto' });
    } else if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping, isStreaming]);

  const nonSystemCount = messages.filter((m) => m.role !== 'system').length;

  return (
    <div className="flex flex-col h-full min-h-0 glass-panel rounded-3xl overflow-hidden shadow-lg border border-white/60">
      {/* Chat Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-200/50 bg-white/40 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-gray-700 tracking-wide">Live Conversation</span>
          <span className="text-[10px] font-semibold text-gray-400 bg-gray-100/70 px-1.5 py-0.5 rounded-full">
            {nonSystemCount} {nonSystemCount === 1 ? 'msg' : 'msgs'}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {onExportChat && nonSystemCount > 0 && (
            <button
              onClick={onExportChat}
              title="Export chat transcript (.md)"
              className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50/70 rounded-xl transition-all cursor-pointer flex items-center gap-1 text-[11px] font-medium"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export</span>
            </button>
          )}

          {onClearChat && nonSystemCount > 0 && (
            <button
              onClick={onClearChat}
              title="Reset conversation"
              className="p-1.5 text-gray-500 hover:text-rose-600 hover:bg-rose-50/70 rounded-xl transition-all cursor-pointer flex items-center gap-1 text-[11px] font-medium"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Chat</span>
            </button>
          )}
        </div>
      </div>

      {/* Scrollable messages container */}
      <div
        ref={scrollRef}
        className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 custom-scrollbar space-y-1"
      >
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} onReplay={onReplayAudio} />
        ))}

        {isTyping && (
          <div className="flex gap-3 mb-3 justify-start animate-fade-in">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex-shrink-0 flex items-center justify-center text-white shadow-sm mt-0.5">
              <Bot className="w-4 h-4" />
            </div>
            <div className="glass-card px-4 py-3 rounded-2xl rounded-bl-sm border border-white/60 bg-white/70 flex items-center gap-2 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-violet-500 animate-bounce [animation-delay:0.4s]" />
              <span className="text-[11px] text-gray-400 font-medium ml-1">VoxAgent is thinking...</span>
            </div>
          </div>
        )}

        {/* Dummy div to scroll to */}
        <div ref={messagesEndRef} className="h-1" />
      </div>

      {/* Interactive Suggestion Chips (Prompt Starters) */}
      <div className="px-3 pt-2 pb-1 border-t border-gray-100/60 bg-white/30 flex-shrink-0 overflow-x-auto custom-scrollbar flex items-center gap-1.5">
        <span className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-1 mr-1 flex-shrink-0">
          <Sparkles className="w-3 h-3 text-amber-500" />
          <span>Try:</span>
        </span>
        {SUGGESTIONS.map((item, idx) => (
          <button
            key={idx}
            onClick={() => onSendMessage(item.query)}
            disabled={disabled || isTyping || isStreaming}
            className="flex-shrink-0 inline-flex items-center gap-1 py-1 px-2.5 rounded-full text-[11px] font-medium bg-white/80 border border-gray-200/80 text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs"
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      {/* Input bar pinned at bottom */}
      <div className="flex-shrink-0">
        <ChatInput
          onSendMessage={onSendMessage}
          onInterrupt={onInterrupt}
          disabled={disabled}
          isBusy={isTyping || isStreaming}
        />
      </div>
    </div>
  );
};
