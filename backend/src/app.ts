import express from 'express';
import cors from 'cors';
import { authMiddleware } from './middleware/auth';
import apiRouter from './routes/api';

export const app = express();

app.use(cors());
app.use(express.json());
app.use(authMiddleware);

// Mount API routes
app.use('/api', apiRouter);

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled API error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});
