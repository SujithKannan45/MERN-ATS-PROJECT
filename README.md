# AI-Powered ATS Resume Builder & Job Tracking Platform — Backend Foundation

Production-grade, enterprise backend foundation built with **Node.js, Express.js, TypeScript, and MongoDB (Mongoose)** following Clean Architecture, SOLID principles, and MVC design patterns.

---

## 🏛️ Architecture Overview

The backend uses a layered architecture separating concerns into distinct layers:

```
src/
├── config/             # Strongly-typed environment and database configuration
├── core/               # Cross-cutting foundational services
│   ├── errors/         # Centralized AppError hierarchy and global error handler
│   ├── logger/         # Structured Winston logger (Daily log rotation + Console)
│   └── middlewares/    # Security (Helmet, CORS, HPP, Mongo Sanitize), Morgan, Rate Limiting, Validation
├── modules/            # Vertical domain slices (e.g., Health, Auth, Resumes, AI, Jobs)
│   └── health/         # Diagnostic health check module (ALB/Kubernetes ready)
├── routes/             # Centralized versioned API route registry (/api/v1)
├── shared/             # Reusable abstractions & enterprise patterns
│   ├── repositories/   # Generic BaseRepository<T> (Repository Pattern)
│   ├── services/       # Generic BaseService<T> (Service Layer Pattern)
│   └── utils/          # Standardized JSend ApiResponse utility
├── app.ts              # Express application factory & middleware pipeline
└── server.ts           # Server bootstrap, DB lifecycle & graceful shutdown
```

---

## 📦 Prerequisites

* **Node.js**: `v20.0.0` or higher
* **MongoDB**: `v6.0+` (Local or MongoDB Atlas)
* **npm**: `v9.0.0+`

---

## 🚀 Installation & Setup

### 1. Install Dependencies

Run the following command in the `backend` directory:

```bash
npm install
```

#### Individual Package Install Commands (Reference):

```bash
# Core Production Dependencies
npm install express mongoose dotenv cors helmet compression morgan cookie-parser express-mongo-sanitize express-rate-limit hpp winston winston-daily-rotate-file zod

# Development Dependencies
npm install -D typescript tsx @types/node @types/express @types/cors @types/compression @types/morgan @types/cookie-parser @types/hpp prettier
```

### 2. Configure Environment Variables

Copy the `.env.example` file to `.env` and configure your settings:

```bash
cp .env.example .env
```

### 3. Run in Development Mode

```bash
npm run dev
```

### 4. Build and Run in Production

```bash
npm run build
npm start
```

---

## 🩺 Health Check API

| Route | Method | Description |
| :--- | :--- | :--- |
| `/health` | `GET` | Direct root probe for AWS ALB & Kubernetes |
| `/api/v1/health` | `GET` | Versioned API health diagnostic probe |

#### Sample Health Check Response:

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Service is operational",
  "data": {
    "service": "ATS Resume Platform Backend API",
    "status": "UP",
    "environment": "development",
    "timestamp": "2026-08-25T13:40:00.000Z",
    "uptimeSeconds": 42,
    "system": {
      "nodeVersion": "v20.14.0",
      "memoryUsageMB": {
        "rss": 54,
        "heapTotal": 28,
        "heapUsed": 19
      }
    },
    "dependencies": {
      "database": {
        "status": "CONNECTED",
        "readyState": 1,
        "host": "localhost",
        "databaseName": "ats_resume_platform"
      }
    }
  },
  "timestamp": "2026-08-25T13:40:00.000Z"
}
```

---

## 🛡️ Built-in Security & Resilience Features

* **Strict CORS Whitelist:** Dynamic origin validation from comma-separated environment variables.
* **Helmet Protection:** Secure HTTP headers with automated CSP configuration.
* **NoSQL Injection Defense:** Sanitization stripping `$` and `.` characters from incoming request payloads.
* **HTTP Parameter Pollution (HPP):** Protection against parameter tampering attacks.
* **Rate Limiting:** Sliding-window rate limiters with standardized `RateLimit-*` headers.
* **Graceful Shutdown:** Intercepts `SIGINT`, `SIGTERM`, and `unhandledRejection`, closing the HTTP server and disconnecting MongoDB cleanly.
