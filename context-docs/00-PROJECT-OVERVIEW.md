# Project Overview

## What is This Project?

This is an **OpenAPI-First Proof of Concept** that demonstrates how to build a type-safe REST API where the OpenAPI specification is the single source of truth. The project automatically generates TypeScript types and controller scaffolds from the API spec, ensuring that code and documentation are always in sync.

## Current Implementation

The project implements a **User Management API** with:

- Health check endpoint (public)
- Full CRUD operations for users
- API key authentication
- Request/response validation
- Auto-generated TypeScript types
- Swagger UI for interactive documentation

## Key Goals

1. **API-First Development**: Define the API contract first, generate code from it
2. **Type Safety**: End-to-end TypeScript types derived from OpenAPI spec
3. **Developer Experience**: Automated code generation and validation
4. **Production Ready**: Docker deployment, health checks, security middleware

## Technology Stack (Summary)

- **Runtime**: Node.js 24.x
- **Language**: TypeScript 5.9.3 (strict mode, ESM)
- **Framework**: Express.js 5.1.0
- **Validation**: express-openapi-validator + Zod
- **Build**: esbuild
- **Deployment**: Docker

See [01-TECH-STACK.md](./01-TECH-STACK.md) for complete details.

## Project Status

### ✅ Implemented

- OpenAPI specification (api/openapi.yaml)
- Type generation from OpenAPI spec
- Controller scaffold generation
- Runtime request/response validation
- API key authentication system
- Docker containerization
- Development workflow with hot reload
- Code quality tools (ESLint, Prettier, Commitizen)
- Environment variable validation

### ⚠️ Stub Implementations

- User controllers (src/controllers/users.controller.ts) - Return mock data only
- No actual database integration
- No persistence layer

### ❌ Missing

- Test infrastructure (no Jest/Vitest setup)
- CI/CD pipeline
- Database layer
- Logging service integration
- Monitoring/observability
- API versioning strategy

See [07-GAPS-AND-TODOS.md](./07-GAPS-AND-TODOS.md) for detailed gaps and future work.

## Quick Reference

### Key Files

- `api/openapi.yaml` - API specification (source of truth)
- `src/types/schema.d.ts` - Auto-generated TypeScript types
- `src/controllers/*.controller.ts` - Auto-generated controller scaffolds
- `src/index.ts` - Application entry point
- `src/auth/` - API key authentication implementation

### Key Commands

```bash
# Development
yarn dev                    # Start dev server with hot reload
yarn generate              # Regenerate types and controllers

# Code Quality
yarn validate              # Run all checks (lint, format, type-check)

# Docker
yarn setup                 # Full setup: generate code + build + start container
yarn docker:up             # Start container
yarn docker:logs           # View logs

# Git
yarn commit                # Guided commit with Commitizen
```

### Port Configuration

- **Local Development**: http://localhost:3000
- **Docker Container**: http://localhost:3001
- **Swagger UI**: /api-docs (on either port)
- **Health Check**: GET /health

## Architecture Principles

1. **Contract-Driven**: OpenAPI spec drives all code generation
2. **Type Safety**: Strict TypeScript with no `any` types
3. **Fail-Fast**: Environment validation at startup
4. **Code Generation**: Never manually edit generated files
5. **Security First**: API key auth, helmet, CORS configured
6. **Developer Experience**: One-command setup, hot reload, pre-commit hooks

## Recent Development Focus

Based on git history, recent work has focused on:

- Setting up authentication layer (API keys)
- Improving build and deployment (Docker fixes)
- Enhancing developer tools (Commitizen, setup scripts)
- Code quality enforcement (lint-staged, Husky hooks)

## Next Steps for Agents

When working with this project:

1. **Always** read the OpenAPI spec first (api/openapi.yaml)
2. **Never** manually edit generated files (src/types/schema.d.ts, controllers)
3. **Always** run code generation after modifying OpenAPI spec
4. Check [03-CODEBASE-MAP.md](./03-CODEBASE-MAP.md) to understand where code lives
5. Follow conventions in [05-API-CONVENTIONS.md](./05-API-CONVENTIONS.md)
6. Review [07-GAPS-AND-TODOS.md](./07-GAPS-AND-TODOS.md) before adding features

## Authentication Note

The project uses API key authentication:

- Dev key: `dev-local-key-12345`
- Header: `X-API-Key: dev-local-key-12345`
- Health check endpoint is public (no auth required)

See src/auth/README.md for complete authentication documentation.

## Documentation Structure

This context-docs folder contains:

- **00-PROJECT-OVERVIEW.md** (this file) - High-level introduction
- **01-TECH-STACK.md** - Complete technology stack and dependencies
- **02-ARCHITECTURE.md** - System architecture and design patterns
- **03-CODEBASE-MAP.md** - Directory structure and file organization
- **04-DEVELOPMENT-WORKFLOW.md** - Development processes and workflows
- **05-API-CONVENTIONS.md** - API design and implementation guidelines
- **06-DEPLOYMENT.md** - Deployment and configuration
- **07-GAPS-AND-TODOS.md** - Known limitations and future work

Read files in order for comprehensive understanding, or jump to specific topics as needed.
