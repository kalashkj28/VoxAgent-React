# VoxAgent - React + TypeScript Web Client 🎙️

A production-grade, real-time voice AI interface built with **React 19**, **TypeScript**, **Tailwind CSS v4**, and **Lucide Icons** for the VoxAgent backend.

Designed by **Kalash Jain**.

---

## ⚡ Features

- **Full-Duplex Dual WebSockets**: Seamlessly connects to `/ws/voice` (binary audio streaming) and `/ws/chat` (text streaming).
- **Web Audio API & Live Waveform**: Real-time microphone input volume monitoring with dynamic frequency visualizer bars.
- **VAD Silence Detection**: Automatic cutoff after 2.5 seconds of silence for natural conversation flow.
- **Hands-Free Auto Mode**: Continuous voice conversation loop (speaks -> finishes -> automatically records again).
- **Barge-In / Interruption**: Interrupts assistant speech immediately when the user speaks or types.
- **Type-Safe WS Contracts**: Strict TypeScript interfaces for all STT, LLM, TTS, latency, and error events.
- **Real-Time Latency HUD**: Live display of STT (Groq Whisper), LLM (Gemini), and TTS (Edge-TTS) round-trip durations.
- **Knowledge Base PDF Management**: Upload documents with real-time indexing progress bar and instant FAISS vector search.
- **Glassmorphism UI**: Floating orbs, backdrop blur, typewriter streaming text, and responsive layout.
- **Configurable Backend**: Works out-of-the-box with `http://localhost:8000` or deployed production backends (e.g. Render).

---

## 🛠️ Tech Stack

- **Framework**: React 19 + TypeScript
- **Bundler**: Vite
- **Styling**: Tailwind CSS v4 + Custom Glassmorphism CSS
- **Icons**: Lucide React
- **Audio**: Web Audio API (`AudioContext`, `AnalyserNode`, `MediaRecorder`)

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
The app will launch on `http://localhost:3000`.

### 3. Connect to VoxAgent Backend
- Ensure your VoxAgent FastAPI backend is running on `http://localhost:8000`.
- The Vite development server automatically proxies `/ws` and `/api` to `http://localhost:8000`.
- Or click the **Settings ⚙️** icon in the header to point to any custom URL (e.g. your Render deployment `https://voxagent-fzxj.onrender.com`).

### 4. Build for Production
```bash
npm run build
```
Static production assets will be generated in `dist/`.

---

## 📁 Project Structure

```
voxagent-react/
├── src/
│   ├── types/
│   │   └── voxagent.ts          # Type-safe WebSocket contracts & data models
│   ├── hooks/
│   │   ├── useVoiceAgent.ts     # State machine for sockets, streaming, barge-in, metrics
│   │   └── useAudioRecorder.ts  # Web Audio API, silence detection, live visualizer
│   ├── services/
│   │   └── kbApi.ts             # Knowledge Base REST API client
│   ├── components/
│   │   ├── Header.tsx           # Branding, connection badge, backend settings
│   │   ├── ChatPanel.tsx        # Chat window with auto-scroll & typing indicator
│   │   ├── MessageBubble.tsx    # Styled user, bot (streaming), and system bubbles
│   │   ├── ChatInput.tsx        # Text input & send button
│   │   ├── Controls.tsx         # Mic button with pulse ring, auto-mode, voice toggle
│   │   ├── Visualizer.tsx       # Real-time audio waveform animation
│   │   ├── LatencyHUD.tsx       # Latency cards (STT, LLM, TTS, Total)
│   │   ├── KnowledgeBase.tsx    # PDF upload progress & indexed files list
│   │   └── Watermark.tsx        # Creator portfolio links
│   ├── App.tsx                  # Root layout & animated backdrop
│   ├── index.css                # Tailwind CSS v4 + glassmorphism theme
│   └── main.tsx                 # Entry point
├── vite.config.ts               # Vite configuration + API/WS proxy
└── package.json
```

---

## 👨‍💻 Author

**Kalash Jain**
- [LinkedIn](https://www.linkedin.com/in/kalashjain28)
- [GitHub](https://github.com/kalashkj28)
- [Portfolio](https://kalashkj28.github.io/)
