import React, { useState } from 'react';
import { Send, Square } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  onInterrupt?: () => void;
  disabled?: boolean;
  isBusy?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onInterrupt,
  disabled = false,
  isBusy = false,
}) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || disabled || isBusy) return;
    onSendMessage(text);
    setText('');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-3 border-t border-white/40 bg-white/50 backdrop-blur-md flex items-center gap-2"
    >
      <input
        type="text"
        placeholder={
          disabled
            ? 'Backend disconnected...'
            : isBusy
            ? 'VoxAgent is responding...'
            : 'Type a message or click mic...'
        }
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={disabled || isBusy}
        className="flex-1 bg-white/80 border border-black/5 rounded-xl px-4 py-2.5 text-xs sm:text-[13px] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-inner disabled:opacity-60 disabled:cursor-not-allowed"
      />

      {isBusy && onInterrupt ? (
        <button
          type="button"
          onClick={onInterrupt}
          className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 font-medium text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer active:scale-95"
          title="Stop response"
        >
          <Square className="w-3.5 h-3.5 fill-current" />
          <span>Stop</span>
        </button>
      ) : (
        <button
          type="submit"
          disabled={!text.trim() || disabled || isBusy}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium text-xs flex items-center gap-1.5 transition-all shadow-md shadow-blue-500/20 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 cursor-pointer"
        >
          <span>Send</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      )}
    </form>
  );
};
