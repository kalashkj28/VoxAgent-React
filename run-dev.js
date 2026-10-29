import { spawn } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const backendDir = path.join(__dirname, 'backend');
const frontendDir = path.join(__dirname, 'frontend');

// Find Python executable in backend virtualenv, fallback to global python
const venvPythonWin = path.join(backendDir, '.venv', 'Scripts', 'python.exe');
const venvPythonUnix = path.join(backendDir, '.venv', 'bin', 'python');
let pythonCmd = 'python';

if (fs.existsSync(venvPythonWin)) {
  pythonCmd = venvPythonWin;
} else if (fs.existsSync(venvPythonUnix)) {
  pythonCmd = venvPythonUnix;
}

console.log('\n======================================================');
console.log('🎙️  VOXAGENT FULL-STACK LAUNCHER');
console.log('======================================================');
console.log(`🐍 Python: ${pythonCmd}`);
console.log(`⚡ Frontend: ${frontendDir}`);
console.log('======================================================\n');

// 1. Spawn Backend (FastAPI on Port 8000)
// Running directly without shell: true prevents Windows path space issues
const backend = spawn(pythonCmd, ['-m', 'uvicorn', 'app.server:app', '--reload', '--port', '8000'], {
  cwd: backendDir,
  stdio: 'inherit',
  env: {
    ...process.env,
    PYTHONUTF8: '1',
    PYTHONUNBUFFERED: '1',
  },
});

// 2. Spawn Frontend (Vite on Port 3000)
const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const frontend = spawn(npmCmd, ['run', 'dev'], {
  cwd: frontendDir,
  stdio: 'inherit',
  shell: true,
});

const cleanup = () => {
  console.log('\n🛑 Shutting down VoxAgent backend and frontend...');
  try {
    if (process.platform === 'win32') {
      if (backend.pid) spawn('taskkill', ['/pid', backend.pid.toString(), '/f', '/t']);
      if (frontend.pid) spawn('taskkill', ['/pid', frontend.pid.toString(), '/f', '/t']);
    } else {
      backend.kill('SIGTERM');
      frontend.kill('SIGTERM');
    }
  } catch {
    // Ignore cleanup error
  }
  process.exit(0);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

backend.on('exit', (code) => {
  if (code !== 0 && code !== null) {
    console.error(`⚠️ Backend exited with code ${code}`);
  }
});

frontend.on('exit', (code) => {
  if (code !== 0 && code !== null) {
    console.error(`⚠️ Frontend exited with code ${code}`);
  }
});
