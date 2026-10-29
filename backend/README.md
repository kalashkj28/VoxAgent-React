# VoxAgent Backend 🎙️

FastAPI + LangGraph + Groq Whisper + Gemini 3.5 Flash Lite + Edge-TTS backend service.

## 🚀 Running Backend Directly

```bash
# Activate virtual environment
# Windows:
.venv\Scripts\activate
# Linux/macOS:
source .venv/bin/activate

# Start server
uvicorn app.server:app --reload --port 8000
```

## 🔑 Environment Variables
Create a `.env` file based on `.env.example`:
```env
GEMINI_API_KEY=your_gemini_api_key_here
GROQ_API_KEY=your_groq_api_key_here
```
