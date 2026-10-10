import { Request, Response, NextFunction } from 'express';

/**
 * Strips script tags, javascript: pseudo-protocols, and inline event handlers from strings
 */
export const sanitizeString = (input: string): string => {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:[^\s"'>]*/gi, '')
    .replace(/on\w+\s*=\s*(['"]).*?\1/gi, '')
    .replace(/on\w+\s*=\s*[^>\s]+/gi, '');
};

/**
 * Recursively cleans dangerous XSS vectors from nested objects or arrays
 */
export const cleanObject = (obj: unknown, depth: number = 0): unknown => {
  if (depth > 8 || obj === null || obj === undefined) return obj;

  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => cleanObject(item, depth + 1));
  }

  if (typeof obj === 'object' && !(obj instanceof Date) && !(obj instanceof RegExp)) {
    const cleaned: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      cleaned[key] = cleanObject(value, depth + 1);
    }
    return cleaned;
  }

  return obj;
};

export const xssClean = (req: Request, _res: Response, next: NextFunction): void => {
  if (req.body && typeof req.body === 'object') {
    req.body = cleanObject(req.body);
  }

  if (req.query && typeof req.query === 'object') {
    req.query = cleanObject(req.query) as Request['query'];
  }

  if (req.params && typeof req.params === 'object') {
    req.params = cleanObject(req.params) as Request['params'];
  }

  next();
};
