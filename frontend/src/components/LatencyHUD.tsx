import React from 'react';
import type { LatencyMetrics } from '../types/voxagent';
import { Zap } from 'lucide-react';

interface LatencyHUDProps {
  metrics: LatencyMetrics;
}

export const LatencyHUD: React.FC<LatencyHUDProps> = ({ metrics }) => {
  const formatMetric = (val: number | null) => (val !== null ? `${val}ms` : '—');

  const getColor = (val: number | null, isTotal = false) => {
    if (val === null) return 'text-gray-400';
    const limit = isTotal ? 4000 : 1500;
    if (val < limit * 0.5) return 'text-emerald-600';
    if (val < limit) return 'text-amber-500';
    return 'text-rose-500';
  };

  return (
    <div className="glass-panel p-4 rounded-3xl">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">
          Latency Metrics
        </span>
        <Zap className="w-3.5 h-3.5 text-amber-500" />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="glass-card p-2.5 rounded-2xl text-center">
          <div className="text-[9px] uppercase font-bold text-gray-400 tracking-wider">STT (Groq)</div>
          <div className={`text-base font-bold mt-0.5 ${getColor(metrics.stt_ms)}`}>
            {formatMetric(metrics.stt_ms)}
          </div>
        </div>

        <div className="glass-card p-2.5 rounded-2xl text-center">
          <div className="text-[9px] uppercase font-bold text-gray-400 tracking-wider">LLM (Gemini)</div>
          <div className={`text-base font-bold mt-0.5 ${getColor(metrics.llm_ms)}`}>
            {formatMetric(metrics.llm_ms)}
          </div>
        </div>

        <div className="glass-card p-2.5 rounded-2xl text-center">
          <div className="text-[9px] uppercase font-bold text-gray-400 tracking-wider">TTS (Edge)</div>
          <div className={`text-base font-bold mt-0.5 ${getColor(metrics.tts_ms)}`}>
            {formatMetric(metrics.tts_ms)}
          </div>
        </div>

        <div className="glass-card p-2.5 rounded-2xl text-center bg-emerald-50/30 border-emerald-200/50">
          <div className="text-[9px] uppercase font-bold text-emerald-600/80 tracking-wider">Total</div>
          <div className={`text-base font-bold mt-0.5 ${getColor(metrics.total_ms, true)}`}>
            {formatMetric(metrics.total_ms)}
          </div>
        </div>
      </div>
    </div>
  );
};
