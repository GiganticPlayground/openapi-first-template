# Gaps and TODOs

## Current Implementation Status

This document tracks what's missing, what's stubbed, and what should be added to make this project production-ready.

---

## Critical Gaps

### 1. No Test Infrastructure ❌

**Status**: Completely missing

**Impact**: HIGH - Cannot verify code correctness

**What's Missing**:

- No test framework (Jest, Vitest, etc.)
- No unit tests for any code
- No integration tests for API
- No test coverage reporting
- No CI/CD testing pipeline

**Recommended Implementation**:

#### Add Vitest (Modern, Fast)

```bash
yarn add -D vitest @vitest/ui c8
```

**vitest.config.ts**:

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'c8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'dist/', '**/*.d.ts'],
    },
  },
});
```

**Example Test** (src/controllers/health.controller.test.ts):

```typescript
import { describe, it, expect } from 'vitest';
import { healthCheck } from './health.controller';

describe('Health Controller', () => {
  it('should return ok status', async () => {
    const req = {};
    const res = {
      json: vi.fn(),
    };

    await healthCheck(req as any, res as any);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ status: 'ok' }));
  });
});
```

**Priority**: HIGH - Add before implementing business logic

---

### 2. No Database Layer ❌

**Status**: Completely missing

**Impact**: HIGH - Cannot persist data

**What's Missing**:

- No database connection
- No ORM/query builder
- No migrations
- No seed data
- Controllers return mock data only

**Current Workaround**: Controllers return hardcoded mock responses

**Recommended Implementation**:

#### Option A: Prisma (Type-Safe ORM)

```bash
yarn add prisma @prisma/client
yarn add -D prisma
```

**Setup**:

```bash
npx prisma init
npx prisma migrate dev --name init
npx prisma generate
```

**schema.prisma**:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id        String   @id @default(uuid())
  name      String
  email     String   @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

**Usage in Controller**:

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getUsers = async (req, res) => {
  const users = await prisma.user.findMany({
    take: req.query.limit || 10,
    skip: req.query.offset || 0,
  });

  res.json({
    users,
    pagination: {
      /* ... */
    },
  });
};
```

#### Option B: Drizzle ORM (Lightweight)

```bash
yarn add drizzle-orm pg
yarn add -D drizzle-kit @types/pg
```

**Priority**: HIGH - Needed for real functionality

**Considerations**:

- Choose database (PostgreSQL, MySQL, SQLite)
- Set up connection pooling
- Implement migrations
- Add seed data
- Update environment variables
- Update Docker Compose (add database service)

---

### 3. No Logging System ❌

**Status**: Using console.log only

**Impact**: MEDIUM - Hard to debug production issues

**What's Missing**:

- Structured logging
- Log levels (info, warn, error, debug)
- Log aggregation
- Request logging middleware
- Error logging with context

**Current Implementation**:

```typescript
console.log('Server started');
console.error('Error occurred', error);
```

**Recommended Implementation**:

#### Add Pino (Fast Structured Logger)

```bash
yarn add pino pino-pretty
yarn add -D pino-http
```

**src/utils/logger.ts**:

```typescript
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => ({ level: label }),
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  ...(process.env.NODE_ENV === 'development' && {
    transport: {
      target: 'pino-pretty',
      options: { colorize: true },
    },
  }),
});
```

**Usage**:

```typescript
import { logger } from '../utils/logger';

logger.info({ userId: '123' }, 'User created');
logger.error({ err, userId: '123' }, 'Failed to create user');
logger.debug({ query: req.query }, 'Request received');
```

**Request Logging Middleware**:

```typescript
import pinoHttp from 'pino-http';

app.use(pinoHttp({ logger }));
```

**Priority**: MEDIUM - Important for production

---

## Stub Implementations

### 1. User Controllers ⚠️

**Status**: Scaffolds with mock data

**Location**: src/controllers/users.controller.ts

**Current Behavior**:

- All endpoints return hardcoded mock data
- No database queries
- No actual CRUD operations
- No error handling for edge cases

**Example Current Implementation**:

```typescript
export const getUsers = async (req, res) => {
  res.json({
    users: [], // Empty array
    pagination: { limit: 10, offset: 0, total: 0 },
  });
};

export const createUser = async (req, res) => {
  // Just returns the request body with a mock ID
  res.status(201).json({
    id: '123',
    ...req.body,
    createdAt: new Date().toISOString(),
  });
};
```

**What Needs Implementation**:

1. Database integration (see Gap #2)
2. Actual CRUD logic:
   - Validate input beyond OpenAPI validation
   - Check for duplicates (email uniqueness)
   - Handle not found errors (404)
   - Implement pagination properly
   - Return actual database records
3. Error handling:
   - Try-catch blocks
   - Proper error responses
   - Transaction management
4. Business logic:
   - Email validation
   - Data transformation
   - Related entity handling

**Priority**: HIGH - Core functionality

---

## Missing Features

### 1. CI/CD Pipeline ❌

**Status**: Not implemented

**What's Missing**:

- No GitHub Actions / GitLab CI
- No automated testing on PR
- No automated builds
- No automated deployment
- No quality gates

**Recommended Implementation**:

**.github/workflows/ci.yml**:

```yaml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '24'
      - run: yarn install
      - run: yarn lint
      - run: yarn type-check
      - run: yarn test
      - run: yarn build
```

**Priority**: MEDIUM - Important for team collaboration

---

### 2. API Versioning Strategy ❌

**Status**: No versioning

**What's Missing**:

- No version in API paths
- No version negotiation
- No deprecation strategy
- No backward compatibility plan

**Recommended Approach**:

#### Option A: Path Versioning

```yaml
servers:
  - url: http://localhost:3000/v1

paths:
  /v1/users:
    get: ...
```

#### Option B: Header Versioning

```yaml
parameters:
  - name: API-Version
    in: header
    schema:
      type: string
      enum: ['1.0', '2.0']
```

**Priority**: LOW (for now) - Can add when needed

---

### 3. Rate Limiting ❌

**Status**: No rate limiting

**What's Missing**:

- No request rate limits
- No throttling
- No abuse prevention

**Recommended Implementation**:

```bash
yarn add express-rate-limit
```

**src/middlewares/rateLimiter.ts**:

```typescript
import rateLimit from 'express-rate-limit';

export const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later.',
});
```

**Usage**:

```typescript
app.use('/api', limiter);
```

**Priority**: MEDIUM - Important for production

---

### 4. CORS Configuration ❌

**Status**: Basic CORS enabled, not configured

**What's Missing**:

- No origin whitelist
- No credentials configuration
- No method restrictions
- No exposed headers configuration

**Current Implementation**:

```typescript
app.use(cors()); // Allows all origins
```

**Recommended Implementation**:

```typescript
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
    credentials: true,
    maxAge: 86400,
  }),
);
```

**Priority**: LOW (for now) - Depends on frontend needs

---

### 5. Error Tracking ❌

**Status**: No error tracking service

**What's Missing**:

- No Sentry integration
- No error aggregation
- No alerting
- No error context capture

**Recommended Implementation**:

```bash
yarn add @sentry/node
```

**src/utils/sentry.ts**:

```typescript
import * as Sentry from '@sentry/node';

export const initSentry = () => {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 1.0,
  });
};
```

**Usage in Error Handler**:

```typescript
export const errorHandler = (err, req, res, next) => {
  Sentry.captureException(err, {
    contexts: {
      request: {
        url: req.url,
        method: req.method,
        headers: req.headers,
      },
    },
  });

  // ... error response
};
```

**Priority**: MEDIUM - Very useful for production

---

### 6. Monitoring & Metrics ❌

**Status**: No metrics collection

**What's Missing**:

- No Prometheus metrics
- No performance monitoring
- No APM (Application Performance Monitoring)
- No alerting

**Recommended Implementation**:

```bash
yarn add prom-client
```

**src/utils/metrics.ts**:

```typescript
import { register, Counter, Histogram } from 'prom-client';

export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status'],
});

export const httpRequestTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status'],
});

// Expose endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});
```

**Priority**: MEDIUM - Important for observability

---

### 7. API Documentation Beyond Swagger ❌

**Status**: Only Swagger UI

**What's Missing**:

- No getting started guide
- No example requests/responses
- No authentication guide
- No error code reference
- No changelog

**Recommended Additions**:

- docs/api-guide.md - Human-readable API documentation
- docs/examples/ - Request/response examples
- docs/changelog.md - API version history
- Postman collection
- ReDoc (alternative to Swagger UI)

**Priority**: LOW - Current Swagger UI is sufficient for now

---

### 8. Input Sanitization ❌

**Status**: Only OpenAPI validation

**What's Missing**:

- No XSS prevention
- No SQL injection prevention (no database yet)
- No input trimming/normalization
- No HTML sanitization

**Recommended Implementation**:

```bash
yarn add validator
yarn add @types/validator
```

**src/utils/sanitize.ts**:

```typescript
import validator from 'validator';

export const sanitizeString = (input: string): string => {
  return validator.escape(validator.trim(input));
};

export const sanitizeEmail = (email: string): string => {
  return validator.normalizeEmail(email) || email;
};
```

**Priority**: MEDIUM - Important for security

---

### 9. Request Validation Beyond OpenAPI ❌

**Status**: Only schema validation

**What's Missing**:

- No business rule validation
- No duplicate checks
- No foreign key validation
- No custom validation logic

**Example Needed**:

```typescript
export const createUser = async (req, res) => {
  // OpenAPI validates schema, but not business rules
  // Need to add:
  // - Check if email already exists
  // - Validate email domain (if business rule)
  // - Check if related entities exist
  // - Apply custom business logic
};
```

**Priority**: HIGH - Needed with database implementation

---

## Security Gaps

### 1. API Key Management ⚠️

**Current Status**: File-based, basic

**Limitations**:

- Keys stored in plain text JSON
- No key rotation mechanism
- No expiration dates
- No usage tracking
- No key scopes/permissions

**Recommended Improvements**:

1. Hash API keys in storage
2. Add expiration timestamps
3. Implement key rotation
4. Add usage limits per key
5. Track key usage (logs/metrics)
6. Add key scopes (read/write permissions)

**Priority**: HIGH - Security risk

---

### 2. Authentication Schemes ❌

**Current Status**: Only API key auth

**What's Missing**:

- No JWT authentication
- No OAuth 2.0
- No session management
- No user authentication (only API keys)
- No refresh tokens

**Considerations**:

- API keys: Good for service-to-service
- JWT: Good for user authentication
- OAuth: Good for third-party integrations

**Priority**: MEDIUM - Depends on use case

---

### 3. Authorization ❌

**Status**: No authorization layer

**What's Missing**:

- No role-based access control (RBAC)
- No permission checking
- No resource-level authorization
- All authenticated users have full access

**Recommended Implementation**:

```typescript
// src/middlewares/authorize.ts
export const requireRole = (...roles: string[]) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
};

// Usage
app.delete('/users/:id', requireRole('admin'), deleteUser);
```

**Priority**: MEDIUM - Depends on security requirements

---

### 4. HTTPS/TLS ❌

**Status**: HTTP only

**What's Missing**:

- No TLS/SSL configuration
- No certificate management
- No HTTPS redirect

**Note**: Usually handled by reverse proxy (nginx, ALB, etc.)

**Priority**: HIGH for production - Critical security requirement

---

### 5. Security Headers ⚠️

**Status**: Basic helmet defaults

**What Could Be Added**:

- Content Security Policy (CSP)
- Subresource Integrity (SRI)
- Custom security headers
- HSTS (Strict-Transport-Security)

**Current**:

```typescript
app.use(helmet()); // Defaults only
```

**Enhanced**:

```typescript
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  }),
);
```

**Priority**: MEDIUM - Depends on security requirements

---

## Performance Gaps

### 1. Caching ❌

**Status**: No caching layer

**What's Missing**:

- No Redis integration
- No response caching
- No cache invalidation
- No CDN integration

**Priority**: LOW (for now) - Add when needed for scale

---

### 2. Database Connection Pooling ❌

**Status**: No database yet

**What's Needed**:

- Connection pool configuration
- Connection reuse
- Pool size limits
- Idle connection handling

**Priority**: HIGH when adding database

---

### 3. Response Compression ❌

**Status**: No compression

**Recommended**:

```bash
yarn add compression
```

```typescript
import compression from 'compression';
app.use(compression());
```

**Priority**: LOW - Nice to have

---

### 4. Build Optimization ❌

**Status**: TypeScript runs directly (tsx)

**What Could Be Optimized**:

- Compile to JavaScript for production
- Minify output
- Tree-shaking
- Code splitting
- Smaller Docker image (multi-stage build)

**Priority**: MEDIUM - Impacts production performance

---

## Documentation Gaps

### 1. API Examples ⚠️

**Status**: Swagger UI only

**What Could Be Added**:

- Curl examples in README
- Postman collection
- Language-specific examples (Python, JS, etc.)
- Common use case tutorials

**Priority**: LOW - Swagger UI covers basics

---

### 2. Architecture Diagrams ❌

**Status**: Text descriptions only

**What Could Be Added**:

- System architecture diagram
- Request flow diagram
- Database schema diagram (when added)
- Deployment architecture

**Priority**: LOW - Nice to have

---

### 3. Runbook ❌

**Status**: No operational documentation

**What's Missing**:

- Troubleshooting guide
- Common errors and solutions
- Incident response procedures
- Monitoring dashboard guide
- Alerting setup

**Priority**: MEDIUM - Important for production operations

---

## Development Experience Gaps

### 1. Hot Reload for OpenAPI Changes ⚠️

**Status**: Manual regeneration required

**Current Workflow**:

1. Edit api/openapi.yaml
2. Run `yarn generate`
3. Server auto-restarts

**Improvement**:

- Auto-run `yarn generate` on OpenAPI changes
- Watch api/ folder for changes

**Priority**: LOW - Current workflow is acceptable

---

### 2. Development Seed Data ❌

**Status**: No seed data

**What's Missing**:

- Sample users
- Test API keys
- Development fixtures

**Priority**: MEDIUM when database added

---

### 3. API Client Generation ❌

**Status**: No generated clients

**What Could Be Added**:

- TypeScript client generation
- Python client generation
- OpenAPI code generators for various languages

**Tools**:

- openapi-typescript-codegen
- openapi-generator

**Priority**: LOW - Not critical

---

## Summary of Priorities

### 🔴 HIGH Priority (Blockers)

1. **Test Infrastructure** - Cannot verify correctness
2. **Database Layer** - Cannot persist data
3. **User Controller Implementation** - Core functionality
4. **API Key Security** - Security risk
5. **Input Validation** - Security & data integrity

### 🟡 MEDIUM Priority (Important)

1. **Logging System** - Debugging & monitoring
2. **Error Tracking** - Production support
3. **Monitoring/Metrics** - Observability
4. **CI/CD Pipeline** - Team workflow
5. **Rate Limiting** - Abuse prevention
6. **Authorization** - Access control

### 🟢 LOW Priority (Nice to Have)

1. **API Versioning** - Add when needed
2. **Response Compression** - Performance optimization
3. **API Documentation** - Current Swagger UI sufficient
4. **Caching** - Add when scale requires
5. **Development Tools** - Quality of life improvements

---

## Next Steps for Agents

When implementing new features, prioritize in this order:

1. **Foundation**: Tests, Database, Logging
2. **Core Features**: Implement actual business logic
3. **Security**: Authorization, Key management
4. **Operations**: Monitoring, Error tracking, CI/CD
5. **Performance**: Caching, Optimization
6. **Developer Experience**: Better tooling, Documentation

Always refer to this document when planning new features to avoid duplicating work or missing critical dependencies.
