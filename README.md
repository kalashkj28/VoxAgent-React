# VoxAgent - Full-Stack Voice AI Agent 🎙️

[![React](https://img.shields.io/badge/Frontend-React%2019%20%2B%20TypeScript-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/Styling-Tailwind%20CSS%20v4-38B2AC?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.12-3776AB?logo=python&logoColor=white)](https://python.org/)
[![Vercel](https://img.shields.io/badge/Deployed-Vercel-black?logo=vercel&logoColor=white)](https://vox-agent-react.vercel.app)
[![Render](https://img.shields.io/badge/Deployed-Render-46E3B7?logo=render&logoColor=black)](https://voxagent-react.onrender.com)

A production-grade, real-time Voice AI system featuring a **Python (FastAPI + LangGraph) AI backend** and a modern **React 19 + TypeScript + Tailwind CSS v4 web interface**.

Built by **[Kalash Jain](https://github.com/kalashkj28)**.

---

## 🌐 Live Demos

* **Frontend Web App (Vercel):** [https://vox-agent-react.vercel.app](https://vox-agent-react.vercel.app)
* **Backend API & WebSockets (Render):** [https://voxagent-react.onrender.com](https://voxagent-react.onrender.com)
* **Source Code:** [https://github.com/kalashkj28/VoxAgent-React](https://github.com/kalashkj28/VoxAgent-React)

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
| **Cloud Deployment** | Monolithic container | **Decoupled: Vercel (Frontend) + Render (Backend)** |

---

## 🌟 Bonus Features & UX Innovations

Designed from a real user's perspective to eliminate friction, boost accessibility, and provide an intuitive conversational flow:

1. **Interactive Suggestion Chips ("Try Asking..."):**
   * *Problem Solved:* Solves "blank page syndrome" where first-time users or evaluators don't know what tools the agent supports.
   * *Enhancement:* One-click prompt chips (Weather, 3 PM Consultation, AI News Search, Tech Stack) for instant discovery.

2. **Variable Voice Playback Speed (1x / 1.25x / 1.5x):**
   * *Problem Solved:* Default neural speech pacing can feel slow for power users who want rapid responses.
   * *Enhancement:* Dedicated speed cycling button that dynamically modulates playback rate in real time.

3. **Message Audio Replay:**
   * *Problem Solved:* In noisy environments or long answers, users often miss parts of the audio and had to re-ask.
   * *Enhancement:* Dedicated "🔊 Replay" button on every assistant bubble that replays the cached audio response.

4. **1-Click Conversation Export (.md):**
   * *Problem Solved:* Users lose meeting schedules, research summaries, and chat transcripts when closing the browser.
   * *Enhancement:* Instantly downloads a formatted Markdown transcript (`voxagent-chat-[date].md`) with roles, timestamps, and latency metrics.

5. **Message Copy to Clipboard:**
   * *Problem Solved:* Manual highlighting on glassmorphism bubbles is inconvenient.
   * *Enhancement:* One-click copy with smooth checkmark feedback for easy extraction.

6. **Session Reset / New Chat:**
   * *Problem Solved:* Starting a new topic without page reload.
   * *Enhancement:* "New Chat" button cleanly resets conversation history and welcome prompt.

7. **Desktop Keyboard Shortcuts (Accessibility):**
   * *Spacebar:* Press to toggle microphone recording (when not focused on text input).
   * *Escape:* Press to immediately interrupt AI speech and voice synthesis.

---

## 🛠️ Tech Stack

### Frontend (`/frontend`)
* **Framework:** React 19 + TypeScript
* **Build Tool:** Vite
* **Styling:** Tailwind CSS v4 + Glassmorphism
* **Icons:** Lucide React
* **Audio:** Web Audio API (`AudioContext`, `AnalyserNode`, `MediaRecorder`)
* **Deployment:** Vercel

### Backend (`/backend`)
* **Server:** FastAPI + WebSockets + Uvicorn
* **AI Brain:** Google Gemini 3.5 Flash Lite
* **STT:** Groq Whisper large-v3 (~500ms latency)
* **TTS:** Microsoft Edge-TTS (neural voice) with automatic gTTS fallback
* **Orchestration:** LangGraph (StateGraph with conditional tool routing)
* **RAG & Search:** FAISS + sentence-transformers + DuckDuckGo
* **Memory & Cache:** SQLite + Lightweight Jaccard semantic cache
* **Deployment:** Docker on Render (Free tier)

---

## 🚀 Quick Start (Local Setup)

### 1. Clone the repository:
```bash
git clone https://github.com/kalashkj28/VoxAgent-React.git
cd VoxAgent-React
```

### 2. Configure Environment Variables:
Create `backend/.env` (use `backend/.env.example` as reference):
```env
GEMINI_API_KEY=your_gemini_api_key_here
GROQ_API_KEY=your_groq_api_key_here
```

### 3. Install Dependencies:
```bash
# Frontend dependencies
cd frontend && npm install && cd ..

# Backend dependencies (using uv or pip)
cd backend && uv sync && cd ..
```

### 4. 1-Command Launch:
From the project root:
```bash
npm run dev
```
*(Or simply double-click **`start.bat`** on Windows).*

This single command automatically:
* Detects Python from `backend/.venv` (or global Python).
* Sets `PYTHONUTF8=1` to prevent Windows console encoding crashes.
* Starts FastAPI backend on `http://localhost:8000`.
* Starts React Vite frontend on `http://localhost:3000`.
* Proxies WebSockets (`/ws`) and REST (`/api`) seamlessly.

---

## 📁 Repository Structure

```
voxagent-react/
├── start.bat                 # 1-click Windows runner
├── run-dev.js                # Unified process launcher (Backend + Frontend)
├── package.json              # Root project runner
├── render.yaml               # Cloud Render deployment blueprint
│
├── backend/
│   ├── app/
│   │   ├── agent/            # LangGraph stategraph & intent classification
│   │   ├── memory/           # SQLite store & semantic cache
│   │   ├── rag/              # FAISS document retriever
│   │   ├── tools/            # 9 agentic tools (weather, time, web search, CRUD appointments)
│   │   ├── tts/              # Edge-TTS + gTTS dual fallback
│   │   ├── config.py         # Model & API keys configuration
│   │   └── server.py         # FastAPI WebSockets (/ws/voice, /ws/chat) & REST
│   ├── data/                 # SQLite databases (.gitkeep)
│   ├── knowledge_base/       # Uploaded PDF documents (.gitkeep)
│   ├── pyproject.toml        # Python project metadata & dependencies
│   ├── Dockerfile            # Container deployment specification
│   └── .env.example          # Environment variables template
│
├── frontend/
│   ├── src/
│   │   ├── components/       # ChatPanel, Controls, LatencyHUD, KnowledgeBase, Visualizer, Header
│   │   ├── hooks/            # useVoiceAgent, useAudioRecorder
│   │   ├── services/         # kbApi service
│   │   ├── types/            # TypeScript WS event definitions
│   │   ├── App.tsx           # Main application view
│   │   └── index.css         # Tailwind v4 styles & animations
│   ├── package.json          # Node dependencies
│   ├── vercel.json           # Vercel SPA routing
│   ├── vite.config.ts        # Vite configuration & proxy
│   └── .env.example          # Frontend environment variables template
│
├── .gitignore
└── README.md
```

---

## 👨‍💻 Author

**Kalash Jain**
* **GitHub:** [@kalashkj28](https://github.com/kalashkj28)
* **LinkedIn:** [Kalash Jain](https://www.linkedin.com/in/kalashjain28)
* **Portfolio:** [kalashkj28.github.io](https://kalashkj28.github.io/)
