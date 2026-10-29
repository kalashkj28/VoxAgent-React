import React, { useState } from 'react';
import type { ChatMessage } from '../types/voxagent';
import { Bot, User, Info, Copy, Check, Volume2 } from 'lucide-react';

interface MessageBubbleProps {
  message: ChatMessage;
  onReplay?: (message: ChatMessage) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, onReplay }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore
    }
  };

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
  const timeFormatted = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className={`group flex gap-2.5 sm:gap-3 mb-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex-shrink-0 flex items-center justify-center text-white shadow-sm mt-0.5">
          <Bot className="w-4 h-4" />
        </div>
      )}

      <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[80%]`}>
        <div
          className={`relative rounded-2xl px-4 py-2.5 text-xs sm:text-[13px] leading-relaxed transition-all shadow-sm ${
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

        {/* Message Meta & Action Bar */}
        <div
          className={`flex items-center gap-2 mt-1 px-1 text-[10px] text-gray-400 opacity-70 group-hover:opacity-100 transition-opacity ${
            isUser ? 'flex-row-reverse' : 'flex-row'
          }`}
        >
          <span>{timeFormatted}</span>

          <button
            onClick={handleCopy}
            title={copied ? 'Copied!' : 'Copy text'}
            className="hover:text-gray-600 transition-colors p-0.5 rounded cursor-pointer"
          >
            {copied ? (
              <span className="inline-flex items-center gap-0.5 text-emerald-600 font-medium">
                <Check className="w-3 h-3" />
                <span>Copied</span>
              </span>
            ) : (
              <Copy className="w-3 h-3" />
            )}
          </button>

          {!isUser && onReplay && message.text && (
            <button
              onClick={() => onReplay(message)}
              title="Replay voice response"
              className="hover:text-blue-600 transition-colors p-0.5 rounded cursor-pointer flex items-center gap-0.5"
            >
              <Volume2 className="w-3 h-3 text-blue-500" />
              <span>Replay</span>
            </button>
          )}
        </div>
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-600 flex-shrink-0 flex items-center justify-center text-white shadow-sm mt-0.5">
          <User className="w-4 h-4" />
        </div>
      )}
    </div>
  );
};
