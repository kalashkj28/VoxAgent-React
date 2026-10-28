import React, { useRef, useEffect } from 'react';
import type { ChatMessage } from '../types/voxagent';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { Bot } from 'lucide-react';

interface ChatPanelProps {
  messages: ChatMessage[];
  isTyping: boolean;
  isStreaming: boolean;
  onSendMessage: (text: string) => void;
  onInterrupt: () => void;
  disabled?: boolean;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  messages,
  isTyping,
  isStreaming,
  onSendMessage,
  onInterrupt,
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

  return (
    <div className="flex flex-col h-full min-h-0 glass-panel rounded-3xl overflow-hidden shadow-lg border border-white/60">
      {/* Scrollable messages container */}
      <div
        ref={scrollRef}
        className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 custom-scrollbar space-y-1"
      >
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
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
