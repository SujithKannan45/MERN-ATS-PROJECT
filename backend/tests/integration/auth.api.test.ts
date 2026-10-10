import request from 'supertest';
import { getTestApp } from '../helpers/test-app.helper.js';

describe('Auth API Integration & Validation Tests', () => {
  const app = getTestApp();

  it('POST /api/v1/auth/register - should return 422 for missing required fields', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'incomplete@example.com' });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('validation failed');
  });

  it('POST /api/v1/auth/login - should return 422 for invalid email address format', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'not-an-email', password: 'password123' });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/v1/auth/refresh-token - should return 401 when no token is supplied', async () => {
    const res = await request(app).post('/api/v1/auth/refresh-token').send({});

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/v1/auth/logout - should clear auth cookies and return 200', async () => {
    const res = await request(app).post('/api/v1/auth/logout').send({});

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.message).toContain('Logged out successfully');
  });
});
