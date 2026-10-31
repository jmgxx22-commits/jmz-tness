import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { handleChat, handleGenerateRoutine, handleAnalyzeMeal } from './server/geminiBackend';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON Body parser with larger payload support for image base64
  app.use(express.json({ limit: '15mb' }));

  // 1. Endpoint: AI Coach Chat
  app.post('/api/gemini/chat', async (req, res) => {
    try {
      const result = await handleChat(req.body);
      res.json(result);
    } catch (error: any) {
      console.error('Error in /api/gemini/chat:', error);
      res.status(500).json({
        error: error?.message || 'Error communicating with Gemini AI',
      });
    }
  });

  // 2. Endpoint: AI Routine Generator
  app.post('/api/gemini/generate-routine', async (req, res) => {
    try {
      const result = await handleGenerateRoutine(req.body);
      res.json(result);
    } catch (error: any) {
      console.error('Error in /api/gemini/generate-routine:', error);
      res.status(500).json({
        error: error?.message || 'Error generating routine with Gemini AI',
      });
    }
  });

  // 3. Endpoint: AI Meal Photo Analysis
  app.post('/api/gemini/analyze-meal', async (req, res) => {
    try {
      const result = await handleAnalyzeMeal(req.body);
      res.json(result);
    } catch (error: any) {
      console.error('Error in /api/gemini/analyze-meal:', error);
      res.status(500).json({
        error: error?.message || 'Error analyzing meal photo with Gemini AI',
      });
    }
  });

  // 4. Endpoint: Direct ZIP download for complete project
  app.get(['/api/download', '/api/download-zip'], (_req, res) => {
    const zipPath = path.join(__dirname, 'public', 'downloads', 'jmz-tness-production.zip');
    res.download(zipPath, 'jmz-tness-production.zip', (err) => {
      if (err) {
        console.error('Error sending zip file:', err);
        if (!res.headersSent) {
          res.status(500).send('Error downloading zip');
        }
      }
    });
  });

  // Setup Vite in development or static serve in production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`J-MZ Tness server running on http://localhost:${PORT}`);
  });
}

startServer();
