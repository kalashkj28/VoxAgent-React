import React, { useState } from 'react';
import { Send } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, disabled = false }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || disabled) return;
    onSendMessage(text);
    setText('');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-3 border-t border-white/40 bg-white/40 backdrop-blur-md flex items-center gap-2"
    >
      <input
        type="text"
        placeholder="Type a message or click mic..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={disabled}
        className="flex-1 bg-white/70 border border-black/5 rounded-xl px-4 py-2.5 text-xs sm:text-[13px] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-inner"
      />
      <button
        type="submit"
        disabled={!text.trim() || disabled}
        className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium text-xs flex items-center gap-1.5 transition-all shadow-md shadow-blue-500/20 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 cursor-pointer"
      >
        <span>Send</span>
        <Send className="w-3.5 h-3.5" />
      </button>
    </form>
  );
};
