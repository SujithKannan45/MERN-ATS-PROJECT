import { sanitizeString, cleanObject } from '../../src/core/middlewares/xss-clean.middleware.js';
import { redactSensitiveData } from '../../src/core/logger/logger.js';

describe('Security & Sanitization Unit Tests', () => {
  describe('XSS Sanitization', () => {
    it('should strip script tags from string input', () => {
      const malicious = '<script>alert("XSS")</script>Hello World';
      const cleaned = sanitizeString(malicious);
      expect(cleaned).toBe('Hello World');
    });

    it('should strip javascript: pseudo-protocols', () => {
      const malicious = 'javascript:doBadThings()';
      const cleaned = sanitizeString(malicious);
      expect(cleaned).not.toContain('javascript:');
    });

    it('should strip inline event handlers', () => {
      const malicious = '<img src="x" onerror="alert(1)">';
      const cleaned = sanitizeString(malicious);
      expect(cleaned).not.toContain('onerror');
    });

    it('should recursively clean nested objects and arrays', () => {
      const payload = {
        title: 'Safe Title',
        notes: '<script>evil()</script>Some valid notes',
        skills: ['JavaScript', '<script>steal()</script>TypeScript'],
        meta: {
          bio: '<b onmouseover="hack()">Developer</b>',
        },
      };

      const cleaned = cleanObject(payload) as typeof payload;
      expect(cleaned.notes).toBe('Some valid notes');
      expect(cleaned.skills[1]).toBe('TypeScript');
      expect(cleaned.meta.bio).not.toContain('onmouseover');
    });
  });

  describe('Sensitive Data Redaction', () => {
    it('should mask sensitive keys in objects', () => {
      const logData = {
        user: 'alex@example.com',
        password: 'SuperSecretPassword123!',
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjMifQ.abc',
        refreshToken: 'def456',
        apiKey: 'AIzaSySecretApiKey12345678901234567',
        regularField: 'Visible data',
      };

      const redacted = redactSensitiveData(logData) as typeof logData;
      expect(redacted.password).toBe('[REDACTED]');
      expect(redacted.token).toBe('[REDACTED]');
      expect(redacted.refreshToken).toBe('[REDACTED]');
      expect(redacted.apiKey).toBe('[REDACTED]');
      expect(redacted.regularField).toBe('Visible data');
    });

    it('should redact Bearer authorization tokens in string messages', () => {
      const msg = 'User requested with Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.token123';
      const redacted = redactSensitiveData(msg);
      expect(redacted).toBe('User requested with Bearer [REDACTED_TOKEN]');
    });
  });
});
