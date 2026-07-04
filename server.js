import { spawn } from 'child_process';
import dotenv from 'dotenv';
import path from 'path';
import express from 'express';
import connectDB from './backend/config/db.js';
import app from './backend/app.js';
import { errorHandler, notFound } from './backend/middleware/errorMiddleware.js';

dotenv.config();

// Connect to Database
connectDB();

const isProduction = process.env.NODE_ENV === 'production';

if (isProduction) {
  // Route-specific API Error Handling (unmatched /api routes)
  app.use('/api/*', notFound);
  app.use(errorHandler);

  // Serve the frontend static files from the build outDir (dist)
  const distPath = path.join(process.cwd(), 'dist');
  app.use(express.static(distPath));
  
  // SPA routing fallback: send index.html for any non-API request
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });

  // In production, Render uses PORT env variable
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Production server running on port ${PORT}`);
  });
} else {
  // Route-specific API Error Handling (unmatched /api routes in development)
  app.use('/api/*', notFound);
  app.use(errorHandler);

  // Start Express Backend on Port 5000 in development
  const BACKEND_PORT = process.env.BACKEND_PORT || 5000;
  app.listen(BACKEND_PORT, () => {
    console.log(`🚀 Backend running on http://localhost:${BACKEND_PORT}`);
  });

  // Start Vite Dev Server on Port 3000 in development
  const vite = spawn('npx', ['vite', '--port', '3000', '--host'], {
    stdio: 'inherit',
    shell: true
  });

  vite.on('close', (code) => {
    process.exit(code);
  });
}
