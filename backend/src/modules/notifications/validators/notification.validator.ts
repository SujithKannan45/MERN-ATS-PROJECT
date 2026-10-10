import { z } from 'zod';

export const queryNotificationSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(20),
    unreadOnly: z
      .string()
      .optional()
      .transform((val) => val === 'true'),
  }),
});
