
import { Client } from "pg";
// import { config } from "dotenv";
// config({ path: ".env" });


const sql = `
CREATE TABLE IF NOT EXISTS "activity_log" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "user_id" uuid NOT NULL,
    "event_type" text NOT NULL,
    "context_type" text,
    "context_id" text,
    "metadata" jsonb DEFAULT '{}'::jsonb,
    "created_at" timestamp DEFAULT now() NOT NULL,
    FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE cascade
);

CREATE INDEX IF NOT EXISTS "idx_activity_log_user_id" ON "activity_log" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_activity_log_user_event" ON "activity_log" ("user_id", "event_type");
CREATE INDEX IF NOT EXISTS "idx_activity_log_created" ON "activity_log" ("created_at");

CREATE TABLE IF NOT EXISTS "skill_scores" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "user_id" uuid NOT NULL,
    "source_type" text NOT NULL,
    "source_id" text,
    "communication" integer DEFAULT 0 NOT NULL,
    "code_quality" integer DEFAULT 0 NOT NULL,
    "requirements_gathering" integer DEFAULT 0 NOT NULL,
    "technical_depth" integer DEFAULT 0 NOT NULL,
    "problem_solving" integer DEFAULT 0 NOT NULL,
    "professionalism" integer DEFAULT 0 NOT NULL,
    "overall_score" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE cascade
);

CREATE INDEX IF NOT EXISTS "idx_skill_scores_user_id" ON "skill_scores" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_skill_scores_source" ON "skill_scores" ("user_id", "source_type");

CREATE TABLE IF NOT EXISTS "interview_sessions" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "user_id" uuid NOT NULL,
    "role" text NOT NULL,
    "difficulty" text NOT NULL,
    "focus_areas" text[] DEFAULT '{}'::text[],
    "status" text NOT NULL,
    "transcript" jsonb DEFAULT '[]'::jsonb,
    "feedback_scores" jsonb DEFAULT '{}'::jsonb,
    "overall_rating" integer,
    "duration_minutes" integer DEFAULT 0,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "completed_at" timestamp,
    FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE cascade
);

CREATE INDEX IF NOT EXISTS "idx_interview_sessions_user_id" ON "interview_sessions" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_interview_sessions_status" ON "interview_sessions" ("user_id", "status");
`;

async function main() {
    const client = new Client({
        connectionString: "postgres://postgres:APJLYRamsmJ0PdFkQ4zo4VnQCmxUrIZi0nJIA7UwPLs3iipu2BBvfFzySmOx8n4Y@10.0.1.7:5432/postgres",
    });


    try {
        await client.connect();
        console.log("Connected to database");
        await client.query(sql);
        console.log("Migration executed successfully");
    } catch (err) {
        console.error("Migration failed", err);
        process.exit(1);
    } finally {
        await client.end();
    }
}

main();
