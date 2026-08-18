import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  test: {
    // Pure-logic tests only. Anything touching Prisma belongs in an integration
    // suite with a real database, not here.
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    environment: "node",
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
