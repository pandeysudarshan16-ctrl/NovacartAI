import { defineConfig } from "vitest/config";
import path from "path";
import fs from "fs";

// Simple helper to load .env variables into process.env if dotenv is not loaded
const envPath = path.resolve(__dirname, ".env");
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, "utf-8");
  envConfig.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const parts = trimmed.split("=");
      const key = parts[0].trim();
      // Combine the rest of the array in case the value contains '=' (like urls)
      let val = parts.slice(1).join("=").trim();
      // Strip quotes if present
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      process.env[key] = val;
    }
  });
}

// Set NODE_ENV to test for test environment
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(process.env as any).NODE_ENV = "test";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "node",
  },
});
