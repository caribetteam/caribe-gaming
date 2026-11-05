import { Router } from 'express';
import { env } from '../config/env.js';

export const healthRouter = Router();

healthRouter.get('/health', (_request, response) => {
  response.json({
    status: 'ok',
    mode: env.appMode,
    timestamp: new Date().toISOString(),
  });
});
