import { config } from "./config/index";
import express from "express";
import cors from "cors";
import helmet from "helmet";
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
const apiSpec: any = YAML.parse(apiSpecContent);

const app = express();

// Security and body parsing middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("hello world");
});

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(apiSpec, {
    explorer: true,
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "API Documentation",
  })
);

app.use(createOpenApiValidatorMiddleware(apiSpec));
app.use(errorHandlerMiddleware);

app.listen(config.PORT, () => {
  console.log(`Server is running on port ${config.PORT}`);
});
