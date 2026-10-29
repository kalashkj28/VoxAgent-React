import React, { useState } from 'react';
import type { ConnectionState } from '../types/voxagent';
import { Settings, Radio, Mic, Volume2, Sparkles, Server, Cloud } from 'lucide-react';

interface HeaderProps {
  connectionState: ConnectionState;
  backendUrl: string;
  onUpdateBackendUrl: (url: string) => void;
  onReconnect: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  connectionState,
  backendUrl,
  onUpdateBackendUrl,
  onReconnect,
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [tempUrl, setTempUrl] = useState(backendUrl);

  const getStatusBadge = () => {
    switch (connectionState) {
      case 'connected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Connected
          </span>
        );
      case 'recording':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-600 border border-red-200">
            <Mic className="w-3.5 h-3.5 animate-pulse" />
            Listening...
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-200">
            <Sparkles className="w-3.5 h-3.5 animate-spin" />
            Thinking...
          </span>
        );
      case 'speaking':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-200">
            <Volume2 className="w-3.5 h-3.5 animate-bounce" />
            Speaking...
          </span>
        );
      case 'connecting':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-50 text-yellow-600 border border-yellow-200">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            Connecting...
          </span>
        );
      case 'disconnected':
      default:
        return (
          <button
            onClick={onReconnect}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 transition-colors cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            Disconnected (Click to retry)
          </button>
        );
    }
  };

  const handleSaveUrl = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateBackendUrl(tempUrl);
    setShowSettings(false);
  };

  const selectPreset = (url: string) => {
    setTempUrl(url);
    onUpdateBackendUrl(url);
    setShowSettings(false);
  };

  return (
    <header className="flex items-center justify-between pb-4 mb-4 border-b border-black/5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
          <Mic className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
              VoxAgent
            </h1>
            <span className="text-[10px] uppercase tracking-widest font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 border border-blue-100">
              React + TS
            </span>
          </div>
          <p className="text-xs text-gray-500 font-medium">Real-Time Voice AI Agent</p>
        </div>
      </div>

      <div className="flex items-center gap-2 relative">
        {getStatusBadge()}

        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-black/5 transition-colors cursor-pointer"
          title="Backend settings"
        >
          <Settings className="w-4 h-4" />
        </button>

        {showSettings && (
          <div className="absolute right-0 top-12 z-50 w-84 p-4 rounded-3xl glass-panel shadow-2xl border border-white/80 animate-in fade-in slide-in-from-top-2">
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Backend Connection
            </h4>
            <p className="text-[11px] text-gray-500 mb-3">
              Connect to your local machine or deployed cloud instance.
            </p>

            {/* Quick Presets */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              <button
                type="button"
                onClick={() => selectPreset('')}
                className="py-1.5 px-2.5 rounded-xl text-[11px] font-semibold glass-card hover:bg-blue-50/70 hover:text-blue-600 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Server className="w-3.5 h-3.5 text-blue-500" />
                <span>Localhost (8000)</span>
              </button>
              <button
                type="button"
                onClick={() => selectPreset('https://voxagent-react.onrender.com')}
                className="py-1.5 px-2.5 rounded-xl text-[11px] font-semibold glass-card hover:bg-purple-50/70 hover:text-purple-600 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Cloud className="w-3.5 h-3.5 text-purple-500" />
                <span>Render Cloud</span>
              </button>
            </div>

            <form onSubmit={handleSaveUrl} className="space-y-3">
              <div>
                <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">
                  Custom Server URL
                </label>
                <input
                  type="text"
                  placeholder="https://voxagent-react.onrender.com"
                  value={tempUrl}
                  onChange={(e) => setTempUrl(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 bg-white/70 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowSettings(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-500 hover:bg-gray-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm cursor-pointer"
                >
                  Save & Connect
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </header>
  );
};
