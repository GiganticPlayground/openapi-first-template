# Codebase Map

## Directory Structure

```
openapi-first-poc/
├── api/                          # API Specifications
│   └── openapi.yaml             # OpenAPI 3.1.0 spec (source of truth)
│
├── src/                          # Source code
│   ├── auth/                    # Authentication system
│   │   ├── middlewares/         # Auth middleware
│   │   │   └── apiKeyAuth.ts   # API key validation middleware
│   │   ├── services/            # Auth business logic
│   │   │   └── apiKeyService.ts # Key loading/validation
│   │   ├── types.ts             # Auth type definitions
│   │   ├── index.ts             # Barrel export
│   │   └── README.md            # Auth documentation
│   │
│   ├── config/                  # Configuration
│   │   ├── env.ts               # Environment validation (Zod)
│   │   └── index.ts             # Barrel export
│   │
│   ├── controllers/             # Request handlers
│   │   ├── health.controller.ts # Health check endpoint
│   │   ├── users.controller.ts  # User CRUD operations
│   │   └── index.ts             # Barrel export
│   │
│   ├── middlewares/             # Express middleware
│   │   ├── errorHandler.ts      # Global error handling
│   │   └── index.ts             # Barrel export
│   │
│   ├── types/                   # Type definitions
│   │   ├── schema.d.ts          # 🤖 AUTO-GENERATED from OpenAPI
│   │   ├── helpers.ts           # Type utility helpers
│   │   └── index.ts             # Barrel export
│   │
│   ├── utils/                   # Utilities
│   │   ├── logger.ts            # Logging utility
│   │   └── index.ts             # Barrel export
│   │
│   └── index.ts                 # 🚀 Application entry point
│
├── scripts/                      # Build/generation scripts
│   └── generate-controllers.js  # Controller scaffold generator
│
├── config/                       # Runtime configuration
│   ├── api-keys.json            # 🔐 API keys (gitignored)
│   └── api-keys.example.json    # Template for API keys
│
├── docs/                         # Project documentation
│   ├── adding-environment-variables.md
│   └── COMMITIZEN-WORKFLOW.md
│
├── context-docs/                 # Agent context (this folder)
│   ├── 00-PROJECT-OVERVIEW.md
│   ├── 01-TECH-STACK.md
│   ├── 02-ARCHITECTURE.md
│   ├── 03-CODEBASE-MAP.md       # (this file)
│   ├── 04-DEVELOPMENT-WORKFLOW.md
│   ├── 05-API-CONVENTIONS.md
│   ├── 06-DEPLOYMENT.md
│   └── 07-GAPS-AND-TODOS.md
│
├── dist/                         # Build output (gitignored)
│   └── index.js                 # Bundled application
│
├── node_modules/                 # Dependencies (gitignored)
│
├── .husky/                       # Git hooks
│   └── pre-commit               # Runs lint-staged
│
├── build.js                      # esbuild configuration
├── Dockerfile                    # Container definition
├── docker-compose.yml            # Docker orchestration
├── eslint.config.js              # ESLint configuration
├── nodemon.json                  # Nodemon configuration
├── package.json                  # Dependencies & scripts
├── yarn.lock                     # Dependency lockfile
├── tsconfig.json                 # TypeScript configuration
├── .prettierrc                   # Prettier configuration
├── .prettierignore               # Prettier ignore rules
├── .gitignore                    # Git ignore rules
├── .env                          # Environment variables (gitignored)
├── .env.example                  # Environment template
└── README.md                     # Project documentation
```

## Key Files Explained

### 🚀 Entry Points

#### `src/index.ts`

**Purpose**: Application entry point
**Key Responsibilities**:

- Initialize Express app
- Load environment configuration
- Apply middleware (helmet, cors, body parser)
- Mount Swagger UI at /api-docs
- Initialize OpenAPI validator
- Register authentication handlers
- Start HTTP server
- Health check logging

**Flow**:

```typescript
1. Load .env file
2. Validate environment (env.ts)
3. Create Express app
4. Apply security middleware
5. Mount documentation
6. Initialize OpenAPI validator with auth
7. Register error handler
8. Start server on PORT
```

**Key Code Locations**:

- Line ~10-15: Environment validation
- Line ~20-25: Middleware setup
- Line ~30-40: OpenAPI validator config
- Line ~50-60: Server startup

---

### 📋 API Specification

#### `api/openapi.yaml`

**Purpose**: Single source of truth for API contract
**Key Sections**:

- `openapi: 3.1.0` - Spec version
- `info` - API metadata (title, version, description)
- `servers` - Base URLs (localhost:3000 dev, localhost:3001 docker)
- `paths` - All endpoints (health, users CRUD)
- `components.schemas` - Data models (User, Error, Pagination)
- `components.securitySchemes` - Auth definitions (ApiKeyAuth)
- `security` - Global security requirements

**Custom Extensions**:

- `x-eov-operation-id` - Operation identifier for routing
- `x-eov-operation-handler` - Controller file path

**Example Endpoint**:

```yaml
/users:
  get:
    summary: List all users
    operationId: getUsers
    x-eov-operation-id: getUsers
    x-eov-operation-handler: controllers/users
    tags: [users]
    parameters:
      - name: limit
        in: query
        schema: { type: integer, default: 10 }
    responses:
      '200':
        description: Success
        content:
          application/json:
            schema:
              type: object
              properties:
                users: { type: array, items: { $ref: '#/components/schemas/User' } }
```

---

### 🔐 Authentication

#### `src/auth/middlewares/apiKeyAuth.ts`

**Purpose**: API key validation middleware
**How It Works**:

1. Extract X-API-Key header from request
2. Load API keys from config/api-keys.json
3. Validate key exists and is active
4. Return true if valid, throw 401 if invalid

**Integration**: Used by express-openapi-validator security handlers

#### `src/auth/services/apiKeyService.ts`

**Purpose**: API key management service
**Responsibilities**:

- Load keys from JSON file
- Validate key format
- Check key status (active/inactive)
- Future: Key rotation, expiration

#### `config/api-keys.json`

**Purpose**: API key storage
**Format**:

```json
{
  "keys": [
    {
      "key": "dev-local-key-12345",
      "name": "Development Key",
      "active": true,
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

**Security Note**: This file is gitignored. Never commit real keys.

---

### 🎮 Controllers

#### `src/controllers/health.controller.ts`

**Purpose**: Health check endpoint
**Status**: ✅ Fully implemented
**Endpoint**: GET /health
**Auth**: Public (no API key required)
**Response**:

```json
{
  "status": "ok",
  "timestamp": "2025-10-30T12:00:00.000Z"
}
```

**Key Code**:

```typescript
export const healthCheck = async (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
};
```

#### `src/controllers/users.controller.ts`

**Purpose**: User CRUD operations
**Status**: ⚠️ Stub implementation (returns mock data)
**Endpoints**:

- GET /users - List users (with pagination)
- POST /users - Create user
- GET /users/{id} - Get user by ID
- PUT /users/{id} - Update user
- PATCH /users/{id} - Partial update
- DELETE /users/{id} - Delete user

**Current Implementation**: All handlers return mock data
**Next Steps**: Implement actual business logic with database

**Type Safety Example**:

```typescript
type GetUsersRequest = ApiRequest<'getUsers'>;
type GetUsersResponse = ApiResponse<'getUsers'>;

export const getUsers = async (req: GetUsersRequest, res: GetUsersResponse) => {
  // req.query.limit is typed as number | undefined
  // req.query.offset is typed as number | undefined

  // Mock implementation
  res.json({
    users: [],
    pagination: { limit: 10, offset: 0, total: 0 },
  });
};
```

---

### 🔧 Configuration

#### `src/config/env.ts`

**Purpose**: Environment variable validation
**How It Works**:

1. Define Zod schema for all env vars
2. Parse process.env against schema
3. Throw error if validation fails
4. Export typed config object

**Environment Variables**:

```typescript
{
  NODE_ENV: 'development' | 'production' | 'test',
  PORT: number,
  API_KEYS_FILE: string,
  // Add more as needed
}
```

**Usage in Code**:

```typescript
import { env } from './config';
console.log(env.PORT); // TypeScript knows this is a number
```

**Adding New Variables**: See docs/adding-environment-variables.md

---

### 📦 Type Definitions

#### `src/types/schema.d.ts`

**Purpose**: Auto-generated TypeScript types from OpenAPI
**Status**: 🤖 AUTO-GENERATED - DO NOT EDIT MANUALLY
**Regenerate**: `yarn gen-types`
**Contains**:

- `paths` - All API paths with operations
- `components` - Schema definitions (User, Error, etc.)
- `operations` - Named operations (getUsers, createUser, etc.)
- `external` - External references (if any)

**Example Types**:

```typescript
export interface components {
  schemas: {
    User: {
      id: string;
      name: string;
      email: string;
      createdAt: string;
    };
    Error: {
      code: string;
      message: string;
    };
  };
}

export interface operations {
  getUsers: {
    parameters: {
      query?: { limit?: number; offset?: number };
    };
    responses: {
      200: {
        content: {
          'application/json': {
            users: components['schemas']['User'][];
            pagination: {
              /* ... */
            };
          };
        };
      };
    };
  };
}
```

#### `src/types/helpers.ts`

**Purpose**: Type utility helpers
**Key Types**:

- `ApiRequest<T>` - Extracts request type for operation T
- `ApiResponse<T>` - Extracts response type for operation T
- Future: More helpers as needed

**Usage**:

```typescript
import { ApiRequest, ApiResponse } from '../types';

type GetUsersRequest = ApiRequest<'getUsers'>;
// Expands to: Request with typed query, params, body

type GetUsersResponse = ApiResponse<'getUsers'>;
// Expands to: Response with typed json() method
```

---

### 🛠️ Middleware

#### `src/middlewares/errorHandler.ts`

**Purpose**: Global error handling middleware
**How It Works**:

1. Catches all errors from route handlers
2. Checks if error is OpenAPI validation error
3. Formats error response appropriately
4. Logs error details
5. Sends JSON error response

**Error Types Handled**:

- Validation errors (400) - From OpenAPI validator
- Authentication errors (401) - From API key middleware
- Authorization errors (403) - If implemented
- Not found errors (404) - If implemented
- Internal server errors (500) - Catch-all

---

### 🤖 Code Generation

#### `scripts/generate-controllers.js`

**Purpose**: Generate controller scaffolds from OpenAPI spec
**How It Works**:

1. Load OpenAPI spec (api/openapi.yaml)
2. Extract all operations (paths + methods)
3. Group operations by tag (e.g., "users")
4. For each tag, generate controller file:
   - Import types from schema.d.ts
   - Create type helpers for each operation
   - Generate handler function stubs
   - Export all handlers
5. Write to src/controllers/{tag}.controller.ts
6. **IMPORTANT**: Skip if file already exists (never overwrite)

**Run**: `yarn gen-controllers` or `yarn generate`

**Example Generated Controller**:

```typescript
import type { ApiRequest, ApiResponse } from '../types';

type GetUsersRequest = ApiRequest<'getUsers'>;
type GetUsersResponse = ApiResponse<'getUsers'>;

export const getUsers = async (req: GetUsersRequest, res: GetUsersResponse) => {
  // TODO: Implement
};
```

---

### 🏗️ Build Configuration

#### `build.js`

**Purpose**: esbuild configuration for production builds
**Configuration**:

- Entry: src/index.ts
- Output: dist/index.js
- Format: ESM
- Platform: Node
- Target: Node 24
- Bundle: true
- External: All node_modules
- Source maps: true

**Run**: `yarn build`

#### `tsconfig.json`

**Purpose**: TypeScript compiler configuration
**Key Settings**:

- `strict: true` - Strict type checking
- `target: "ES2022"` - Modern JavaScript features
- `module: "ESNext"` - ES modules
- `moduleResolution: "bundler"` - Bundler-style resolution
- `esModuleInterop: true` - CommonJS interop
- `skipLibCheck: true` - Faster compilation

**Notable**: `noEmit: true` - TypeScript only for type checking, esbuild handles compilation

---

### 🐳 Docker Configuration

#### `Dockerfile`

**Purpose**: Container definition for deployment
**Base Image**: node:24-slim
**Key Steps**:

1. Set working directory to /app
2. Copy package files
3. Install ALL dependencies (includes devDeps for tsx)
4. Copy all source code
5. Run code generation (types + controllers)
6. Switch to non-root user (nodejs)
7. Expose port 3000
8. Health check: curl localhost:3000/health
9. Start command: tsx src/index.ts (direct TS execution)

**Note**: Does NOT use build step, runs TypeScript directly for simplicity

#### `docker-compose.yml`

**Purpose**: Docker orchestration
**Configuration**:

- Service name: api
- Port mapping: 3001:3000 (host:container)
- Volume mounts: .env file
- Restart policy: unless-stopped
- Container name: openapi-first-poc-api

---

### 📝 Configuration Files

#### `.gitignore`

**Ignores**:

- node_modules/
- dist/
- .env
- config/api-keys.json
- Build artifacts
- OS files (.DS_Store)
- IDE files (.vscode/, .idea/)

#### `.env.example`

**Purpose**: Template for environment variables
**Contains**: All required env vars with example values
**Usage**: Copy to .env and customize

#### `package.json`

**Key Sections**:

- `type: "module"` - ES modules enabled
- `engines: { node: ">=24.0.0" }` - Node version requirement
- `scripts` - All available commands
- `dependencies` - Runtime dependencies (8 total)
- `devDependencies` - Development dependencies (22 total)

---

## Auto-Generated vs Manual Files

### 🤖 Auto-Generated Files (NEVER EDIT MANUALLY)

1. **src/types/schema.d.ts**
   - Generated by: openapi-typescript
   - Command: `yarn gen-types`
   - Source: api/openapi.yaml

2. **src/controllers/\*.controller.ts** (only on first generation)
   - Generated by: scripts/generate-controllers.js
   - Command: `yarn gen-controllers`
   - Source: api/openapi.yaml
   - Note: Only created if file doesn't exist

### ✍️ Manual Files (SAFE TO EDIT)

All other files are manually written:

- src/index.ts
- src/auth/\*_/_
- src/config/\*_/_
- src/middlewares/\*_/_
- src/utils/\*_/_
- src/controllers/\*_/_ (after initial generation)
- api/openapi.yaml (source of truth)
- All config files
- All documentation

---

## Where to Add New Features

### Adding a New Endpoint

1. **Edit OpenAPI Spec**: api/openapi.yaml
   - Add path and operation
   - Define request/response schemas
   - Set operationId and tags
   - Add x-eov extensions

2. **Regenerate Types**: `yarn gen-types`
   - Updates src/types/schema.d.ts

3. **Generate Controller**: `yarn gen-controllers`
   - Creates scaffold in src/controllers/{tag}.controller.ts
   - Skip if file exists

4. **Implement Handler**: src/controllers/{tag}.controller.ts
   - Fill in business logic
   - Use typed request/response

5. **Test**: Swagger UI at /api-docs or curl

### Adding Authentication Logic

1. **Edit**: src/auth/services/apiKeyService.ts
2. **Edit**: src/auth/middlewares/apiKeyAuth.ts
3. **Update**: config/api-keys.json (add keys)

### Adding Configuration

1. **Edit**: src/config/env.ts
   - Add to Zod schema
   - Export from config object

2. **Update**: .env.example
   - Document new variable

3. **See**: docs/adding-environment-variables.md

### Adding Middleware

1. **Create**: src/middlewares/{name}.ts
2. **Export**: src/middlewares/index.ts
3. **Register**: src/index.ts (in correct order)

### Adding Utility

1. **Create**: src/utils/{name}.ts
2. **Export**: src/utils/index.ts
3. **Use**: Import from '../utils'

---

## Entry Point Locations

When debugging or tracing code:

1. **Application Start**: src/index.ts (main)
2. **Request Entry**: Express middleware stack in src/index.ts
3. **Validation Entry**: express-openapi-validator (node_modules)
4. **Auth Entry**: src/auth/middlewares/apiKeyAuth.ts
5. **Handler Entry**: src/controllers/\*.controller.ts
6. **Error Entry**: src/middlewares/errorHandler.ts
7. **Type Generation**: node_modules/openapi-typescript (CLI)
8. **Controller Generation**: scripts/generate-controllers.js

---

## Import Path Patterns

```typescript
// Types
import type { ApiRequest, ApiResponse } from '../types';
import type { components } from '../types/schema';

// Config
import { env } from '../config';

// Auth
import { apiKeyAuth } from '../auth';

// Utils
import { logger } from '../utils';

// Middleware
import { errorHandler } from '../middlewares';

// External
import express from 'express';
import helmet from 'helmet';
```

**Note**: All imports use relative paths or package names. No path aliases configured.
