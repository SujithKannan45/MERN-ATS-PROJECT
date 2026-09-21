import { Router, Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import { openApiSpecification } from './swagger.spec.js';

const router = Router();

// Swagger UI configuration options
const swaggerUiOptions: swaggerUi.SwaggerUiOptions = {
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info { margin: 20px 0 }
    .swagger-ui .info .title { color: #1d4ed8; font-family: -apple-system, BlinkMacSystemFont, sans-serif }
    .swagger-ui .scheme-container { background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px }
  `,
  customSiteTitle: 'AI ATS Platform API Documentation',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    tagsSorter: 'alpha',
  },
};

// 1. Raw OpenAPI JSON spec endpoint
router.get('/spec.json', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(openApiSpecification);
});

// 2. Mount Interactive Swagger UI
router.use('/', swaggerUi.serve, swaggerUi.setup(openApiSpecification, swaggerUiOptions));

export const swaggerRoutes = router;
