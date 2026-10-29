import React from 'react';
import { Mic, Square, Repeat, Volume2, VolumeX, Gauge } from 'lucide-react';
import { Visualizer } from './Visualizer';

interface ControlsProps {
  isRecording: boolean;
  audioLevel: number;
  autoMode: boolean;
  ttsEnabled: boolean;
  playbackSpeed?: number;
  onToggleRecording: () => void;
  onToggleAutoMode: () => void;
  onToggleTTS: () => void;
  onCycleSpeed?: () => void;
  micError: string | null;
}

export const Controls: React.FC<ControlsProps> = ({
  isRecording,
  audioLevel,
  autoMode,
  ttsEnabled,
  playbackSpeed = 1,
  onToggleRecording,
  onToggleAutoMode,
  onToggleTTS,
  onCycleSpeed,
  micError,
}) => {
  return (
    <div className="glass-panel p-5 rounded-3xl flex flex-col items-center">
      <div className="w-full flex items-center justify-between mb-3">
        <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">
          Voice Controls
        </span>
        {isRecording && (
          <span className="text-[10px] font-semibold text-rose-500 flex items-center gap-1 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            Live Mic
          </span>
        )}
      </div>

      {/* Main Mic Button */}
      <div className="relative my-2">
        {isRecording && (
          <div className="absolute inset-0 rounded-full bg-red-400/20 mic-recording-pulse pointer-events-none scale-125" />
        )}
        <button
          onClick={onToggleRecording}
          className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg cursor-pointer ${
            isRecording
              ? 'bg-rose-500 text-white shadow-rose-500/30 scale-105'
              : 'glass-card border-2 border-blue-500/30 text-blue-600 hover:border-blue-500 hover:bg-blue-50/50 shadow-blue-500/10 hover:scale-105'
          }`}
          title={isRecording ? 'Click to stop recording (or press Space)' : 'Click to start talking (or press Space)'}
        >
          {isRecording ? (
            <Square className="w-6 h-6 fill-current animate-pulse" />
          ) : (
            <Mic className="w-7 h-7" />
          )}
        </button>
      </div>

      {/* Real-time Visualizer */}
      <div className="w-full my-2">
        <Visualizer isRecording={isRecording} audioLevel={audioLevel} />
      </div>

      <p className="text-[11px] text-gray-400 text-center mb-4">
        {isRecording ? 'Listening... click to stop' : 'Click mic to speak'}
      </p>

      {micError && (
        <div className="w-full p-2 mb-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-[11px] text-center">
          {micError}
        </div>
      )}

      {/* Mode Toggles */}
      <div className="w-full grid grid-cols-3 gap-1.5">
        {/* Auto Mode */}
        <button
          onClick={onToggleAutoMode}
          title="Hands-free continuous conversation loop"
          className={`py-2 px-1.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer ${
            autoMode
              ? 'bg-emerald-50 text-emerald-600 border border-emerald-300 shadow-sm'
              : 'glass-card text-gray-600 hover:bg-gray-100/50'
          }`}
        >
          <Repeat className={`w-3.5 h-3.5 ${autoMode ? 'animate-spin' : ''}`} />
          <span>Auto</span>
        </button>

        {/* TTS Toggle */}
        <button
          onClick={onToggleTTS}
          title="Toggle audio response"
          className={`py-2 px-1.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer ${
            ttsEnabled
              ? 'bg-emerald-50 text-emerald-600 border border-emerald-300 shadow-sm'
              : 'glass-card text-gray-400 hover:bg-gray-100/50'
          }`}
        >
          {ttsEnabled ? (
            <>
              <Volume2 className="w-3.5 h-3.5" />
              <span>Voice</span>
            </>
          ) : (
            <>
              <VolumeX className="w-3.5 h-3.5" />
              <span>Muted</span>
            </>
          )}
        </button>

        {/* Speed Toggle */}
        <button
          onClick={onCycleSpeed}
          title="Cycle speech playback speed (1x, 1.25x, 1.5x)"
          className="glass-card py-2 px-1.5 rounded-xl text-xs font-semibold text-gray-700 hover:bg-blue-50/70 hover:text-blue-600 transition-all cursor-pointer flex items-center justify-center gap-1"
        >
          <Gauge className="w-3.5 h-3.5 text-blue-500" />
          <span>{playbackSpeed}x</span>
        </button>
      </div>

      <div className="w-full grid grid-cols-3 text-[9px] text-gray-400 mt-2 px-1 text-center">
        <span>Hands-free</span>
        <span>Audio</span>
        <span>Speed</span>
      </div>
    </div>
  );
};
