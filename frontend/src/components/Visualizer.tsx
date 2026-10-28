import React from 'react';

interface VisualizerProps {
  isRecording: boolean;
  audioLevel: number;
}

export const Visualizer: React.FC<VisualizerProps> = ({ isRecording, audioLevel }) => {
  // Generate 16 bars
  const barCount = 18;
  const bars = Array.from({ length: barCount });

  return (
    <div className="flex items-center justify-center gap-1 h-8 px-3">
      {bars.map((_, i) => {
        // Calculate dynamic height based on audio level and index position
        const centerOffset = Math.abs(i - barCount / 2) / (barCount / 2);
        const factor = Math.max(0.1, 1 - centerOffset * 0.7);

        let heightPercent = 15;
        if (isRecording) {
          const wave = Math.sin((i / barCount) * Math.PI) * (audioLevel * 0.9);
          heightPercent = Math.min(100, Math.max(15, wave * factor + Math.random() * 15));
        }

        return (
          <div
            key={i}
            className={`w-1 rounded-full transition-all duration-75 ${
              isRecording
                ? 'bg-gradient-to-t from-red-500 via-rose-400 to-indigo-500'
                : 'bg-gray-200'
            }`}
            style={{
              height: `${heightPercent}%`,
            }}
          />
        );
      })}
    </div>
  );
};
