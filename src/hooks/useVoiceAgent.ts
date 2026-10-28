import { useState, useRef, useEffect, useCallback } from 'react';
import type {
  ChatMessage,
  ConnectionState,
  LatencyMetrics,
  WSIncomingEvent,
} from '../types/voxagent';
import { useAudioRecorder } from './useAudioRecorder';
import { kbApi } from '../services/kbApi';

interface UseVoiceAgentProps {
  initialBackendUrl?: string;
}

export function useVoiceAgent({ initialBackendUrl }: UseVoiceAgentProps = {}) {
  const [backendUrl, setBackendUrlState] = useState<string>(() => {
    if (initialBackendUrl !== undefined) return initialBackendUrl;
    try {
      const stored = localStorage.getItem('voxagent_backend_url');
      if (stored !== null) return stored;
    } catch {
      // Ignore
    }
    return import.meta.env.VITE_VOXAGENT_BACKEND_URL || '';
  });

  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [autoMode, setAutoMode] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'system',
      text: 'Click mic or start typing to talk with VoxAgent',
      timestamp: Date.now(),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [metrics, setMetrics] = useState<LatencyMetrics>({
    stt_ms: null,
    llm_ms: null,
    tts_ms: null,
    total_ms: null,
  });

  const voiceWsRef = useRef<WebSocket | null>(null);
  const chatWsRef = useRef<WebSocket | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const autoModeRef = useRef(autoMode);
  const ttsEnabledRef = useRef(ttsEnabled);
  const reconnectTimerRef = useRef<number | null>(null);
  const streamingIntervalRef = useRef<number | null>(null);

  autoModeRef.current = autoMode;
  ttsEnabledRef.current = ttsEnabled;

  const setBackendUrl = useCallback((url: string) => {
    setBackendUrlState(url);
    kbApi.setBaseUrl(url);
    try {
      localStorage.setItem('voxagent_backend_url', url);
    } catch {
      // Ignore
    }
  }, []);

  // Derive WebSocket base URL
  const getWsBaseUrl = useCallback(() => {
    if (backendUrl) {
      const clean = backendUrl.replace(/^http/, 'ws');
      return clean.replace(/\/$/, '');
    }
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${window.location.host}`;
  }, [backendUrl]);

  // Interruption / Barge-in
  const interrupt = useCallback(() => {
    if (streamingIntervalRef.current) {
      clearInterval(streamingIntervalRef.current);
      streamingIntervalRef.current = null;
    }
    setIsTyping(false);
    setIsStreaming(false);

    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      currentAudioRef.current = null;
    }
    if (voiceWsRef.current?.readyState === WebSocket.OPEN) {
      voiceWsRef.current.send(JSON.stringify({ type: 'cancel' }));
    }
  }, []);

  // Audio Playback
  const playAudio = useCallback((blob: Blob) => {
    if (!ttsEnabledRef.current) {
      if (autoModeRef.current) {
        setTimeout(() => {
          recorderRef.current.startRecording();
        }, 100);
      }
      return;
    }

    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }

    const audioUrl = URL.createObjectURL(blob);
    const audio = new Audio(audioUrl);
    currentAudioRef.current = audio;

    setConnectionState('speaking');

    audio.onended = () => {
      URL.revokeObjectURL(audioUrl);
      currentAudioRef.current = null;
      setConnectionState('connected');

      if (autoModeRef.current) {
        setTimeout(() => {
          recorderRef.current.startRecording();
        }, 150);
      }
    };

    audio.onerror = () => {
      URL.revokeObjectURL(audioUrl);
      currentAudioRef.current = null;
      setConnectionState('connected');
    };

    audio.play().catch(() => {
      setConnectionState('connected');
    });
  }, []);

  // Add message helper
  const addMessage = useCallback((text: string, role: ChatMessage['role']) => {
    const newMessage: ChatMessage = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      role,
      text,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, newMessage]);
    return newMessage.id;
  }, []);

  // Streaming typewriter effect for bot responses
  const streamBotMessage = useCallback((fullText: string) => {
    if (streamingIntervalRef.current) {
      clearInterval(streamingIntervalRef.current);
      streamingIntervalRef.current = null;
    }

    setIsTyping(false);
    setIsStreaming(true);
    const messageId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    setMessages((prev) => [
      ...prev,
      {
        id: messageId,
        role: 'assistant',
        text: '',
        timestamp: Date.now(),
        isStreaming: true,
      },
    ]);

    let index = 0;
    const interval = window.setInterval(() => {
      index += 2;
      if (index >= fullText.length) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === messageId ? { ...m, text: fullText, isStreaming: false } : m
          )
        );
        clearInterval(interval);
        streamingIntervalRef.current = null;
        setIsStreaming(false);
      } else {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === messageId ? { ...m, text: fullText.slice(0, index) } : m
          )
        );
      }
    }, 16);
    streamingIntervalRef.current = interval;
  }, []);

  // Handle incoming WebSocket messages
  const handleWsMessage = useCallback((event: MessageEvent) => {
    if (event.data instanceof Blob) {
      playAudio(event.data);
      return;
    }

    try {
      const data: WSIncomingEvent = JSON.parse(event.data);

      switch (data.type) {
        case 'transcript':
          addMessage(data.text, 'user');
          setIsTyping(true);
          setConnectionState('processing');
          break;

        case 'response':
          streamBotMessage(data.text);
          setConnectionState('connected');
          break;

        case 'metrics':
          setMetrics({
            stt_ms: data.stt_ms,
            llm_ms: data.llm_ms,
            tts_ms: data.tts_ms,
            total_ms: data.total_ms,
          });
          break;

        case 'error':
          setIsTyping(false);
          setIsStreaming(false);
          addMessage(data.message, 'system');
          setConnectionState('connected');
          break;

        case 'no_wake_word':
          if (autoModeRef.current) {
            setTimeout(() => {
              recorderRef.current.startRecording();
            }, 100);
          }
          break;
      }
    } catch (err) {
      console.error('Failed to parse WS message:', err);
    }
  }, [addMessage, playAudio, streamBotMessage]);

  // Audio Recorder hook setup
  const onAudioRecorded = useCallback((buffer: ArrayBuffer) => {
    if (voiceWsRef.current?.readyState === WebSocket.OPEN) {
      setConnectionState('processing');
      voiceWsRef.current.send(buffer);
    } else {
      addMessage('Voice socket not connected', 'system');
      setConnectionState('disconnected');
    }
  }, [addMessage]);

  const onSilenceTimeout = useCallback(() => {
    recorderRef.current.stopRecording();
  }, []);

  const recorder = useAudioRecorder({
    onAudioRecorded,
    onSilenceTimeout,
  });

  const recorderRef = useRef(recorder);
  recorderRef.current = recorder;

  // Toggle Recording
  const toggleRecording = useCallback(() => {
    if (recorder.isRecording) {
      recorder.stopRecording();
      setConnectionState('connected');
    } else {
      interrupt();
      recorder.startRecording();
      setConnectionState('recording');
    }
  }, [interrupt, recorder]);

  // Toggle Auto Mode
  const toggleAutoMode = useCallback(() => {
    const next = !autoModeRef.current;
    setAutoMode(next);
    addMessage(`Auto mode ${next ? 'ON' : 'OFF'}`, 'system');

    const msg = JSON.stringify({ type: next ? 'auto_on' : 'auto_off' });
    if (voiceWsRef.current?.readyState === WebSocket.OPEN) {
      voiceWsRef.current.send(msg);
    }

    if (next) {
      recorder.startRecording();
      setConnectionState('recording');
    } else if (recorder.isRecording) {
      recorder.stopRecording();
      setConnectionState('connected');
    }
  }, [addMessage, recorder]);

  // Toggle TTS Voice
  const toggleTTS = useCallback(() => {
    const next = !ttsEnabledRef.current;
    setTtsEnabled(next);
    addMessage(`Voice response ${next ? 'ON' : 'OFF'}`, 'system');

    const signal = next ? 'tts_on' : 'tts_off';
    if (voiceWsRef.current?.readyState === WebSocket.OPEN) {
      voiceWsRef.current.send(signal);
    }
    if (chatWsRef.current?.readyState === WebSocket.OPEN) {
      chatWsRef.current.send(signal);
    }
  }, [addMessage]);

  // Send Text Message
  const sendTextMessage = useCallback((text: string) => {
    if (!text.trim() || isTyping || isStreaming) return;
    interrupt();

    addMessage(text, 'user');
    setIsTyping(true);
    setConnectionState('processing');

    if (chatWsRef.current?.readyState === WebSocket.OPEN) {
      chatWsRef.current.send(text);
    } else {
      setIsTyping(false);
      addMessage('Chat server disconnected. Click retry.', 'system');
      setConnectionState('disconnected');
    }
  }, [addMessage, interrupt, isStreaming, isTyping]);

  // Connect WebSockets
  const connectSockets = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }

    const wsBase = getWsBaseUrl();

    // Close existing
    if (voiceWsRef.current) {
      voiceWsRef.current.onclose = null;
      voiceWsRef.current.close();
    }
    if (chatWsRef.current) {
      chatWsRef.current.onclose = null;
      chatWsRef.current.close();
    }

    setConnectionState('connecting');

    try {
      const voiceWs = new WebSocket(`${wsBase}/ws/voice`);
      const chatWs = new WebSocket(`${wsBase}/ws/chat`);

      voiceWsRef.current = voiceWs;
      chatWsRef.current = chatWs;

      voiceWs.onopen = () => {
        setConnectionState('connected');
      };

      voiceWs.onclose = () => {
        setConnectionState('disconnected');
      };

      voiceWs.onerror = () => {
        setConnectionState('disconnected');
      };

      voiceWs.onmessage = handleWsMessage;
      chatWs.onmessage = handleWsMessage;

      chatWs.onclose = () => {
        setConnectionState('disconnected');
      };
    } catch {
      setConnectionState('disconnected');
    }
  }, [getWsBaseUrl, handleWsMessage]);

  useEffect(() => {
    connectSockets();
    return () => {
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
      if (streamingIntervalRef.current) {
        clearInterval(streamingIntervalRef.current);
      }
      voiceWsRef.current?.close();
      chatWsRef.current?.close();
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }
    };
  }, [connectSockets]);

  return {
    connectionState,
    messages,
    isTyping,
    isStreaming,
    metrics,
    ttsEnabled,
    autoMode,
    isRecording: recorder.isRecording,
    audioLevel: recorder.audioLevel,
    micError: recorder.micError,
    backendUrl,
    setBackendUrl,
    toggleRecording,
    toggleAutoMode,
    toggleTTS,
    sendTextMessage,
    interrupt,
    reconnect: connectSockets,
  };
}
