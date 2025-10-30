import * as OpenApiValidator from "express-openapi-validator";
import { join } from "path";

export const createOpenApiValidatorMiddleware = (apiSpec: any) =>
  OpenApiValidator.middleware({
    apiSpec: apiSpec,
    validateApiSpec: true,
    validateRequests: true, // (default)
    validateResponses: true, // false by default
    operationHandlers: join(process.cwd(), "src/controllers"),
  });
