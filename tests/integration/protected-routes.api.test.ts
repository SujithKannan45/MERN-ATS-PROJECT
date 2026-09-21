import { jest } from '@jest/globals';
import request from 'supertest';
import { getTestApp, getCandidateToken } from '../helpers/test-app.helper.js';
import { User } from '../../src/modules/auth/models/user.model.js';
import { mockCandidateUser } from '../mocks/mock-data.js';

describe('Protected Routes & Authorization Integration Tests', () => {
  const app = getTestApp();

  beforeAll(() => {
    jest.spyOn(User, 'findById').mockReturnValue({
      select: jest.fn().mockResolvedValue({
        ...mockCandidateUser,
        isPasswordChangedAfterTokenIssued: () => false,
      }),
    } as any);
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe('Unauthenticated Requests (401 Unauthorized)', () => {
    it('GET /api/v1/resumes/me - should reject without authorization token', async () => {
      const res = await request(app).get('/api/v1/resumes/me');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/v1/jobs - should reject without authorization token', async () => {
      const res = await request(app).get('/api/v1/jobs');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/v1/dashboard - should reject without authorization token', async () => {
      const res = await request(app).get('/api/v1/dashboard');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/v1/notifications - should reject without authorization token', async () => {
      const res = await request(app).get('/api/v1/notifications');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/v1/audit-logs/me - should reject without authorization token', async () => {
      const res = await request(app).get('/api/v1/audit-logs/me');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Role-Based Access Control (403 Forbidden)', () => {
    it('GET /api/v1/audit-logs - should forbid candidate from accessing admin audit logs', async () => {
      const candidateToken = getCandidateToken();
      const res = await request(app)
        .get('/api/v1/audit-logs')
        .set('Authorization', `Bearer ${candidateToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('permission');
    });
  });

  describe('Global 404 Handler', () => {
    it('GET /api/v1/unknown-endpoint - should return 404 for undefined routes', async () => {
      const res = await request(app).get('/api/v1/unknown-endpoint');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });
});
