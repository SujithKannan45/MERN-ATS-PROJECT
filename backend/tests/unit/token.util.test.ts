import { TokenUtil } from '../../src/modules/auth/utils/token.util.js';

describe('TokenUtil Unit Tests', () => {
  const samplePayload = {
    userId: '66d000000000000000000001',
    email: 'user@example.com',
    role: 'candidate',
  };

  it('should generate a valid JWT access token with expected payload', () => {
    const token = TokenUtil.generateAccessToken(samplePayload);
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3);

    const decoded = TokenUtil.verifyAccessToken(token);
    expect(decoded.userId).toBe(samplePayload.userId);
    expect(decoded.email).toBe(samplePayload.email);
    expect(decoded.role).toBe(samplePayload.role);
  });

  it('should throw an error when verifying a tampered token', () => {
    const validToken = TokenUtil.generateAccessToken(samplePayload);
    const tamperedToken = validToken.slice(0, -5) + 'abcde';

    expect(() => {
      TokenUtil.verifyAccessToken(tamperedToken);
    }).toThrow();
  });

  it('should generate random token and consistent SHA-256 hash', () => {
    const { rawToken, hashedToken } = TokenUtil.generateRandomToken();
    expect(typeof rawToken).toBe('string');
    expect(rawToken.length).toBeGreaterThan(20);

    const rehashed = TokenUtil.hashToken(rawToken);
    expect(rehashed).toBe(hashedToken);
  });
});
