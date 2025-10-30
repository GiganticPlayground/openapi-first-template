# API Conventions

## OpenAPI Specification Guidelines

### Spec Version

**Use**: OpenAPI 3.1.0

```yaml
openapi: 3.1.0
```

**Why**: Latest stable version, better JSON Schema support, improved validation.

### Info Section

**Required Fields**:

```yaml
info:
  title: My API
  version: 1.0.0
  description: Clear, concise API description
```

**Best Practices**:

- Use semantic versioning (1.0.0, 1.1.0, 2.0.0)
- Keep description brief but informative
- Include contact and license if public API

### Servers Section

**Pattern**: Define multiple environments

```yaml
servers:
  - url: http://localhost:3000
    description: Local development
  - url: http://localhost:3001
    description: Docker container
  - url: https://api.example.com
    description: Production (when deployed)
```

**Current Setup**:

- Local: http://localhost:3000
- Docker: http://localhost:3001

---

## Endpoint Conventions

### Path Naming

**Rules**:

1. Use lowercase
2. Use hyphens for multi-word resources
3. Use plural nouns for collections
4. Use path parameters for resource IDs

**Good**:

```yaml
/users                # Collection
/users/{id}           # Single resource
/user-profiles        # Multi-word
/users/{id}/orders    # Nested resource
```

**Bad**:

```yaml
/getUsers             # No verbs
/user                 # Use plural
/UserProfiles         # No camelCase
/users/{userId}       # Use {id} for consistency
```

### HTTP Methods

**Standard CRUD Mapping**:

| Method | Endpoint    | Purpose        | Request Body   | Response           |
| ------ | ----------- | -------------- | -------------- | ------------------ |
| GET    | /users      | List all       | None           | Array              |
| POST   | /users      | Create         | User data      | Created user       |
| GET    | /users/{id} | Get one        | None           | Single user        |
| PUT    | /users/{id} | Full update    | Full user data | Updated user       |
| PATCH  | /users/{id} | Partial update | Partial data   | Updated user       |
| DELETE | /users/{id} | Delete         | None           | 204 or success msg |

### Operation IDs

**Pattern**: `{verb}{Resource}` (camelCase)

```yaml
paths:
  /users:
    get:
      operationId: getUsers # List operation
    post:
      operationId: createUser # Create single
  /users/{id}:
    get:
      operationId: getUserById # Get single
    put:
      operationId: updateUser # Update
    patch:
      operationId: patchUser # Partial update
    delete:
      operationId: deleteUser # Delete
```

**Conventions**:

- `get{Resources}` - List (plural)
- `get{Resource}ById` - Get single
- `create{Resource}` - Create (singular)
- `update{Resource}` - Full update
- `patch{Resource}` - Partial update
- `delete{Resource}` - Delete

**Why**: Operation IDs become function names in controllers.

### Tags

**Purpose**: Group related operations

```yaml
paths:
  /users:
    get:
      tags: [users]
  /users/{id}:
    get:
      tags: [users]
```

**Conventions**:

- Use lowercase plural nouns
- One primary tag per operation
- Tags map to controller files (users → users.controller.ts)

---

## Required OpenAPI Extensions

This project requires custom extensions for express-openapi-validator integration.

### x-eov-operation-id

**Required**: Yes (on every operation)

**Purpose**: Operation identifier for routing

**Value**: Must match `operationId`

```yaml
paths:
  /users:
    get:
      operationId: getUsers
      x-eov-operation-id: getUsers # Same as operationId
```

**Why**: express-openapi-validator uses this to route requests to handlers.

### x-eov-operation-handler

**Required**: Yes (on every operation)

**Purpose**: Specify controller file path

**Value**: Relative path from src/ (without .ts extension)

```yaml
paths:
  /users:
    get:
      x-eov-operation-handler: controllers/users
```

**Resolution**:

- Base: src/
- Handler: controllers/users
- Full path: src/controllers/users.ts (or users.controller.ts)
- Import: Finds named export matching operationId

**Convention**: Group by tag

- Tag: users → Handler: controllers/users
- Tag: products → Handler: controllers/products

---

## Schema Conventions

### Component Schemas

**Location**: `components.schemas`

**Naming**: PascalCase

```yaml
components:
  schemas:
    User:
      type: object
      required: [id, name, email]
      properties:
        id:
          type: string
          format: uuid
        name:
          type: string
          minLength: 1
          maxLength: 100
        email:
          type: string
          format: email
        createdAt:
          type: string
          format: date-time
```

### Required Fields

**Always specify** what's required:

```yaml
User:
  type: object
  required: [id, name, email] # Explicit required fields
  properties:
    id: { type: string }
    name: { type: string }
    email: { type: string }
    phone: { type: string } # Optional (not in required)
```

**Best Practice**: Be explicit about optionality for API clarity.

### String Formats

**Use standard formats** for validation:

```yaml
email:
  type: string
  format: email # Validates email format

url:
  type: string
  format: uri # Validates URL

date:
  type: string
  format: date # YYYY-MM-DD

datetime:
  type: string
  format: date-time # ISO 8601

uuid:
  type: string
  format: uuid # UUID format
```

### Enums

**Use for fixed value sets**:

```yaml
status:
  type: string
  enum: [active, inactive, pending]
  default: pending

role:
  type: string
  enum: [user, admin, moderator]
```

### Array Schemas

**Always specify `items`**:

```yaml
users:
  type: array
  items:
    $ref: '#/components/schemas/User'
  minItems: 0
  maxItems: 100

tags:
  type: array
  items:
    type: string
```

### Reusable Schemas

**Use $ref for DRY**:

```yaml
components:
  schemas:
    User:
      # ... full definition

paths:
  /users:
    post:
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/User'
      responses:
        '201':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
```

---

## Request Conventions

### Parameters

#### Path Parameters

```yaml
/users/{id}:
  get:
    parameters:
      - name: id
        in: path
        required: true # Path params always required
        schema:
          type: string
          format: uuid
        description: User ID
```

**Conventions**:

- Always `required: true`
- Use `{id}` not `{userId}` for consistency
- Add description
- Specify format (uuid, etc.)

#### Query Parameters

```yaml
/users:
  get:
    parameters:
      - name: limit
        in: query
        required: false # Query params usually optional
        schema:
          type: integer
          minimum: 1
          maximum: 100
          default: 10
        description: Number of items to return

      - name: offset
        in: query
        required: false
        schema:
          type: integer
          minimum: 0
          default: 0
        description: Number of items to skip
```

**Pagination Pattern**:

- Use `limit` and `offset` for pagination
- Set reasonable defaults (e.g., limit: 10)
- Set maximum limits (e.g., max 100)

#### Header Parameters

```yaml
parameters:
  - name: X-Request-ID
    in: header
    required: false
    schema:
      type: string
      format: uuid
    description: Request tracking ID
```

**Note**: Don't define auth headers (X-API-Key) as parameters - use security schemes instead.

### Request Body

**Pattern**:

```yaml
paths:
  /users:
    post:
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateUserRequest'
```

**Conventions**:

- Always specify `required` (true/false)
- Use `application/json` content type
- Create separate schemas for create/update requests
- Don't include ID in create requests (server generates)

**Example Schemas**:

```yaml
components:
  schemas:
    CreateUserRequest:
      type: object
      required: [name, email]
      properties:
        name: { type: string }
        email: { type: string, format: email }

    UpdateUserRequest:
      type: object
      required: [name, email]
      properties:
        name: { type: string }
        email: { type: string, format: email }

    PatchUserRequest:
      type: object
      properties: # All optional for PATCH
        name: { type: string }
        email: { type: string, format: email }
```

---

## Response Conventions

### Status Codes

**Standard Mapping**:

| Code | Meaning               | Use Case                   |
| ---- | --------------------- | -------------------------- |
| 200  | OK                    | Successful GET, PUT, PATCH |
| 201  | Created               | Successful POST            |
| 204  | No Content            | Successful DELETE          |
| 400  | Bad Request           | Validation error           |
| 401  | Unauthorized          | Missing/invalid auth       |
| 403  | Forbidden             | Insufficient permissions   |
| 404  | Not Found             | Resource doesn't exist     |
| 409  | Conflict              | Duplicate resource         |
| 500  | Internal Server Error | Server error               |

### Response Schemas

**Success Response Pattern**:

```yaml
responses:
  '200':
    description: Successful operation
    content:
      application/json:
        schema:
          type: object
          properties:
            users:
              type: array
              items:
                $ref: '#/components/schemas/User'
            pagination:
              $ref: '#/components/schemas/Pagination'
```

**List Response Convention**:

```yaml
{ 'users': [...], 'pagination': { 'limit': 10, 'offset': 0, 'total': 100 } } # Data array (pluralized) # Pagination metadata
```

**Single Resource Response**:

```yaml
responses:
  '200':
    description: User retrieved
    content:
      application/json:
        schema:
          $ref: '#/components/schemas/User'
```

### Error Response Pattern

**Standard Error Schema**:

```yaml
components:
  schemas:
    Error:
      type: object
      required: [code, message]
      properties:
        code:
          type: string
          description: Error code
        message:
          type: string
          description: Human-readable error message
        details:
          type: array
          items:
            type: object
          description: Additional error details
```

**Usage in Responses**:

```yaml
responses:
  '400':
    description: Bad request
    content:
      application/json:
        schema:
          $ref: '#/components/schemas/Error'
  '401':
    description: Unauthorized
    content:
      application/json:
        schema:
          $ref: '#/components/schemas/Error'
  '404':
    description: Not found
    content:
      application/json:
        schema:
          $ref: '#/components/schemas/Error'
```

**Error Response Examples**:

```json
// Validation error
{
  "code": "VALIDATION_ERROR",
  "message": "Request validation failed",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}

// Authentication error
{
  "code": "UNAUTHORIZED",
  "message": "Invalid or missing API key"
}

// Not found error
{
  "code": "NOT_FOUND",
  "message": "User not found"
}
```

---

## Security Conventions

### Security Schemes

**Current Implementation**: API Key authentication

```yaml
components:
  securitySchemes:
    ApiKeyAuth:
      type: apiKey
      in: header
      name: X-API-Key
      description: API key for authentication
```

**Apply Globally**:

```yaml
security:
  - ApiKeyAuth: [] # All endpoints require auth by default
```

**Disable for Specific Endpoints**:

```yaml
paths:
  /health:
    get:
      security: [] # Override global security (public endpoint)
```

### Adding New Security Schemes

**Example**: Bearer token

```yaml
components:
  securitySchemes:
    ApiKeyAuth:
      # ... existing

    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

# Use both
security:
  - ApiKeyAuth: []
  - BearerAuth: []
```

---

## Type Safety Patterns

### Controller Type Helpers

**Pattern**: Extract operation types from generated schema

```typescript
import type { ApiRequest, ApiResponse } from '../types';

// Extract request/response types by operation ID
type GetUsersRequest = ApiRequest<'getUsers'>;
type GetUsersResponse = ApiResponse<'getUsers'>;

// Use in handler
export const getUsers = async (req: GetUsersRequest, res: GetUsersResponse) => {
  // req.query is typed (limit, offset)
  // req.params is typed
  // res.json() expects correct schema
};
```

### Type Helper Implementation

**Current Implementation** (src/types/helpers.ts):

```typescript
import type { Request, Response } from 'express';
import type { operations } from './schema';

// Extract request type for an operation
export type ApiRequest<T extends keyof operations> = Request<
  operations[T]['parameters']['path'],
  any,
  operations[T]['requestBody']['content']['application/json'],
  operations[T]['parameters']['query']
>;

// Extract response type for an operation
export type ApiResponse<T extends keyof operations> = Response<
  operations[T]['responses']['200']['content']['application/json']
>;
```

**Benefits**:

- Full type safety from OpenAPI spec
- Auto-complete for request properties
- Type errors if response doesn't match schema
- No manual type definitions needed

---

## Validation Patterns

### Request Validation

**Automatic**: express-openapi-validator validates all requests against OpenAPI spec.

**What's Validated**:

- Request path parameters
- Query parameters (types, formats, min/max)
- Request headers
- Request body (schema compliance)
- Content-Type headers

**Validation Errors**:

```json
{
  "message": "request.body should have required property 'email'",
  "errors": [
    {
      "path": ".body.email",
      "message": "should have required property 'email'",
      "errorCode": "required.openapi.validation"
    }
  ]
}
```

### Response Validation

**Enabled**: Yes (in production, consider disabling for performance)

**Configuration** (src/index.ts):

```typescript
OpenApiValidator.middleware({
  validateRequests: true, // Always true
  validateResponses: true, // Consider false in production
});
```

**What's Validated**:

- Response status codes (must match spec)
- Response body schemas
- Response headers

**Errors**: If response doesn't match schema, 500 error is thrown.

---

## Documentation Conventions

### Descriptions

**Add to everything**:

```yaml
paths:
  /users:
    get:
      summary: List all users # Short summary (required)
      description: | # Long description (optional)
        Returns a paginated list of all users.
        Use limit and offset for pagination.
      operationId: getUsers
      parameters:
        - name: limit
          description: Number of users to return per page # Param description
```

**Best Practices**:

- `summary`: One sentence, action-oriented
- `description`: Multi-line details, markdown supported
- `parameters[].description`: Explain purpose and format
- `schemas[].description`: Explain field meaning

### Examples

**Add examples for clarity**:

```yaml
components:
  schemas:
    User:
      type: object
      properties:
        id:
          type: string
          format: uuid
          example: '123e4567-e89b-12d3-a456-426614174000'
        name:
          type: string
          example: 'John Doe'
        email:
          type: string
          format: email
          example: 'john@example.com'
```

**Request Body Examples**:

```yaml
requestBody:
  content:
    application/json:
      schema:
        $ref: '#/components/schemas/CreateUserRequest'
      examples:
        minimal:
          summary: Minimal user
          value:
            name: 'John Doe'
            email: 'john@example.com'
        full:
          summary: User with all fields
          value:
            name: 'John Doe'
            email: 'john@example.com'
            phone: '+1234567890'
```

---

## Best Practices Summary

### DO:

✅ Use OpenAPI 3.1.0
✅ Define all schemas in components
✅ Use $ref for reusability
✅ Specify required fields explicitly
✅ Add descriptions and examples
✅ Use standard HTTP status codes
✅ Include x-eov-operation-id and x-eov-operation-handler
✅ Use camelCase for operationId
✅ Use kebab-case for paths
✅ Use PascalCase for schema names
✅ Validate both requests and responses
✅ Define error response schemas
✅ Use security schemes (not header parameters for auth)

### DON'T:

❌ Use verbs in paths (/getUsers)
❌ Use camelCase in paths (/getUserById)
❌ Skip required field declarations
❌ Hardcode auth headers as parameters
❌ Return different schemas for same status code
❌ Use generic error messages
❌ Skip operationId
❌ Forget x-eov extensions
❌ Use singular nouns for collections
❌ Mix authentication schemes inconsistently

---

## Adding a New Endpoint Checklist

1. **Define in OpenAPI Spec** (api/openapi.yaml):
   - [ ] Add path and method
   - [ ] Set operationId (camelCase)
   - [ ] Add tags
   - [ ] Add x-eov-operation-id
   - [ ] Add x-eov-operation-handler
   - [ ] Define parameters
   - [ ] Define requestBody (if POST/PUT/PATCH)
   - [ ] Define responses (200, 400, 401, 404, 500)
   - [ ] Add summary and description
   - [ ] Set security requirements

2. **Define Schemas** (if new):
   - [ ] Add to components.schemas
   - [ ] Use PascalCase naming
   - [ ] Define required fields
   - [ ] Add formats (email, uuid, etc.)
   - [ ] Add examples

3. **Generate Code**:
   - [ ] Run: `yarn generate`
   - [ ] Verify schema.d.ts updated
   - [ ] Verify controller scaffold created

4. **Implement Handler**:
   - [ ] Open src/controllers/{tag}.controller.ts
   - [ ] Find generated function
   - [ ] Add business logic
   - [ ] Return correctly typed response

5. **Test**:
   - [ ] Start dev server: `yarn dev`
   - [ ] Open Swagger UI: http://localhost:3000/api-docs
   - [ ] Test endpoint with various inputs
   - [ ] Verify validation works
   - [ ] Check error responses

6. **Document** (optional):
   - [ ] Add to README if needed
   - [ ] Update API documentation
   - [ ] Add code comments

---

## Reference: Current Endpoints

### Health Check

- **GET /health**
- operationId: healthCheck
- Auth: Public (no API key)
- Handler: controllers/health

### Users

- **GET /users** - operationId: getUsers
- **POST /users** - operationId: createUser
- **GET /users/{id}** - operationId: getUserById
- **PUT /users/{id}** - operationId: updateUser
- **PATCH /users/{id}** - operationId: patchUser
- **DELETE /users/{id}** - operationId: deleteUser
- Auth: API Key required
- Handler: controllers/users

All follow conventions outlined in this document.
