# Development Workflow

## Initial Setup

### Prerequisites

- Node.js 24.x or later
- Yarn package manager
- Docker & Docker Compose (for containerized development)
- Git

### First-Time Setup

```bash
# 1. Clone repository
git clone <repository-url>
cd openapi-first-poc

# 2. Install dependencies
yarn install

# 3. Copy environment template
cp .env.example .env

# 4. Edit .env file (set PORT, etc.)
nano .env

# 5. Copy API keys template
cp config/api-keys.example.json config/api-keys.json

# 6. Generate types and controllers
yarn generate

# 7. Start development server
yarn dev
```

**Quick Setup (Docker)**:

```bash
# One-command setup
yarn setup

# This runs:
# - yarn generate (types + controllers)
# - yarn docker:build
# - yarn docker:up
```

---

## Daily Development Workflow

### Starting Development

```bash
# Option 1: Local development (recommended for coding)
yarn dev

# Option 2: Docker development
yarn docker:up
yarn docker:logs -f
```

**Local vs Docker**:

- **Local**: Faster hot reload, easier debugging, direct file access
- **Docker**: Production-like environment, isolated, tests containerization

### Development Server Features

When running `yarn dev`:

- Hot reload via nodemon
- Watches: src/, api/, config/
- Auto-restart on file changes
- Direct TypeScript execution (no build step)
- Console output shows:
  - Server URL
  - Health check URL
  - Swagger UI URL

**Example Output**:

```
[nodemon] starting `tsx src/index.ts`
Server is running on http://localhost:3000
Health check: http://localhost:3000/health
API Documentation: http://localhost:3000/api-docs
```

### Making Code Changes

#### 1. Changing Existing Endpoint Logic

```bash
# Edit controller
nano src/controllers/users.controller.ts

# Changes auto-reload (nodemon)
# Test in browser or curl
```

**No restart needed** - nodemon handles it.

#### 2. Adding New Endpoint

```bash
# Step 1: Edit OpenAPI spec
nano api/openapi.yaml

# Step 2: Regenerate types and controllers
yarn generate

# Step 3: Implement handler
nano src/controllers/{tag}.controller.ts

# Step 4: Test
curl -H "X-API-Key: dev-local-key-12345" http://localhost:3000/users
```

**Note**: If controller file exists, only types are regenerated.

#### 3. Changing Types/Schemas

```bash
# Step 1: Edit OpenAPI spec schemas
nano api/openapi.yaml

# Step 2: Regenerate types
yarn gen-types

# Step 3: Fix TypeScript errors in controllers
# (TypeScript will show errors if types changed)

# Step 4: Verify
yarn type-check
```

#### 4. Adding Middleware

```bash
# Step 1: Create middleware
nano src/middlewares/myMiddleware.ts

# Step 2: Export from barrel
nano src/middlewares/index.ts

# Step 3: Register in app
nano src/index.ts

# Step 4: Test
yarn dev
```

---

## Code Generation Workflow

### Understanding Code Generation

This project has TWO code generation steps:

1. **Type Generation** (`yarn gen-types`)
   - Source: api/openapi.yaml
   - Output: src/types/schema.d.ts
   - Tool: openapi-typescript
   - Frequency: Every time OpenAPI spec changes

2. **Controller Generation** (`yarn gen-controllers`)
   - Source: api/openapi.yaml
   - Output: src/controllers/\*.controller.ts
   - Tool: Custom script (scripts/generate-controllers.js)
   - Frequency: Only when adding NEW endpoints
   - **IMPORTANT**: Skips existing files (never overwrites)

### When to Run Code Generation

| Scenario                        | Run              | Why                    |
| ------------------------------- | ---------------- | ---------------------- |
| Added new endpoint              | `yarn generate`  | Need types + scaffold  |
| Changed request/response schema | `yarn gen-types` | Update types only      |
| Changed endpoint path           | `yarn gen-types` | Update types only      |
| Changed endpoint parameters     | `yarn gen-types` | Update types only      |
| Modified controller logic       | Nothing          | No regeneration needed |
| Added middleware                | Nothing          | Manual code            |
| Changed OpenAPI metadata        | Nothing          | Docs only              |

### Code Generation Commands

```bash
# Generate types only
yarn gen-types

# Generate controllers only (safe - skips existing)
yarn gen-controllers

# Generate both (recommended)
yarn generate
```

### Regeneration Safety

**SAFE to regenerate**:

- Types (schema.d.ts) - Always overwritten
- Controllers - Only created if missing

**NEVER regenerated**:

- Existing controllers (your logic is safe)
- Middleware
- Config
- Auth logic
- Any manual code

---

## Testing Workflow

### Manual Testing

#### Using Swagger UI (Recommended)

```bash
# 1. Start dev server
yarn dev

# 2. Open browser
open http://localhost:3000/api-docs

# 3. Click "Authorize"
# 4. Enter API key: dev-local-key-12345
# 5. Click endpoint to test
# 6. Click "Try it out"
# 7. Fill parameters
# 8. Click "Execute"
```

**Benefits**:

- Interactive UI
- Schema validation
- Request/response inspection
- No CLI tools needed

#### Using curl

```bash
# Health check (no auth)
curl http://localhost:3000/health

# List users (with auth)
curl -H "X-API-Key: dev-local-key-12345" \
     http://localhost:3000/users

# Create user (with body)
curl -X POST \
     -H "X-API-Key: dev-local-key-12345" \
     -H "Content-Type: application/json" \
     -d '{"name":"John","email":"john@example.com"}' \
     http://localhost:3000/users

# Get user by ID
curl -H "X-API-Key: dev-local-key-12345" \
     http://localhost:3000/users/123
```

#### Using HTTPie (Alternative)

```bash
# Install
brew install httpie

# Requests
http :3000/health
http :3000/users X-API-Key:dev-local-key-12345
http POST :3000/users X-API-Key:dev-local-key-12345 name=John email=john@example.com
```

### Automated Testing

**Status**: ❌ Not implemented yet

**TODO**:

- Add Jest or Vitest
- Write unit tests for controllers
- Write integration tests for API
- Add test coverage reporting
- Configure CI/CD testing

See [07-GAPS-AND-TODOS.md](./07-GAPS-AND-TODOS.md) for testing plans.

---

## Code Quality Workflow

### Available Quality Commands

```bash
# Linting (check for issues)
yarn lint

# Formatting (auto-fix)
yarn format

# Type checking (no build)
yarn type-check

# Run all checks
yarn validate
```

### Pre-Commit Workflow

This project uses **Husky + lint-staged** for automatic pre-commit checks.

**What happens on `git commit`**:

1. Husky triggers pre-commit hook
2. lint-staged runs on staged files only
3. Checks performed:
   - ESLint (auto-fix)
   - Prettier (auto-format)
   - TypeScript type check (if .ts files)
4. If all pass: Commit succeeds
5. If any fail: Commit blocked, fix issues

**Configuration**: See package.json → lint-staged

**Bypass** (not recommended):

```bash
git commit --no-verify
```

### Commit Message Workflow

This project uses **Commitizen** for standardized commit messages.

#### Recommended: Use Commitizen CLI

```bash
# Stage your changes
git add .

# Interactive commit (guided)
yarn commit

# Follow prompts:
# 1. Select type (feat, fix, docs, etc.)
# 2. Enter scope (optional)
# 3. Write short description
# 4. Write long description (optional)
# 5. List breaking changes (if any)
# 6. Reference issues (if any)
```

**Example Session**:

```
? Select the type of change: feat
? What is the scope of this change: users
? Write a short description: add pagination support
? Provide a longer description: [press enter to skip]
? Are there any breaking changes? No
? Does this close any issues? No

Generated message:
feat(users): add pagination support
```

#### Alternative: Manual Commit

If you prefer manual commits, follow **Conventional Commits** format:

```
<type>(<scope>)!: <description>

[optional body]

[optional footer]
```

**Types**:

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style (formatting, semicolons)
- `refactor`: Code restructuring (no behavior change)
- `perf`: Performance improvement
- `test`: Adding tests
- `build`: Build system changes
- `ci`: CI/CD changes
- `chore`: Maintenance tasks

**Examples**:

```bash
git commit -m "feat(api): add user search endpoint"
git commit -m "fix(auth): handle expired API keys"
git commit -m "docs: update README with setup instructions"
git commit -m "refactor(controllers): extract validation logic"
```

**Breaking Changes**:

```bash
git commit -m "feat(api)!: change user schema

BREAKING CHANGE: User.createdAt is now a number (timestamp) instead of string"
```

**Commit Message Validation**:

- Pre-commit hook validates format
- Follows @commitlint/config-conventional rules
- Fails commit if format is invalid

See [docs/COMMITIZEN-WORKFLOW.md](../docs/COMMITIZEN-WORKFLOW.md) for complete guide.

---

## Docker Workflow

### Docker Commands

```bash
# Build image
yarn docker:build
# or
docker build -t openapi-first-poc .

# Start container
yarn docker:up
# or
docker compose up -d

# Stop container
yarn docker:down
# or
docker compose down

# View logs
yarn docker:logs
# or
docker compose logs -f

# Restart container
docker compose restart

# Rebuild and restart
yarn docker:build && yarn docker:up
```

### Docker Development Tips

**Accessing the Container**:

```bash
# Shell into running container
docker exec -it openapi-first-poc-api sh

# Check logs
docker logs openapi-first-poc-api -f

# Inspect container
docker inspect openapi-first-poc-api
```

**Port Mapping**:

- Container: 3000 (internal)
- Host: 3001 (external)
- Access: http://localhost:3001

**Volume Mounts**:

- .env file is mounted (changes require restart)
- Source code is NOT mounted (baked into image)

**Updating Code in Docker**:

```bash
# After code changes:
yarn docker:build  # Rebuild image
yarn docker:down   # Stop old container
yarn docker:up     # Start new container
```

**Health Checks**:

- Docker runs health check every 30s
- Command: `curl -f http://localhost:3000/health`
- Unhealthy after 3 failures
- View status: `docker ps`

---

## Environment Configuration Workflow

### Environment Variables

**Files**:

- `.env` - Your local values (gitignored)
- `.env.example` - Template (committed)

**Available Variables**:

```bash
NODE_ENV=development
PORT=3000
API_KEYS_FILE=./config/api-keys.json
```

### Adding New Environment Variables

**Step-by-Step**:

1. **Edit Zod Schema** (src/config/env.ts):

```typescript
const envSchema = z.object({
  // ... existing vars
  NEW_VAR: z.string().min(1),
});
```

2. **Update .env.example**:

```bash
NEW_VAR=example_value
```

3. **Update .env**:

```bash
NEW_VAR=actual_value
```

4. **Use in Code**:

```typescript
import { env } from './config';
console.log(env.NEW_VAR); // Typed!
```

5. **Verify**:

```bash
yarn dev
# Should start without errors
```

**Complete Guide**: See [docs/adding-environment-variables.md](../docs/adding-environment-variables.md)

---

## Debugging Workflow

### Local Debugging

#### Using VS Code

**launch.json** (create in .vscode/):

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Dev Server",
      "runtimeExecutable": "yarn",
      "runtimeArgs": ["dev"],
      "console": "integratedTerminal",
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}
```

**Usage**:

1. Set breakpoints in src/
2. Press F5 or Run → Start Debugging
3. Make request to API
4. Debugger pauses at breakpoints

#### Using Console Logs

```typescript
// Quick debugging
console.log('Request body:', req.body);
console.error('Error occurred:', error);

// Better: Use logger utility (if implemented)
import { logger } from '../utils';
logger.info('Request received', { body: req.body });
logger.error('Error occurred', { error });
```

#### Using Node Inspector

```bash
# Start with inspector
node --inspect $(yarn bin tsx) src/index.ts

# Open Chrome DevTools
# Go to: chrome://inspect
# Click "inspect" under Remote Target
```

### Docker Debugging

**View Logs**:

```bash
yarn docker:logs
# or
docker logs openapi-first-poc-api -f
```

**Shell Access**:

```bash
docker exec -it openapi-first-poc-api sh

# Inside container:
cat /app/src/index.ts
env | grep PORT
curl localhost:3000/health
```

### Common Issues

#### Port Already in Use

```bash
# Find process using port
lsof -i :3000

# Kill process
kill -9 <PID>

# Or use different port
PORT=3001 yarn dev
```

#### Types Not Updating

```bash
# Regenerate types
yarn gen-types

# Restart TypeScript server (VS Code)
# Cmd+Shift+P → "TypeScript: Restart TS Server"
```

#### API Key Not Working

```bash
# Check key file exists
cat config/api-keys.json

# Verify key is active
# Check "active": true in JSON

# Try dev key
curl -H "X-API-Key: dev-local-key-12345" http://localhost:3000/users
```

#### Validation Errors

```bash
# Check OpenAPI spec is valid
npx @redocly/cli lint api/openapi.yaml

# Regenerate types
yarn generate

# Check request matches schema in Swagger UI
```

---

## Hot Reload Workflow

### What Triggers Hot Reload

**Watched Paths** (nodemon.json):

- `src/**/*` - All source files
- `api/openapi.yaml` - API spec changes
- `config/api-keys.json` - Key changes

**File Types** (nodemon.json):

- `.ts` - TypeScript files
- `.js` - JavaScript files
- `.yaml` - OpenAPI specs
- `.json` - Config files

### Hot Reload Behavior

**Automatic Restart**:

- Edit any file in src/
- Save file
- Nodemon detects change
- Restarts server
- ~1-2 second delay

**Manual Restart**:

```bash
# In terminal running yarn dev
# Type: rs + Enter
```

### What Requires Manual Steps

**Does NOT auto-reload**:

- OpenAPI spec changes → Run `yarn gen-types`
- New endpoints → Run `yarn generate`
- Environment variable changes → Restart dev server
- Dependency changes → Run `yarn install`

**Example Workflow**:

```bash
# Terminal 1: Dev server
yarn dev

# Terminal 2: Make changes
nano api/openapi.yaml      # Edit spec
yarn gen-types              # Regenerate types
nano src/controllers/users.controller.ts  # Implement

# Terminal 1: Auto-restarts after controller edit
# No manual restart needed!
```

---

## Build Workflow

### Development Build

**Not needed** - TypeScript runs directly via tsx.

### Production Build

```bash
# Build for production
yarn build

# Output: dist/index.js
# Run: node dist/index.js
```

**Build Process**:

1. esbuild bundles src/index.ts
2. Resolves all imports
3. Outputs single file
4. Externalizes node_modules
5. Includes source maps

**Build Verification**:

```bash
# Build
yarn build

# Test built version
node dist/index.js

# Should start server
# Ctrl+C to stop
```

---

## Troubleshooting Workflow

### Validation Failures

**Symptom**: 400 Bad Request with validation errors

**Debug**:

1. Check Swagger UI for schema requirements
2. Compare request to schema in api/openapi.yaml
3. Verify types are up to date: `yarn gen-types`
4. Check request headers (Content-Type: application/json)

### Authentication Failures

**Symptom**: 401 Unauthorized

**Debug**:

1. Check X-API-Key header is set
2. Verify key exists in config/api-keys.json
3. Check key is active: `"active": true`
4. Try dev key: `dev-local-key-12345`

### Type Errors

**Symptom**: TypeScript compilation errors

**Debug**:

1. Regenerate types: `yarn gen-types`
2. Check schema.d.ts was updated
3. Verify OpenAPI spec is valid
4. Restart TypeScript server (VS Code)
5. Run: `yarn type-check`

### Server Won't Start

**Debug**:

1. Check port is free: `lsof -i :3000`
2. Verify .env file exists
3. Check environment variables: `cat .env`
4. Look for syntax errors in src/index.ts
5. Check logs for specific error messages

### Docker Issues

**Debug**:

1. Check container status: `docker ps -a`
2. View logs: `yarn docker:logs`
3. Verify image built: `docker images | grep openapi`
4. Check port mapping: `docker port openapi-first-poc-api`
5. Rebuild: `yarn docker:build`

---

## Best Practices

### Development Habits

1. **Always run code generation after OpenAPI changes**
2. **Commit generated files** (schema.d.ts, initial controllers)
3. **Use Swagger UI for testing** (fastest feedback)
4. **Run validation before commits** (`yarn validate`)
5. **Use Commitizen for commits** (`yarn commit`)
6. **Keep controllers focused** (single responsibility)
7. **Add types for everything** (no `any` types)

### Code Organization

1. **One controller per tag** (users.controller.ts for /users endpoints)
2. **Keep middleware separate** (src/middlewares/)
3. **Extract reusable logic to utils** (src/utils/)
4. **Use barrel exports** (index.ts in each folder)
5. **Follow existing patterns** (look at health.controller.ts)

### Performance Tips

1. **Use hot reload for quick iteration** (nodemon)
2. **Run Docker only when testing deployment** (local is faster)
3. **Skip validation in dev** (optional, see OpenAPI validator docs)
4. **Use --no-verify for quick commits** (when needed, not recommended)

---

## Quick Reference

### Most Used Commands

```bash
yarn dev                 # Start development
yarn generate            # Regenerate all
yarn validate            # Run all checks
yarn commit              # Make commit
yarn docker:up           # Start container
yarn docker:logs         # View container logs
```

### Development Cycle

```
1. Make changes to code
   ↓
2. Save file (auto-reload)
   ↓
3. Test in Swagger UI
   ↓
4. Fix issues
   ↓
5. Repeat 1-4
   ↓
6. Run: yarn validate
   ↓
7. Git: yarn commit
   ↓
8. Push to remote
```

### Emergency Commands

```bash
# Reset everything
yarn install --force
yarn generate
yarn dev

# Clear Docker
docker compose down -v
yarn docker:build
yarn docker:up

# Fix git hooks
rm -rf .husky
yarn prepare

# Fix node_modules
rm -rf node_modules yarn.lock
yarn install
```
