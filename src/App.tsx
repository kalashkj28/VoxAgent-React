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
    metrics,
    ttsEnabled,
    autoMode,
    isRecording,
    audioLevel,
    micError,
    backendUrl,
    setBackendUrl,
    toggleRecording,
    toggleAutoMode,
    toggleTTS,
    sendTextMessage,
    reconnect,
  } = useVoiceAgent();

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-x-hidden p-3 sm:p-5 lg:p-6">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Glow gradients */}
        <div className="absolute top-1/4 left-1/5 w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/5 w-[450px] h-[450px] bg-indigo-400/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-1/2 right-1/3 w-[350px] h-[350px] bg-pink-400/5 rounded-full blur-[80px] pointer-events-none" />

        {/* Floating animated orbs */}
        <div className="absolute -top-12 -left-12 w-72 h-72 rounded-full bg-blue-500/10 blur-[60px] animate-float-1 pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-64 h-64 rounded-full bg-indigo-500/10 blur-[60px] animate-float-2 pointer-events-none" />
        <div className="absolute top-1/2 left-2/3 w-52 h-52 rounded-full bg-purple-500/10 blur-[50px] animate-float-3 pointer-events-none" />

        {/* Dot pattern */}
        <div
          className="absolute inset-0 opacity-[0.25]"
          style={{
            backgroundImage: 'radial-gradient(circle, #9ca3af 0.8px, transparent 0.8px)',
            backgroundSize: '24px 24px',
          }}
        />
      </div>

      {/* Main Container */}
      <div className="relative z-10 max-w-6xl w-full mx-auto flex flex-col flex-1 h-[calc(100vh-2rem)] sm:h-[calc(100vh-3rem)]">
        <Header
          connectionState={connectionState}
          backendUrl={backendUrl}
          onUpdateBackendUrl={setBackendUrl}
          onReconnect={reconnect}
        />

        <main className="grid grid-cols-1 lg:grid-cols-[1fr_330px] gap-4 flex-1 min-h-0 overflow-hidden">
          {/* Left Chat Window */}
          <section className="flex flex-col min-h-[350px] lg:min-h-0 h-full overflow-hidden">
            <ChatPanel
              messages={messages}
              isTyping={isTyping}
              onSendMessage={sendTextMessage}
              disabled={connectionState === 'disconnected'}
            />
          </section>

          {/* Right Sidebar */}
          <aside className="flex flex-col gap-3.5 overflow-y-auto custom-scrollbar pr-1">
            <Controls
              isRecording={isRecording}
              audioLevel={audioLevel}
              autoMode={autoMode}
              ttsEnabled={ttsEnabled}
              onToggleRecording={toggleRecording}
              onToggleAutoMode={toggleAutoMode}
              onToggleTTS={toggleTTS}
              micError={micError}
            />

            <LatencyHUD metrics={metrics} />

            <KnowledgeBase
              onNotify={(msg) => {
                sendTextMessage(`[System: ${msg}]`);
              }}
            />

            <Watermark />
          </aside>
        </main>
      </div>
    </div>
  );
}

export default App;
