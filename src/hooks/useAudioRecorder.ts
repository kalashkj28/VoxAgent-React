import { useState, useRef, useCallback, useEffect } from 'react';

interface UseAudioRecorderOptions {
  silenceThreshold?: number;
  silenceDurationMs?: number;
  onSilenceTimeout?: () => void;
  onAudioRecorded?: (audioBuffer: ArrayBuffer) => void;
}

export function useAudioRecorder({
  silenceThreshold = 15,
  silenceDurationMs = 2500,
  onSilenceTimeout,
  onAudioRecorded,
}: UseAudioRecorderOptions = {}) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [micError, setMicError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const silenceTimerRef = useRef<number | null>(null);
  const silentSinceRef = useRef<number | null>(null);

  // Clean up Web Audio and tracks
  const cleanupAudio = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setAudioLevel(0);
    silentSinceRef.current = null;
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    cleanupAudio();
  }, [cleanupAudio]);

  const startRecording = useCallback(async () => {
    try {
      setMicError(null);
      cleanupAudio();

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;

      // Setup Web Audio Analyser for live visualizer and silence detection
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      // Setup MediaRecorder
      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/webm';
      }
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = '';
      }

      const recorder = new MediaRecorder(stream, {
        ...(mimeType ? { mimeType } : {}),
        audioBitsPerSecond: 128000,
      });

      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        if (audioBlob.size > 1000) {
          const buffer = await audioBlob.arrayBuffer();
          onAudioRecorded?.(buffer);
        }
      };

      recorder.start(100); // 100ms chunks
      setIsRecording(true);

      // Volume monitoring & silence loop
      const checkAudio = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        setAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));

        // Silence detection
        if (avg < silenceThreshold) {
          if (!silentSinceRef.current) {
            silentSinceRef.current = Date.now();
          } else if (Date.now() - silentSinceRef.current > silenceDurationMs) {
            onSilenceTimeout?.();
            return;
          }
        } else {
          silentSinceRef.current = null;
        }

        animFrameRef.current = requestAnimationFrame(checkAudio);
      };

      // Slight delay before checking silence to avoid immediate cutoff
      setTimeout(() => {
        if (recorder.state === 'recording') {
          animFrameRef.current = requestAnimationFrame(checkAudio);
        }
      }, 500);

    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Microphone access denied';
      setMicError(errorMsg);
      setIsRecording(false);
      cleanupAudio();
    }
  }, [cleanupAudio, onAudioRecorded, onSilenceTimeout, silenceDurationMs, silenceThreshold]);

  useEffect(() => {
    return () => {
      cleanupAudio();
    };
  }, [cleanupAudio]);

  return {
    isRecording,
    audioLevel,
    micError,
    startRecording,
    stopRecording,
  };
}
