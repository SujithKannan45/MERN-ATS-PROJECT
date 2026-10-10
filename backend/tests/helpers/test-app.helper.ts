import { Express } from 'express';
import { createApp } from '../../src/app.js';
import { TokenUtil } from '../../src/modules/auth/utils/token.util.js';
import { mockCandidateUser, mockAdminUser } from '../mocks/mock-data.js';

let appInstance: Express | null = null;

export const getTestApp = (): Express => {
  if (!appInstance) {
    appInstance = createApp();
  }
  return appInstance;
};

export const getCandidateToken = (): string => {
  return TokenUtil.generateAccessToken({
    userId: mockCandidateUser._id.toString(),
    email: mockCandidateUser.email,
    role: 'candidate',
  });
};

export const getAdminToken = (): string => {
  return TokenUtil.generateAccessToken({
    userId: mockAdminUser._id.toString(),
    email: mockAdminUser.email,
    role: 'admin',
  });
};
