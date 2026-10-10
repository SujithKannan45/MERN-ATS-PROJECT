import { envConfig } from '../config/env.config.js';

export const openApiSpecification = {
  openapi: '3.0.3',
  info: {
    title: 'AI-Powered ATS Resume Builder & Job Tracking Platform API',
    version: '1.0.0',
    description: `
Enterprise-grade REST API backend for an AI-Powered Applicant Tracking System (ATS) Resume Builder and Job Tracking Platform.
Built with Node.js, Express.js, TypeScript, MongoDB, and Google Gemini AI.

### Architectural Features:
- **Clean Architecture & SOLID Principles**
- **JWT Authentication with Refresh Token Rotation (Cookie & Bearer)**
- **Role-Based Access Control (Candidate, Recruiter, Admin)**
- **Resume Upload & Parsing (PDF, DOC, DOCX via Cloudinary)**
- **Gemini 1.5 Flash AI Engine for ATS Scoring & Job Matching**
- **Full Job Application Lifecycle Tracking & Kanban Analytics**
- **Application Analytics Dashboard & Frontend Chart Metrics**
- **Notification System & Responsive HTML Email Notifications**
- **Enterprise Security (Hardened Helmet, CSP, Rate Limiting, NoSQL & XSS Sanitization)**
- **Real-Time System Monitoring & Audit Trail Logging**
    `,
    contact: {
      name: 'Antigravity Engineering',
      url: 'https://github.com/SujithKannan45/MERN-ATS-PROJECT',
    },
    license: {
      name: 'ISC',
    },
  },
  servers: [
    {
      url: `http://localhost:${envConfig.PORT}`,
      description: 'Local Development Server',
    },
    {
      url: `http://localhost:${envConfig.PORT}${envConfig.API_PREFIX}`,
      description: 'Versioned API Root (/api/v1)',
    },
  ],
  tags: [
    { name: 'Health', description: 'System health check and live monitoring metrics' },
    { name: 'Authentication', description: 'User registration, login, token refresh, and password management' },
    { name: 'Resumes', description: 'Resume document upload, parsing, metadata, and Cloudinary storage' },
    { name: 'AI Analysis', description: 'Google Gemini ATS scoring, section evaluation, and match history' },
    { name: 'Jobs', description: 'Job application pipeline tracker, status milestones, and AI job matching' },
    { name: 'Dashboard', description: 'Aggregated candidate analytics and time-series chart data' },
    { name: 'Notifications', description: 'In-app notification triggers, unread counters, and status mutations' },
    { name: 'Audit Logs', description: 'Security audit trail and user activity records' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Provide your JWT access token (Bearer <token>)',
      },
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'accessToken',
        description: 'HTTP-only secure session cookie',
      },
      geminiApiKeyHeader: {
        type: 'apiKey',
        in: 'header',
        name: 'x-gemini-api-key',
        description: 'Optional custom user-supplied Google Gemini API key for dynamic quotas',
      },
    },
    schemas: {
      StandardResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Operation completed successfully' },
          data: { type: 'object' },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          status: { type: 'string', example: 'fail' },
          statusCode: { type: 'integer', example: 400 },
          message: { type: 'string', example: 'Validation failed' },
          details: { type: 'object' },
        },
      },
      RegisterRequest: {
        type: 'object',
        required: ['fullName', 'email', 'password'],
        properties: {
          fullName: { type: 'string', example: 'Alex Morgan' },
          email: { type: 'string', format: 'email', example: 'alex@example.com' },
          password: { type: 'string', minLength: 8, example: 'StrongP@ssw0rd!' },
          role: { type: 'string', enum: ['candidate', 'recruiter', 'admin'], default: 'candidate' },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'alex@example.com' },
          password: { type: 'string', example: 'StrongP@ssw0rd!' },
        },
      },
      ForgotPasswordRequest: {
        type: 'object',
        required: ['email'],
        properties: {
          email: { type: 'string', format: 'email', example: 'alex@example.com' },
        },
      },
      ResetPasswordRequest: {
        type: 'object',
        required: ['token', 'newPassword'],
        properties: {
          token: { type: 'string', example: 'd3f5a1...' },
          newPassword: { type: 'string', minLength: 8, example: 'NewStrongP@ss1!' },
        },
      },
      ChangePasswordRequest: {
        type: 'object',
        required: ['currentPassword', 'newPassword'],
        properties: {
          currentPassword: { type: 'string', example: 'StrongP@ssw0rd!' },
          newPassword: { type: 'string', minLength: 8, example: 'NewStrongP@ss1!' },
        },
      },
      VerifyEmailRequest: {
        type: 'object',
        required: ['token'],
        properties: {
          token: { type: 'string', example: '3a8f9c...' },
        },
      },
      CreateJobRequest: {
        type: 'object',
        required: ['companyName', 'jobTitle'],
        properties: {
          companyName: { type: 'string', example: 'Google' },
          jobTitle: { type: 'string', example: 'Senior Full Stack Engineer' },
          jobDescription: { type: 'string', example: 'We are seeking a senior engineer proficient in Node.js and React...' },
          jobUrl: { type: 'string', format: 'uri', example: 'https://careers.google.com/jobs/12345' },
          employmentType: { type: 'string', enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance', 'Temporary', 'Other'], default: 'Full-time' },
          workplaceType: { type: 'string', enum: ['Remote', 'Hybrid', 'On-site'], default: 'Remote' },
          location: { type: 'string', example: 'Mountain View, CA' },
          salary: {
            type: 'object',
            properties: {
              min: { type: 'number', example: 140000 },
              max: { type: 'number', example: 180000 },
              currency: { type: 'string', example: 'USD' },
              period: { type: 'string', enum: ['hourly', 'monthly', 'yearly'], example: 'yearly' },
            },
          },
          requiredSkills: {
            type: 'array',
            items: { type: 'string' },
            example: ['TypeScript', 'Node.js', 'React', 'MongoDB'],
          },
          status: {
            type: 'string',
            enum: ['Saved', 'Applied', 'Interview Scheduled', 'Interview Completed', 'Offer Received', 'Rejected', 'Accepted', 'Archived'],
            default: 'Saved',
          },
          priority: { type: 'string', enum: ['Low', 'Medium', 'High'], default: 'Medium' },
          notes: { type: 'string', example: 'Referred by senior software engineer.' },
        },
      },
      AiAnalyzeResumeRequest: {
        type: 'object',
        properties: {
          targetJobTitle: { type: 'string', example: 'Staff Backend Architect' },
          jobDescription: { type: 'string', example: 'Architect scalable distributed systems using Node.js and MongoDB...' },
          customApiKey: { type: 'string', example: 'AIzaSy...' },
        },
      },
    },
  },
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Root liveness & monitoring probe',
        description: 'Returns real-time system metrics, memory consumption (RSS/Heap), CPU usage, process details, and MongoDB connection ping latency.',
        responses: {
          200: { description: 'System is fully operational' },
          503: { description: 'Service degraded or database disconnected' },
        },
      },
    },
    '/api/v1/health': {
      get: {
        tags: ['Health'],
        summary: 'Versioned API health check probe',
        description: 'Alias to root health probe under API v1 prefix.',
        responses: {
          200: { description: 'Operational' },
        },
      },
    },
    '/api/v1/auth/register': {
      post: {
        tags: ['Authentication'],
        summary: 'Register new user account',
        description: 'Registers candidate, recruiter, or admin with email verification and secure JWT cookie issuance.',
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/RegisterRequest' } },
          },
        },
        responses: {
          201: { description: 'Account registered successfully' },
          409: { description: 'Email already exists' },
          422: { description: 'Input validation error' },
          429: { description: 'Rate limit exceeded' },
        },
      },
    },
    '/api/v1/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'Log in to account',
        description: 'Authenticates credentials, generates JWT access and refresh tokens, sets HTTP-only cookies, and logs audit record.',
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } },
          },
        },
        responses: {
          200: { description: 'Authenticated successfully' },
          401: { description: 'Invalid email or password' },
          429: { description: 'Rate limit exceeded' },
        },
      },
    },
    '/api/v1/auth/logout': {
      post: {
        tags: ['Authentication'],
        summary: 'Log out current session',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: {
          200: { description: 'Logged out successfully' },
        },
      },
    },
    '/api/v1/auth/refresh-token': {
      post: {
        tags: ['Authentication'],
        summary: 'Rotate and refresh access token',
        description: 'Rotates refresh token and issues a new access token while detecting replay attacks.',
        responses: {
          200: { description: 'Token refreshed' },
          401: { description: 'Invalid or expired token' },
        },
      },
    },
    '/api/v1/auth/forgot-password': {
      post: {
        tags: ['Authentication'],
        summary: 'Request password reset token',
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/ForgotPasswordRequest' } },
          },
        },
        responses: {
          200: { description: 'Reset instructions dispatched if account exists' },
        },
      },
    },
    '/api/v1/auth/reset-password': {
      post: {
        tags: ['Authentication'],
        summary: 'Reset password with token',
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/ResetPasswordRequest' } },
          },
        },
        responses: {
          200: { description: 'Password reset successfully' },
          400: { description: 'Invalid or expired token' },
        },
      },
    },
    '/api/v1/auth/change-password': {
      post: {
        tags: ['Authentication'],
        summary: 'Change password for logged-in user',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/ChangePasswordRequest' } },
          },
        },
        responses: {
          200: { description: 'Password changed successfully' },
          400: { description: 'Incorrect current password' },
        },
      },
    },
    '/api/v1/auth/verify-email': {
      post: {
        tags: ['Authentication'],
        summary: 'Verify email address',
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/VerifyEmailRequest' } },
          },
        },
        responses: {
          200: { description: 'Email verified' },
          400: { description: 'Invalid token' },
        },
      },
    },
    '/api/v1/resumes/upload': {
      post: {
        tags: ['Resumes'],
        summary: 'Upload and parse candidate resume',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        description: 'Uploads PDF, DOC, or DOCX document (up to 5MB) to Cloudinary, extracts text, and initializes profile.',
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  resume: { type: 'string', format: 'binary', description: 'Resume file (PDF, DOC, DOCX)' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Resume uploaded and parsed' },
          400: { description: 'Invalid file format or empty file' },
          409: { description: 'Resume already exists. Use PUT /update to replace.' },
          429: { description: 'Upload rate limit reached' },
        },
      },
    },
    '/api/v1/resumes/update': {
      put: {
        tags: ['Resumes'],
        summary: 'Replace existing resume document',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  resume: { type: 'string', format: 'binary' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Resume replaced with incremented version' },
        },
      },
    },
    '/api/v1/resumes/me': {
      get: {
        tags: ['Resumes'],
        summary: 'Get current user active resume details',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: {
          200: { description: 'Resume details retrieved' },
          404: { description: 'No active resume found' },
        },
      },
    },
    '/api/v1/resumes/metadata': {
      get: {
        tags: ['Resumes'],
        summary: 'Get resume metadata without full text',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: {
          200: { description: 'Metadata retrieved' },
        },
      },
    },
    '/api/v1/resumes/download': {
      get: {
        tags: ['Resumes'],
        summary: 'Get secure Cloudinary download URL',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: {
          200: { description: 'Download URL generated' },
        },
      },
    },
    '/api/v1/resumes/delete': {
      delete: {
        tags: ['Resumes'],
        summary: 'Delete resume document and Cloudinary asset',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: {
          200: { description: 'Resume purged' },
        },
      },
    },
    '/api/v1/ai/analyze': {
      post: {
        tags: ['AI Analysis'],
        summary: 'Perform AI ATS analysis using Google Gemini',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }, { geminiApiKeyHeader: [] }],
        description: 'Analyzes resume against target job opening, returning 0-100 score, section scores, keyword density, and actionable suggestions.',
        requestBody: {
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/AiAnalyzeResumeRequest' } },
          },
        },
        responses: {
          200: { description: 'ATS evaluation completed' },
          400: { description: 'Resume missing or empty' },
          429: { description: 'Gemini rate limit or quota exceeded' },
        },
      },
    },
    '/api/v1/ai/history': {
      get: {
        tags: ['AI Analysis'],
        summary: 'List user historical resume analysis reports',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
        ],
        responses: {
          200: { description: 'History list retrieved' },
        },
      },
    },
    '/api/v1/ai/history/{id}': {
      get: {
        tags: ['AI Analysis'],
        summary: 'Get single ATS analysis report by ID',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Report details' },
          404: { description: 'Report not found' },
        },
      },
      delete: {
        tags: ['AI Analysis'],
        summary: 'Delete analysis report by ID',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Report deleted' },
        },
      },
    },
    '/api/v1/jobs': {
      post: {
        tags: ['Jobs'],
        summary: 'Track a new job opening',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/CreateJobRequest' } },
          },
        },
        responses: {
          201: { description: 'Job added to tracker' },
          422: { description: 'Validation error' },
        },
      },
      get: {
        tags: ['Jobs'],
        summary: 'List all tracked jobs with filters and pagination',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'status', in: 'query', schema: { type: 'string' } },
          { name: 'priority', in: 'query', schema: { type: 'string' } },
          { name: 'workplaceType', in: 'query', schema: { type: 'string' } },
          { name: 'employmentType', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Paginated job listings' },
        },
      },
    },
    '/api/v1/jobs/dashboard': {
      get: {
        tags: ['Jobs'],
        summary: 'Get job pipeline aggregate statistics',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        description: 'Returns count of Saved, Applied, Interviews, Offers, Rejections, and Accepted jobs.',
        responses: {
          200: { description: 'Job metrics retrieved' },
        },
      },
    },
    '/api/v1/jobs/{id}': {
      get: {
        tags: ['Jobs'],
        summary: 'Get job details by ID',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Job details' },
          404: { description: 'Job not found' },
        },
      },
      put: {
        tags: ['Jobs'],
        summary: 'Update job opening details and status',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/CreateJobRequest' } },
          },
        },
        responses: {
          200: { description: 'Job updated' },
        },
      },
      delete: {
        tags: ['Jobs'],
        summary: 'Delete tracked job',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Job deleted' },
        },
      },
    },
    '/api/v1/jobs/{id}/match': {
      post: {
        tags: ['Jobs'],
        summary: 'AI semantic job match against candidate resume',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }, { geminiApiKeyHeader: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Match percentage, missing skills, and ATS alignment' },
        },
      },
    },
    '/api/v1/dashboard': {
      get: {
        tags: ['Dashboard'],
        summary: 'Comprehensive candidate analytics overview',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        description: 'Returns composite metrics for Resumes (scores/latest), Jobs (status counts), and AI (match averages/missing skills).',
        responses: {
          200: { description: 'Dashboard metrics retrieved' },
        },
      },
    },
    '/api/v1/dashboard/charts': {
      get: {
        tags: ['Dashboard'],
        summary: 'Datasets formatted for frontend charts',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        description: 'Returns Monthly Applications, Monthly Uploads, ATS Score Trend, Job Status Distribution, Top Skills, and Missing Skills Frequency.',
        responses: {
          200: { description: 'Charts dataset retrieved' },
        },
      },
    },
    '/api/v1/notifications': {
      get: {
        tags: ['Notifications'],
        summary: 'Get candidate in-app notifications',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
          { name: 'unreadOnly', in: 'query', schema: { type: 'boolean', default: false } },
        ],
        responses: {
          200: { description: 'Notifications list' },
        },
      },
    },
    '/api/v1/notifications/unread-count': {
      get: {
        tags: ['Notifications'],
        summary: 'Get real-time count of unread notifications',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: {
          200: { description: 'Count of unread alerts' },
        },
      },
    },
    '/api/v1/notifications/read-all': {
      patch: {
        tags: ['Notifications'],
        summary: 'Mark all notifications as read',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: {
          200: { description: 'All notifications marked read' },
        },
      },
    },
    '/api/v1/notifications/{id}/read': {
      patch: {
        tags: ['Notifications'],
        summary: 'Mark single notification as read',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Notification marked read' },
        },
      },
    },
    '/api/v1/notifications/{id}': {
      delete: {
        tags: ['Notifications'],
        summary: 'Delete notification',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Notification removed' },
        },
      },
    },
    '/api/v1/audit-logs/me': {
      get: {
        tags: ['Audit Logs'],
        summary: 'Get current user security activity logs',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
        ],
        responses: {
          200: { description: 'User audit history' },
        },
      },
    },
    '/api/v1/audit-logs': {
      get: {
        tags: ['Audit Logs'],
        summary: 'Get system-wide audit logs (Admin only)',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
          { name: 'action', in: 'query', schema: { type: 'string' } },
          { name: 'status', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'System audit logs' },
          403: { description: 'Forbidden: Admins only' },
        },
      },
    },
  },
};
