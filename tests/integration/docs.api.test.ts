import request from 'supertest';
import { getTestApp } from '../helpers/test-app.helper.js';

describe('Swagger & API Documentation Integration Tests', () => {
  const app = getTestApp();

  it('GET /api-docs/spec.json - should serve valid OpenAPI 3.0 specification JSON', async () => {
    const res = await request(app).get('/api-docs/spec.json');
    expect(res.status).toBe(200);
    expect(res.header['content-type']).toContain('application/json');
    expect(res.body.openapi).toBe('3.0.3');
    expect(res.body.info.title).toContain('ATS Resume Builder');
    expect(res.body.paths).toHaveProperty('/api/v1/auth/register');
    expect(res.body.paths).toHaveProperty('/api/v1/jobs');
    expect(res.body.paths).toHaveProperty('/api/v1/resumes/upload');
    expect(res.body.paths).toHaveProperty('/api/v1/ai/analyze');
  });

  it('GET /api-docs/ - should serve Swagger UI HTML', async () => {
    const res = await request(app).get('/api-docs/');
    expect(res.status).toBe(200);
    expect(res.header['content-type']).toContain('text/html');
    expect(res.text).toContain('swagger-ui');
  });

  it('GET /api/v1/docs/spec.json - should serve spec via versioned API route', async () => {
    const res = await request(app).get('/api/v1/docs/spec.json');
    expect(res.status).toBe(200);
    expect(res.body.openapi).toBe('3.0.3');
  });
});
