import mongoose from 'mongoose';
import { envConfig } from '../../config/env.config.js';
import { dbConnection } from '../../config/db.config.js';
import { emailQueue } from '../queue/email.queue.js';
import { notificationQueue } from '../queue/notification.queue.js';
import { logger } from '../logger/logger.js';

export interface ISystemMetrics {
  status: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY';
  timestamp: string;
  environment: string;
  uptimeSeconds: number;
  process: {
    pid: number;
    nodeVersion: string;
    platform: string;
    architecture: string;
  };
  memory: {
    rssMB: number;
    heapTotalMB: number;
    heapUsedMB: number;
    heapUsedPercentage: number;
    externalMB: number;
  };
  cpu: {
    userCpuMs: number;
    systemCpuMs: number;
  };
  database: {
    status: 'CONNECTED' | 'DISCONNECTED' | 'CONNECTING';
    readyState: number;
    host: string;
    name: string;
    latencyMs: number;
  };
  queues: {
    emailQueue: { pending: number; processing: number; activeWorkers: number };
    notificationQueue: { pending: number; processing: number; activeWorkers: number };
  };
}

export class SystemMonitor {
  private static previousCpuUsage = process.cpuUsage();

  public static async getMetrics(): Promise<ISystemMetrics> {
    const mem = process.memoryUsage();
    const rssMB = Math.round(mem.rss / 1024 / 1024);
    const heapTotalMB = Math.round(mem.heapTotal / 1024 / 1024);
    const heapUsedMB = Math.round(mem.heapUsed / 1024 / 1024);
    const heapUsedPercentage = Math.round((mem.heapUsed / mem.heapTotal) * 100);
    const externalMB = Math.round(mem.external / 1024 / 1024);

    const currentCpu = process.cpuUsage(this.previousCpuUsage);
    this.previousCpuUsage = process.cpuUsage();

    const dbStatus = dbConnection.getStatus();

    // Measure MongoDB ping latency
    let dbLatencyMs = -1;
    let isDbHealthy = false;

    if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
      try {
        const pingStart = process.hrtime.bigint();
        await mongoose.connection.db.admin().ping();
        const pingEnd = process.hrtime.bigint();
        dbLatencyMs = Math.round(Number(pingEnd - pingStart) / 1_000_000 * 100) / 100;
        isDbHealthy = true;
      } catch (err) {
        logger.error('Failed to ping database during health monitoring check', { err });
        isDbHealthy = false;
      }
    }

    const emailStats = emailQueue.queue.getStats();
    const notificationStats = notificationQueue.queue.getStats();

    // Determine overall health state
    let overallStatus: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY' = 'HEALTHY';
    if (!isDbHealthy) {
      overallStatus = 'UNHEALTHY';
    } else if (heapUsedPercentage > 90 || dbLatencyMs > 200) {
      overallStatus = 'DEGRADED';
    }

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      environment: envConfig.NODE_ENV,
      uptimeSeconds: Math.floor(process.uptime()),
      process: {
        pid: process.pid,
        nodeVersion: process.version,
        platform: process.platform,
        architecture: process.arch,
      },
      memory: {
        rssMB,
        heapTotalMB,
        heapUsedMB,
        heapUsedPercentage,
        externalMB,
      },
      cpu: {
        userCpuMs: Math.round(currentCpu.user / 1000),
        systemCpuMs: Math.round(currentCpu.system / 1000),
      },
      database: {
        status: isDbHealthy ? 'CONNECTED' : 'DISCONNECTED',
        readyState: dbStatus.readyState,
        host: dbStatus.host || 'N/A',
        name: dbStatus.name || 'N/A',
        latencyMs: dbLatencyMs,
      },
      queues: {
        emailQueue: emailStats,
        notificationQueue: notificationStats,
      },
    };
  }
}
