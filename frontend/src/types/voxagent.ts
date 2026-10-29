export type MessageRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  text: string;
  timestamp: number;
  isStreaming?: boolean;
  audioBlob?: Blob;
}

export interface LatencyMetrics {
  stt_ms: number | null;
  llm_ms: number | null;
  tts_ms: number | null;
  total_ms: number | null;
}

export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'recording' | 'processing' | 'speaking';

export interface WSMetricsPayload {
  type: 'metrics';
  stt_ms: number;
  llm_ms: number;
  tts_ms: number;
  total_ms: number;
}

export interface WSTranscriptPayload {
  type: 'transcript';
  text: string;
  language?: string;
  stt_ms?: number;
}

export interface WSResponsePayload {
  type: 'response';
  text: string;
  llm_ms?: number;
}

export interface WSErrorPayload {
  type: 'error';
  message: string;
}

export interface WSNoWakeWordPayload {
  type: 'no_wake_word';
}

export type WSIncomingEvent =
  | WSMetricsPayload
  | WSTranscriptPayload
  | WSResponsePayload
  | WSErrorPayload
  | WSNoWakeWordPayload;

export interface KBStatusResponse {
  files: string[];
  total_chunks: number;
  is_ready?: boolean;
}
