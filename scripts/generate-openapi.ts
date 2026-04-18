import fs from "fs";
import path from "path";
import { generateSwaggerSpec } from "../src/config/swaggerConfig";

const outputPath = path.resolve(__dirname, "../openapi.json");
const swaggerSpec = generateSwaggerSpec();

fs.writeFileSync(outputPath, JSON.stringify(swaggerSpec, null, 2), "utf-8");
console.log(`OpenAPI spec written to ${outputPath}`);
