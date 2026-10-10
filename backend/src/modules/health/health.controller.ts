import { Request, Response } from 'express';
import { SystemMonitor } from '../../core/monitoring/system-monitor.js';
import { ApiResponse } from '../../shared/utils/api-response.js';
import { HttpStatusCode } from '../../core/errors/app-error.js';

export class HealthController {
  public static getHealth = async (_req: Request, res: Response): Promise<Response> => {
    const metrics = await SystemMonitor.getMetrics();
    const isHealthy = metrics.status !== 'UNHEALTHY';

    const statusCode = isHealthy ? HttpStatusCode.OK : HttpStatusCode.SERVICE_UNAVAILABLE;
    const message =
      metrics.status === 'HEALTHY'
        ? 'Service is fully operational'
        : metrics.status === 'DEGRADED'
        ? 'Service is operational with degraded performance'
        : 'Service is unavailable (database offline)';

    return ApiResponse.success(res, metrics, message, statusCode);
  };
}
