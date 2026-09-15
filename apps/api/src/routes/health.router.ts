import { Router, Request, Response } from 'express';
import { checkDatabaseConnection } from '../connection.ts';
import type { HealthResponse } from '@repo/shared-types';

export const healthRouter = Router();

healthRouter.get('/health', async (_req: Request, res: Response) => {
  const dbStatus = await checkDatabaseConnection();

  const response: HealthResponse = {
    status: dbStatus.connected ? 'ok' : 'degraded',
    service: '@apps/api',
    version: '0.1.0',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database: {
      connected: dbStatus.connected,
      provider: 'postgresql',
      message: dbStatus.message,
    },
    environment: process.env.NODE_ENV || 'development',
  };

  res.status(200).json(response);
});
