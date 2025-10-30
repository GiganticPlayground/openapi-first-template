# Technology Stack

## Overview

This project uses a modern TypeScript stack focused on type safety, developer experience, and API-first development.

## Core Technologies

### Runtime & Language

- **Node.js**: 24.x (latest LTS)
- **TypeScript**: 5.9.3
  - Strict mode enabled
  - ES Modules (ESM) throughout
  - Target: ES2022
  - Module resolution: Bundler

### Web Framework

- **Express.js**: 5.1.0
  - Modern async/await support
  - TypeScript-friendly middleware

### Package Manager

- **Yarn**: Classic (v1.x)
  - Lockfile: yarn.lock (committed)
  - Workspace support ready (if needed)

## OpenAPI Ecosystem

### Core OpenAPI Tools

- **express-openapi-validator**: 5.6.0
  - Runtime request/response validation
  - Automatic validation middleware
  - Security requirements enforcement
  - Operation ID routing

- **openapi-typescript**: ^7.4.4
  - Generates TypeScript types from OpenAPI specs
  - Type-safe operation types
  - Schema type definitions

- **swagger-ui-express**: 5.0.1
  - Interactive API documentation
  - Mounted at /api-docs
  - Serves OpenAPI spec UI

### YAML Processing

- **js-yaml**: 4.1.0 - YAML parsing
- **yaml**: 2.7.0 - YAML manipulation

## Validation & Configuration

### Schema Validation

- **Zod**: 3.24.1
  - Environment variable validation (src/config/env.ts)
  - Runtime type safety
  - Schema composition

### Environment Management

- **dotenv**: 16.4.7
  - .env file loading
  - Development/production configs

## Security

- **helmet**: 8.1.0
  - Security headers middleware
  - XSS protection
  - Content Security Policy

- **cors**: 2.8.5
  - Cross-Origin Resource Sharing
  - Configurable origins

- **Custom API Key Auth**
  - Implementation: src/auth/
  - File-based key storage
  - Middleware integration

## Build & Development Tools

### Build System

- **esbuild**: 0.25.11
  - Ultra-fast bundler
  - Config: build.js
  - External dependencies (not bundled)
  - Source maps included
  - Target: Node 24

### Development Server

- **nodemon**: 3.1.9
  - File watching
  - Auto-restart on changes
  - Config: nodemon.json

- **tsx**: 5.1.1
  - TypeScript execution
  - ESM support
  - Fast startup

## Code Quality Tools

### Linting

- **ESLint**: 9.38.0
  - Config: eslint.config.js (flat config)
  - Plugins:
    - @eslint/js: 9.38.0
    - typescript-eslint: 9.5.0
  - Rules: Enforces best practices

### Formatting

- **Prettier**: 3.6.2
  - Config: .prettierrc
  - Integrated with ESLint
  - Pre-commit formatting

### Git Hooks

- **Husky**: 9.1.7
  - Git hooks manager
  - Pre-commit validation
  - Commit message linting

- **lint-staged**: 16.2.6
  - Run checks on staged files only
  - Fast pre-commit validation
  - Config in package.json

### Commit Conventions

- **Commitizen**: 4.3.2
  - Interactive commit prompts
  - Conventional commit format
  - CLI: `yarn commit`

- **@commitlint/cli**: 20.3.0
- **@commitlint/config-conventional**: 20.3.0
  - Enforces conventional commits
  - Validates commit messages

- **cz-conventional-changelog**: 3.3.0
  - Commitizen adapter
  - Generates changelogs

## Development Dependencies

### TypeScript Tooling

- **@types/node**: 24.10.7
- **@types/express**: 5.0.1
- **@types/cors**: 2.8.18
- **@types/js-yaml**: 4.0.9
- **@types/swagger-ui-express**: 4.1.6

### Utility Types

- **typescript-eslint**: 9.5.0 (parser + plugin)

## Production Dependencies Summary

```json
{
  "cors": "^2.8.5",
  "dotenv": "^16.4.7",
  "express": "^5.1.0",
  "express-openapi-validator": "^5.6.0",
  "helmet": "^8.1.0",
  "js-yaml": "^4.1.0",
  "swagger-ui-express": "^5.0.1",
  "zod": "^3.24.1"
}
```

8 runtime dependencies - kept minimal for production efficiency.

## Development Dependencies Summary

22 devDependencies including:

- TypeScript compiler and type definitions
- Build tools (esbuild)
- Development server (nodemon, tsx)
- Code quality (ESLint, Prettier)
- Git workflow (Husky, commitizen)
- OpenAPI code generation (openapi-typescript)

## Technology Choices & Rationale

### Why Express.js?

- Industry standard, well-tested
- Excellent middleware ecosystem
- Good TypeScript support
- express-openapi-validator integration

### Why esbuild?

- Extremely fast compilation
- Native ESM support
- Simple configuration
- Production-ready bundling

### Why Zod?

- Runtime type safety (TypeScript is compile-time only)
- Environment validation at startup
- Excellent error messages
- Composable schemas

### Why express-openapi-validator?

- Automatic validation from OpenAPI spec
- No duplicate validation logic
- Security enforcement
- Operation routing

### Why Yarn?

- Deterministic dependency resolution
- Faster than npm (classic)
- Good monorepo support (future-proof)

### Why Strict TypeScript?

- Catch errors at compile time
- Better IDE support
- Self-documenting code
- OpenAPI type generation works best with strict mode

## Build Output

### Development

- No build step needed
- Direct TypeScript execution via tsx
- Fast iteration

### Production

- Single bundled file: dist/index.js
- Source maps included
- External dependencies (node_modules required)
- Size: ~few KB (app code only)

## Docker Base Image

- **Base**: node:24-slim
- **Size**: ~200MB (minimal Debian)
- **User**: nodejs (non-root)
- **Includes**: npm, yarn, tsx (for runtime)

## Upgrade Considerations

### Safe to Upgrade

- Minor/patch versions of all dependencies
- TypeScript (test thoroughly)
- Node.js LTS versions

### Consider Before Upgrading

- Express 5 is relatively new (was 4 for years)
- ESLint flat config (v9) is different from legacy
- openapi-typescript major versions can change API

### Breaking Change Risks

- express-openapi-validator (test validation thoroughly)
- esbuild (usually backward compatible)
- Zod (API usually stable)

## Missing Technologies

These are **NOT** in the stack (but commonly expected):

- ❌ **Testing**: No Jest, Vitest, or Mocha
- ❌ **Database**: No Prisma, TypeORM, or MongoDB driver
- ❌ **ORM/Query Builder**: No database layer at all
- ❌ **Logging**: No Winston, Pino, or structured logging
- ❌ **Monitoring**: No Sentry, DataDog, or APM
- ❌ **Process Manager**: No PM2 (Docker handles this)
- ❌ **API Client**: No Axios or fetch wrappers
- ❌ **Validation Decorators**: No class-validator (using Zod instead)

See [07-GAPS-AND-TODOS.md](./07-GAPS-AND-TODOS.md) for planned additions.

## Scripts Reference

All available package.json scripts:

```json
{
  "dev": "nodemon",
  "start": "tsx src/index.ts",
  "build": "node build.js",
  "gen-types": "openapi-typescript api/openapi.yaml -o src/types/schema.d.ts",
  "gen-controllers": "node scripts/generate-controllers.js",
  "generate": "npm run gen-types && npm run gen-controllers",
  "lint": "eslint .",
  "format": "prettier --write .",
  "type-check": "tsc --noEmit",
  "validate": "npm run lint && npm run format && npm run type-check",
  "docker:build": "docker build -t openapi-first-poc .",
  "docker:up": "docker compose up -d",
  "docker:down": "docker compose down",
  "docker:logs": "docker compose logs -f",
  "setup": "npm run generate && npm run docker:build && npm run docker:up",
  "commit": "cz",
  "prepare": "husky"
}
```

## Version Pinning Strategy

- **Caret (^)**: Most dependencies (accept minor/patch updates)
- **Exact**: None (all dependencies use caret)
- **Lockfile**: yarn.lock ensures reproducible builds

This allows for security patches while maintaining stability.
