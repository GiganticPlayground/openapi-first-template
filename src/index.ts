import { config } from "./config/index";
import express from "express";
import {
  createOpenApiValidatorMiddleware,
  errorHandlerMiddleware,
} from "./middlewares/index";
import swaggerUi from "swagger-ui-express";
import { dirname, join } from "path";
import YAML from "yaml";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load OpenAPI specification
export const apiSpecPath: string = join(__dirname, "../api/openapi.yaml");
const apiSpecContent: string = readFileSync(apiSpecPath, "utf8");

const app = express();

app.get("/", (req, res) => {
  res.send("hello world");
});

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(YAML.parse(apiSpecContent), {
    explorer: true,
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "API Documentation",
  })
);

app.use(createOpenApiValidatorMiddleware(apiSpecPath));
app.use(errorHandlerMiddleware);

app.listen(config.PORT, () => {
  console.log(`Server is running on port ${config.PORT}`);
});
