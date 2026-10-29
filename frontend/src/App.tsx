import { useState, useEffect } from 'react';
import { useVoiceAgent } from './hooks/useVoiceAgent';
import { Header } from './components/Header';
import { ChatPanel } from './components/ChatPanel';
import { Controls } from './components/Controls';
import { LatencyHUD } from './components/LatencyHUD';
import { KnowledgeBase } from './components/KnowledgeBase';
import { Watermark } from './components/Watermark';
import { MessageSquare, Sliders } from 'lucide-react';

export function App() {
  const [mobileTab, setMobileTab] = useState<'chat' | 'tools'>('chat');

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
    <div className="relative h-[100dvh] max-h-[100dvh] w-full overflow-hidden flex flex-col p-2 sm:p-4 bg-[#f0f2f5]">
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
        {/* Sticky Header */}
        <div className="flex-shrink-0 z-20 w-full">
          <Header
            connectionState={connectionState}
            backendUrl={backendUrl}
            onUpdateBackendUrl={setBackendUrl}
            onReconnect={reconnect}
          />
        </div>

        {/* Mobile View Switcher (Tabs for Chat vs Voice & Tools) */}
        <div className="flex lg:hidden items-center gap-1.5 p-1 mb-2 bg-white/60 backdrop-blur-md rounded-2xl border border-white/80 shadow-xs flex-shrink-0">
          <button
            onClick={() => setMobileTab('chat')}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              mobileTab === 'chat'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100/50'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Chat</span>
          </button>
          <button
            onClick={() => setMobileTab('tools')}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              mobileTab === 'tools'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100/50'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Voice & Tools</span>
          </button>
        </div>

        <main className="grid grid-cols-1 lg:grid-cols-[1fr_330px] gap-3.5 flex-1 min-h-0 overflow-hidden pb-1">
          {/* Left Chat Window */}
          <section
            className={`flex-col h-full min-h-0 overflow-hidden ${
              mobileTab === 'chat' ? 'flex' : 'hidden lg:flex'
            }`}
          >
            <ChatPanel
              messages={messages}
              isTyping={isTyping}
              isStreaming={isStreaming}
              onSendMessage={sendTextMessage}
              onInterrupt={interrupt}
              onToggleRecording={toggleRecording}
              isRecording={isRecording}
              onReplayAudio={replayMessageAudio}
              onClearChat={clearMessages}
              onExportChat={exportChat}
              disabled={connectionState === 'disconnected'}
            />
          </section>

          {/* Right Sidebar */}
          <aside
            className={`flex-col h-full min-h-0 overflow-y-auto custom-scrollbar gap-3 pr-1 ${
              mobileTab === 'tools' ? 'flex' : 'hidden lg:flex'
            }`}
          >
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
