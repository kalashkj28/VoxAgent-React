import { useEffect } from 'react';
import { useVoiceAgent } from './hooks/useVoiceAgent';
import { Header } from './components/Header';
import { ChatPanel } from './components/ChatPanel';
import { Controls } from './components/Controls';
import { LatencyHUD } from './components/LatencyHUD';
import { KnowledgeBase } from './components/KnowledgeBase';
import { Watermark } from './components/Watermark';

export function App() {
  const {
    connectionState,
    messages,
    isTyping,
    isStreaming,
    metrics,
    ttsEnabled,
    autoMode,
    playbackSpeed,
    isRecording,
    audioLevel,
    micError,
    backendUrl,
    setBackendUrl,
    toggleRecording,
    toggleAutoMode,
    toggleTTS,
    cyclePlaybackSpeed,
    replayMessageAudio,
    clearMessages,
    exportChat,
    sendTextMessage,
    interrupt,
    reconnect,
  } = useVoiceAgent();

  // Global Keyboard Shortcuts (Space for mic, Escape for stop)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input or textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        toggleRecording();
      } else if (e.code === 'Escape') {
        e.preventDefault();
        interrupt();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleRecording, interrupt]);

  return (
    <div className="relative h-screen max-h-screen w-screen overflow-hidden flex flex-col p-2.5 sm:p-4 bg-[#f0f2f5]">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/5 w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/5 w-[450px] h-[450px] bg-indigo-400/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-1/2 right-1/3 w-[350px] h-[350px] bg-pink-400/5 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute -top-12 -left-12 w-72 h-72 rounded-full bg-blue-500/10 blur-[60px] animate-float-1 pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-64 h-64 rounded-full bg-indigo-500/10 blur-[60px] animate-float-2 pointer-events-none" />
        <div className="absolute top-1/2 left-2/3 w-52 h-52 rounded-full bg-purple-500/10 blur-[50px] animate-float-3 pointer-events-none" />
        <div
          className="absolute inset-0 opacity-[0.25]"
          style={{
            backgroundImage: 'radial-gradient(circle, #9ca3af 0.8px, transparent 0.8px)',
            backgroundSize: '24px 24px',
          }}
        />
      </div>

      {/* Main Container */}
      <div className="relative z-10 max-w-6xl w-full mx-auto flex flex-col flex-1 h-full min-h-0 overflow-hidden">
        <div className="flex-shrink-0">
          <Header
            connectionState={connectionState}
            backendUrl={backendUrl}
            onUpdateBackendUrl={setBackendUrl}
            onReconnect={reconnect}
          />
        </div>

        <main className="grid grid-cols-1 lg:grid-cols-[1fr_330px] gap-3.5 flex-1 min-h-0 overflow-hidden pb-1">
          {/* Left Chat Window */}
          <section className="flex flex-col h-full min-h-0 overflow-hidden">
            <ChatPanel
              messages={messages}
              isTyping={isTyping}
              isStreaming={isStreaming}
              onSendMessage={sendTextMessage}
              onInterrupt={interrupt}
              onReplayAudio={replayMessageAudio}
              onClearChat={clearMessages}
              onExportChat={exportChat}
              disabled={connectionState === 'disconnected'}
            />
          </section>

          {/* Right Sidebar */}
          <aside className="flex flex-col h-full min-h-0 overflow-y-auto custom-scrollbar gap-3 pr-1">
            <Controls
              isRecording={isRecording}
              audioLevel={audioLevel}
              autoMode={autoMode}
              ttsEnabled={ttsEnabled}
              playbackSpeed={playbackSpeed}
              onToggleRecording={toggleRecording}
              onToggleAutoMode={toggleAutoMode}
              onToggleTTS={toggleTTS}
              onCycleSpeed={cyclePlaybackSpeed}
              micError={micError}
            />

            <LatencyHUD metrics={metrics} />

            <KnowledgeBase
              onNotify={(msg) => {
                sendTextMessage(`[System: ${msg}]`);
              }}
            />

            <div className="flex-shrink-0 mt-auto">
              <Watermark />
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
}

export default App;
