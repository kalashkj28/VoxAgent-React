import React from 'react';
import type { ChatMessage } from '../types/voxagent';
import { Bot, User, Info } from 'lucide-react';

interface MessageBubbleProps {
  message: ChatMessage;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  if (message.role === 'system') {
    return (
      <div className="flex justify-center my-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium text-gray-400 bg-gray-100/60 border border-gray-200/50">
          <Info className="w-3 h-3 text-gray-400" />
          <span>{message.text}</span>
        </div>
      </div>
    );
  }

  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-3 mb-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex-shrink-0 flex items-center justify-center text-white shadow-sm mt-0.5">
          <Bot className="w-4 h-4" />
        </div>
      )}

      <div
        className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-xs sm:text-[13px] leading-relaxed transition-all shadow-sm ${
          isUser
            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-sm shadow-blue-500/10'
            : 'glass-card text-gray-800 rounded-bl-sm border border-white/60 bg-white/70'
        }`}
      >
        <p className="whitespace-pre-wrap break-words">
          {message.text}
          {message.isStreaming && (
            <span className="inline-block w-1.5 h-3.5 bg-blue-500 ml-1 translate-y-0.5 animate-pulse" />
          )}
        </p>
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-600 flex-shrink-0 flex items-center justify-center text-white shadow-sm mt-0.5">
          <User className="w-4 h-4" />
        </div>
      )}
    </div>
  );
};
