import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodEffects, ZodError } from 'zod';
import { asyncHandler } from './async-handler.middleware.js';

export type ValidationSource = AnyZodObject | ZodEffects<AnyZodObject> | {
  body?: AnyZodObject | ZodEffects<AnyZodObject>;
  query?: AnyZodObject | ZodEffects<AnyZodObject>;
  params?: AnyZodObject | ZodEffects<AnyZodObject>;
};

/**
 * Express middleware to validate incoming request data against Zod schemas
 */
export const validateRequest = (schema: ValidationSource) => {
  return asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
    try {
      if ('parseAsync' in schema) {
        const parsed = await schema.parseAsync({
          body: req.body,
          query: req.query,
          params: req.params,
        });

        if (parsed.body) req.body = parsed.body;
        if (parsed.query) req.query = parsed.query;
        if (parsed.params) req.params = parsed.params;
      } else {
        if (schema.body) {
          req.body = await schema.body.parseAsync(req.body);
        }
        if (schema.query) {
          req.query = await schema.query.parseAsync(req.query);
        }
        if (schema.params) {
          req.params = await schema.params.parseAsync(req.params);
        }
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return next(error);
      }
      next(error);
    }
  });
};
