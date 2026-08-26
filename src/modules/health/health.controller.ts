import { Request, Response } from 'express';
import { dbConnection } from '../../config/db.config.js';
import { envConfig } from '../../config/env.config.js';
import { ApiResponse } from '../../shared/utils/api-response.js';
import { HttpStatusCode } from '../../core/errors/app-error.js';

export class HealthController {
  public static getHealth = async (_req: Request, res: Response): Promise<Response> => {
    const dbStatus = dbConnection.getStatus();
    const isHealthy = dbStatus.isConnected;

    const healthData = {
      service: 'ATS Resume Platform Backend API',
      status: isHealthy ? 'UP' : 'DEGRADED',
      environment: envConfig.NODE_ENV,
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      system: {
        nodeVersion: process.version,
        memoryUsageMB: {
          rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
          heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
          heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        },
      },
      dependencies: {
        database: {
          status: isHealthy ? 'CONNECTED' : 'DISCONNECTED',
          readyState: dbStatus.readyState,
          host: dbStatus.host || 'N/A',
          databaseName: dbStatus.name || 'N/A',
        },
      },
    };

    return ApiResponse.success(
      res,
      healthData,
      isHealthy ? 'Service is operational' : 'Service is degraded (Database disconnected)',
      isHealthy ? HttpStatusCode.OK : HttpStatusCode.SERVICE_UNAVAILABLE
    );
  };
}
