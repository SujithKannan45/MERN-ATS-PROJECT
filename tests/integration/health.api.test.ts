import request from 'supertest';
import { getTestApp } from '../helpers/test-app.helper.js';

describe('Health API Integration Tests', () => {
  const app = getTestApp();

  it('GET /health - should return system health metrics', async () => {
    const res = await request(app).get('/health');
    // In CI / local without active MongoDB, service status is DEGRADED (503), otherwise 200
    expect([200, 503]).toContain(res.status);
    expect(res.body.data).toHaveProperty('status');
    expect(res.body.data).toHaveProperty('memory');
    expect(res.body.data).toHaveProperty('process');
    expect(res.body.data).toHaveProperty('uptimeSeconds');
  });

  it('GET /api/v1/health - should return versioned health metrics', async () => {
    const res = await request(app).get('/api/v1/health');
    expect([200, 503]).toContain(res.status);
    expect(res.body.data.process).toHaveProperty('nodeVersion');
  });
});
