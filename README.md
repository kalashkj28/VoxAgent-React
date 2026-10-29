# VoxAgent - Full-Stack Voice AI Agent 🎙️

A production-grade, real-time Voice AI system featuring a **Python (FastAPI + LangGraph) AI backend** and a modern **React 19 + TypeScript + Tailwind CSS v4 web interface**.

Built by **Kalash Jain**.

---

## 🏗️ Architecture

```
                       ┌───────────────────────────────┐
                       │   React 19 + TypeScript UI    │
                       │   (Tailwind v4, Web Audio)    │
                       └──────────────┬────────────────┘
                                      │
                   Dual WebSockets (/ws/voice, /ws/chat)
                                      │
                       ┌──────────────▼────────────────┐
                       │        FastAPI Server         │
                       └──────────────┬────────────────┘
                                      │
       ┌──────────────────────────────┼──────────────────────────────┐
       │                              │                              │
┌──────▼──────┐               ┌──────▼──────┐               ┌──────▼──────┐
│ Groq Whisper│               │  LangGraph  │               │  Edge-TTS   │
│   (STT)     │               │ (9 AI Tools)│               │ (w/ gTTS)   │
└─────────────┘               └──────┬──────┘               └─────────────┘
                                     │
                    ┌────────────────┴────────────────┐
                    │                                 │
             ┌──────▼──────┐                   ┌──────▼──────┐
             │ Gemini 3.5  │                   │ FAISS RAG + │
             │ Flash Lite  │                   │ SQLite Cache│
             └─────────────┘                   └─────────────┘
```

---

## ⚡ What Makes This Project Special

| Feature | Original VoxAgent | This Project (VoxAgent Full-Stack) |
|---|---|---|
| **Frontend Framework** | Vanilla HTML / JS / CSS | **React 19 + TypeScript + Vite** |
| **Styling** | Custom static CSS | **Tailwind CSS v4 + Glassmorphism** |
| **Icons** | Emojis | **Lucide Icons** |
| **State Management** | Global JS variables | **Custom React Hooks (`useVoiceAgent`, `useAudioRecorder`)** |
| **Type Safety** | None (dynamic JS) | **Strict TypeScript contracts for all WS payloads** |
| **Audio Visualizer** | Simple CSS pulse | **Real-time Web Audio API frequency waveform** |
| **Unified Runner** | Separate manual terminals | **Single command (`npm run dev`) or 1-click `start.bat`** |

---

## 🛠️ Tech Stack

### Frontend (`/frontend`)
- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v4 + Glassmorphism
- **Icons**: Lucide React
- **Audio**: Web Audio API (`AudioContext`, `AnalyserNode`, `MediaRecorder`)

### Backend (`/backend`)
- **Server**: FastAPI + WebSockets + Uvicorn
- **AI Brain**: Google Gemini 3.5 Flash Lite
- **STT**: Groq Whisper large-v3 (~500ms latency)
- **TTS**: Microsoft Edge-TTS with automatic gTTS fallback
- **Orchestration**: LangGraph (StateGraph with conditional routing)
- **RAG & Search**: FAISS + DuckDuckGo
- **Memory & Cache**: SQLite + Lightweight Jaccard semantic cache

---

## 🚀 1-Command Quick Start

### Start Everything (Backend + Frontend):

From the project root:

```bash
npm run dev
```

*(OR simply double-click **`start.bat`** in Windows Explorer).*

This single command automatically:
- Detects the backend virtual environment Python (`backend/.venv/Scripts/python.exe`).
- Sets `PYTHONUTF8=1` to prevent emoji crashes.
- Starts FastAPI backend on `http://localhost:8000`.
- Starts React + Vite frontend on `http://localhost:3000`.
- Forwards WebSocket `/ws` and REST `/api` calls seamlessly.

---

## 📁 Repository Structure

```
voxagent-react/
├── start.bat                 # 1-click Windows runner
├── run-dev.js                # Unified process launcher (Backend + Frontend)
├── package.json              # Root project runner
│
├── backend/
│   ├── app/
│   │   ├── agent/            # LangGraph stategraph & intent classification
│   │   ├── memory/           # SQLite store & semantic cache
│   │   ├── rag/              # FAISS document retriever
│   │   ├── tools/            # 9 agentic tools (weather, time, web search, appointments)
│   │   ├── tts/              # Edge-TTS + gTTS dual fallback
│   │   ├── config.py         # Model & API keys configuration
│   │   └── server.py         # FastAPI WebSockets (/ws/voice, /ws/chat) & REST
│   ├── data/                 # SQLite databases
│   ├── knowledge_base/       # Uploaded PDF documents
│   ├── pyproject.toml        # Python project metadata
│   └── Dockerfile            # Container deployment specification
│
├── frontend/
│   ├── src/
│   │   ├── components/       # ChatPanel, Controls, LatencyHUD, KnowledgeBase, Visualizer
│   │   ├── hooks/            # useVoiceAgent, useAudioRecorder
│   │   ├── services/         # kbApi service
│   │   ├── types/            # TypeScript WS event definitions
│   │   ├── App.tsx           # Main application view
│   │   └── index.css         # Tailwind v4 styles & animations
│   ├── package.json          # Node dependencies
│   └── vite.config.ts        # Vite configuration & proxy
│
├── .gitignore
└── README.md
```

---

## 👨‍💻 Author

**Kalash Jain**
- [LinkedIn](https://www.linkedin.com/in/kalashjain28)
- [GitHub](https://github.com/kalashkj28)
- [Portfolio](https://kalashkj28.github.io/)
