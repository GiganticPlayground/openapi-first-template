import * as OpenApiValidator from "express-openapi-validator";
import { join } from "path";

export const createOpenApiValidatorMiddleware = (apiSpecPath: string) =>
  OpenApiValidator.middleware({
    apiSpec: apiSpecPath,
    validateApiSpec: true,
    validateRequests: true, // (default)
    validateResponses: true, // false by default
    operationHandlers: join(process.cwd(), "src/controllers"),
  });
