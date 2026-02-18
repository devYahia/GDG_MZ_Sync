import { db } from "../src/infrastructure/database/drizzle";
import { sql } from "drizzle-orm";
import fs from "fs";
import path from "path";

async function main() {
    const migrationsDir = path.join(process.cwd(), "src/infrastructure/database/migrations");
    const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith(".sql")).sort();

    console.log(`Found ${files.length} migration files.`);

    for (const file of files) {
        console.log(`Processing ${file}...`);
        const migrationSql = fs.readFileSync(path.join(migrationsDir, file), "utf8");
        const statements = migrationSql.split("--> statement-breakpoint");

        for (const statement of statements) {
            if (!statement.trim()) continue;
            const clean = statement.trim();
            try {
                await db.execute(sql.raw(clean));
            } catch (e: any) {
                // Basic idempotency for a hackathon script
                if (
                    e.message.includes("already exists") ||
                    e.message.includes("duplicate") ||
                    e.message.includes("already a primary key")
                ) {
                    // Log and skip
                    // console.log(`  Skipped existing: ${clean.substring(0, 30)}...`);
                } else {
                    console.error(`Error in ${file}:`, e.message);
                    // continue anyway? No, throw.
                    throw e;
                }
            }
        }
    }

    console.log("All migrations processed!");
    process.exit(0);
}

main().catch(err => {
    console.error("Migration failed:", err);
    process.exit(1);
});
