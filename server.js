import { spawn } from 'child_process';
import dotenv from 'dotenv';
import connectDB from './backend/config/db.js';
import app from './backend/app.js';

dotenv.config();

// Connect to Database
connectDB();

// Start Express Backend on Port 5000
const BACKEND_PORT = process.env.BACKEND_PORT || 5000;
app.listen(BACKEND_PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${BACKEND_PORT}`);
});

// Start Vite Dev Server on Port 3000
const vite = spawn('npx', ['vite', '--port', '3000', '--host'], {
  stdio: 'inherit',
  shell: true
});

vite.on('close', (code) => {
  process.exit(code);
});
