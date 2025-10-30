# Architecture

## High-Level Architecture

This project follows an **API-First Architecture** where the OpenAPI specification is the single source of truth that drives code generation, validation, and type safety.

```
┌─────────────────────────────────────────────────────────────┐
│                      OpenAPI Spec                           │
│                  (api/openapi.yaml)                         │
│                 [Single Source of Truth]                    │
└────────────────┬───────────────────┬────────────────────────┘
                 │                   │
                 ↓                   ↓
    ┌────────────────────┐  ┌──────────────────┐
    │  Type Generation   │  │    Controller    │
    │ (openapi-typescript)│  │   Generation    │
    │                    │  │  (custom script) │
    └─────────┬──────────┘  └────────┬─────────┘
              │                       │
              ↓                       ↓
    ┌─────────────────┐     ┌─────────────────┐
    │  schema.d.ts    │     │  *.controller.ts│
    │  (auto-gen)     │     │  (auto-gen)     │
    └─────────────────┘     └─────────────────┘
                 │                   │
                 └──────────┬────────┘
                            ↓
                 ┌──────────────────────┐
                 │   Express App        │
                 │  (src/index.ts)      │
                 └──────────────────────┘
```

## Request Flow

Every API request flows through multiple layers:

```
Client Request
    ↓
┌─────────────────────────────────────┐
│  1. Express Middleware              │
│     - helmet (security headers)     │
│     - cors (CORS handling)          │
│     - JSON body parser              │
└─────────────────┬───────────────────┘
                  ↓
┌─────────────────────────────────────┐
│  2. Authentication Middleware       │
│     - API Key validation            │
│     - Security requirements check   │
│     src/auth/middlewares/           │
└─────────────────┬───────────────────┘
                  ↓
┌─────────────────────────────────────┐
│  3. OpenAPI Validator Middleware    │
│     - Request validation            │
│     - Path parameter validation     │
│     - Query parameter validation    │
│     - Request body validation       │
│     express-openapi-validator       │
└─────────────────┬───────────────────┘
                  ↓
┌─────────────────────────────────────┐
│  4. Route Handler (Controller)      │
│     - Business logic                │
│     - Data processing               │
│     src/controllers/*.controller.ts │
└─────────────────┬───────────────────┘
                  ↓
┌─────────────────────────────────────┐
│  5. Response Validation             │
│     - Response schema validation    │
│     - Status code validation        │
│     express-openapi-validator       │
└─────────────────┬───────────────────┘
                  ↓
┌─────────────────────────────────────┐
│  6. Error Handling Middleware       │
│     - Catch validation errors       │
│     - Format error responses        │
│     src/middlewares/                │
└─────────────────┬───────────────────┘
                  ↓
            Client Response
```

## Design Patterns

### 1. API-First (Contract-First) Pattern

**Principle**: Define the API contract before writing any implementation code.

**How It Works**:

1. Write OpenAPI spec (api/openapi.yaml)
2. Generate types and scaffolds from spec
3. Implement controllers using generated types
4. Validation happens automatically based on spec

**Benefits**:

- API documentation always matches implementation
- Frontend and backend can develop in parallel
- Types are always in sync with API contract
- No manual validation code needed

**Implementation**:

- Spec location: api/openapi.yaml
- Type generation: `yarn gen-types`
- Controller generation: `yarn gen-controllers`
- Combined: `yarn generate`

### 2. Code Generation Pattern

**Principle**: Never manually write code that can be generated from the spec.

**Generated Files** (never manually edit):

- `src/types/schema.d.ts` - All TypeScript types
- `src/controllers/*.controller.ts` - Controller scaffolds (only on first run)

**Manual Files** (safe to edit):

- Controllers (after initial generation) - Implement business logic
- Middleware - Custom request/response processing
- Configuration - App setup and env validation

**Generation Flow**:

```javascript
// scripts/generate-controllers.js
OpenAPI Spec
    ↓
Parse YAML
    ↓
Extract Operations (paths + methods)
    ↓
For each operation:
    - Read operationId (e.g., "getUsers")
    - Read tags (e.g., ["users"])
    - Extract parameters, body, responses
    ↓
Generate typed controller:
    - Import generated types
    - Create request/response type helpers
    - Export handler function with type safety
    ↓
Write to src/controllers/{tag}.controller.ts
(Only if file doesn't exist)
```

### 3. Layered Architecture

**Layers**:

1. **Entry Point Layer** (src/index.ts)
   - App initialization
   - Middleware setup
   - Server startup

2. **Middleware Layer** (src/middlewares/)
   - Cross-cutting concerns
   - Request/response transformation
   - Error handling

3. **Authentication Layer** (src/auth/)
   - Security enforcement
   - API key validation
   - Authorization logic

4. **Controller Layer** (src/controllers/)
   - Request handling
   - Business logic
   - Response formatting

5. **Configuration Layer** (src/config/)
   - Environment validation
   - App settings
   - Runtime configuration

6. **Type Layer** (src/types/)
   - Generated type definitions
   - Type helpers
   - API contracts

### 4. Type Safety Pattern

**End-to-End Type Safety**:

```typescript
// 1. Types generated from OpenAPI
// src/types/schema.d.ts (auto-generated)
export interface paths {
  '/users': {
    get: operations['getUsers'];
    post: operations['createUser'];
  };
}

// 2. Helper types extract operation types
// src/controllers/users.controller.ts
type GetUsersRequest = ApiRequest<'getUsers'>;
type GetUsersResponse = ApiResponse<'getUsers'>;

// 3. Handlers are fully typed
export const getUsers = async (req: GetUsersRequest, res: GetUsersResponse) => {
  // req.query is typed (limit, offset)
  // res.json() expects correct response schema
};
```

**Type Flow**:

```
OpenAPI Schema
    ↓
openapi-typescript
    ↓
schema.d.ts (paths, components, operations)
    ↓
Type Helpers (ApiRequest, ApiResponse)
    ↓
Controller Functions (fully typed)
    ↓
Runtime Validation (express-openapi-validator)
```

## OpenAPI Extensions

This project uses custom OpenAPI extensions to bridge OpenAPI and Express:

### x-eov-operation-id

**Purpose**: Maps OpenAPI operations to controller functions.

**Example**:

```yaml
paths:
  /users:
    get:
      operationId: getUsers # Function name
      x-eov-operation-id: getUsers # Required by express-openapi-validator
```

### x-eov-operation-handler

**Purpose**: Specifies which controller file contains the handler.

**Example**:

```yaml
paths:
  /users:
    get:
      x-eov-operation-handler: controllers/users # Relative to src/
```

**Resolution**:

- Base path: src/
- Handler: controllers/users
- Full path: src/controllers/users
- Import: src/controllers/users.controller.ts
- Function: Named export matching operationId

## Configuration Management

### Environment Validation Pattern

**Fail-Fast Approach**: Validate all environment variables at startup.

```typescript
// src/config/env.ts
import { z } from 'zod';

// 1. Define schema
const envSchema = z.object({
  PORT: z.string().transform(Number),
  NODE_ENV: z.enum(['development', 'production', 'test']),
  API_KEYS_FILE: z.string(),
});

// 2. Parse and validate
const parsed = envSchema.safeParse(process.env);

// 3. Fail if invalid
if (!parsed.success) {
  throw new Error('Invalid environment variables');
}

// 4. Export typed config
export const env = parsed.data;
```

**Benefits**:

- Catch configuration errors immediately
- TypeScript types for all env vars
- Self-documenting configuration
- Safe access throughout app

### Configuration Files

- `.env` - Local development overrides (gitignored)
- `.env.example` - Template for required variables
- `config/api-keys.json` - API key storage (gitignored)
- `config/api-keys.example.json` - Template

## Error Handling Architecture

### Error Flow

```
Error Occurs
    ↓
Is it an OpenAPI validation error?
    ├─ Yes → Formatted by express-openapi-validator
    │         (400 with detailed validation errors)
    │
    └─ No → Caught by error middleware
              ↓
        Is it operational?
        ├─ Yes → Format as API error (400-499)
        └─ No → Log and return 500
```

### Error Middleware

Location: src/middlewares/errorHandler.ts (if exists)

**Pattern**:

```typescript
export const errorHandler = (err, req, res, next) => {
  // 1. Log error
  console.error(err);

  // 2. Check if OpenAPI validation error
  if (err.status && err.errors) {
    return res.status(err.status).json({
      error: 'Validation failed',
      details: err.errors,
    });
  }

  // 3. Default error response
  res.status(500).json({
    error: 'Internal server error',
  });
};
```

## Security Architecture

### Defense in Depth

Multiple security layers:

1. **helmet** - HTTP security headers
   - XSS protection
   - Content Security Policy
   - No sniffing
   - Frame options

2. **CORS** - Cross-origin controls
   - Configurable origins
   - Credentials handling
   - Method restrictions

3. **API Keys** - Authentication
   - Header-based (X-API-Key)
   - File-based storage
   - Per-endpoint security
   - Integrated with OpenAPI security schemes

4. **Validation** - Input sanitization
   - Schema validation
   - Type coercion
   - Injection prevention

5. **Express Best Practices**
   - No default error messages in production
   - No stack traces exposed
   - Trust proxy configured

### Authentication Flow

```
Request with X-API-Key header
    ↓
API Key Middleware (src/auth/middlewares/apiKeyAuth.ts)
    ↓
Load keys from config/api-keys.json
    ↓
Extract key from header
    ↓
Validate key exists and is active
    ↓
├─ Valid → Continue to next middleware
└─ Invalid → Return 401 Unauthorized
```

## Middleware Execution Order

**Critical**: Middleware order matters in Express.

```typescript
// src/index.ts
app.use(helmet());           // 1. Security headers (first!)
app.use(cors());             // 2. CORS
app.use(express.json());     // 3. Body parsing
app.use('/api-docs', ...);   // 4. Documentation (before auth)

// 5. OpenAPI Validator
app.use(OpenApiValidator.middleware({
  apiSpec: './api/openapi.yaml',
  validateRequests: true,
  validateResponses: true,
  validateSecurity: {
    handlers: {
      ApiKeyAuth: apiKeyAuth  // 6. Auth handler
    }
  }
}));

// 7. Error handler (last!)
app.use(errorHandler);
```

## Application Lifecycle

### Startup Sequence

```
1. Load environment variables (.env)
    ↓
2. Validate environment (src/config/env.ts)
    ↓
3. Initialize Express app
    ↓
4. Apply security middleware (helmet, cors)
    ↓
5. Apply body parsing middleware
    ↓
6. Mount Swagger UI (/api-docs)
    ↓
7. Initialize OpenAPI Validator
    ↓
8. Load API keys (src/auth/services/apiKeyService.ts)
    ↓
9. Register authentication handlers
    ↓
10. Mount routes (automatic via OpenAPI)
    ↓
11. Register error handler
    ↓
12. Start HTTP server
    ↓
13. Log server URL and health check
```

### Health Check

**Endpoint**: GET /health
**Purpose**: Container/orchestrator health monitoring
**Auth**: Public (no API key required)
**Response**:

```json
{
  "status": "ok",
  "timestamp": "2025-10-30T12:00:00.000Z"
}
```

**Implementation**: src/controllers/health.controller.ts

## Code Organization Principles

1. **Separation of Concerns**
   - Each layer has single responsibility
   - No business logic in middleware
   - No middleware logic in controllers

2. **Dependency Direction**
   - Controllers depend on types
   - Middleware depends on config
   - Config depends on nothing

3. **Barrel Exports**
   - Each folder has index.ts
   - Clean import paths
   - Example: `import { env } from './config'`

4. **Type-First**
   - Types defined before implementation
   - No `any` types allowed (strict mode)
   - Generated types are source of truth

5. **Explicit Over Implicit**
   - No auto-imports without types
   - Explicit error handling
   - Clear middleware ordering

## Scalability Considerations

### Current Architecture Supports

- Multiple API versions (via path prefix)
- Additional authentication schemes
- Multiple OpenAPI specs (monorepo style)
- Middleware composition
- Modular controllers

### Architecture Does NOT Support (Yet)

- Database persistence (no layer exists)
- Caching (no Redis integration)
- Message queues (no async processing)
- Service-to-service auth (only API keys)
- Rate limiting (no implementation)
- API versioning strategy (not defined)

See [07-GAPS-AND-TODOS.md](./07-GAPS-AND-TODOS.md) for expansion plans.
