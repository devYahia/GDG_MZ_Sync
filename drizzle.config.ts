import { defineConfig } from "drizzle-kit";

// Fallback for local development if .env is loaded
const dbUrl = process.env.DATABASE_URL;

export default defineConfig({
    schema: "./src/infrastructure/database/schema/index.ts",
    out: "./src/infrastructure/database/migrations",
    dialect: "postgresql",
    dbCredentials: {
        url: dbUrl!,
    },
    verbose: true,
    strict: true,
});
