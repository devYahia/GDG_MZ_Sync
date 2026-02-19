
import {
    timestamp,
    pgTable,
    text,
    jsonb,
    integer,
    uuid,
    index,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./users";

export const interviewSessions = pgTable("interview_sessions", {
    id: uuid("id")
        .primaryKey()
        .default(sql`gen_random_uuid()`),
    userId: uuid("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),

    role: text("role").notNull(),
    difficulty: text("difficulty").notNull(), // "junior", "mid", "senior"
    focusAreas: text("focus_areas").array().default(sql`'{}'::text[]`),
    status: text("status").notNull(), // "active", "completed", "abandoned"

    transcript: jsonb("transcript").default(sql`'[]'::jsonb`),
    feedbackScores: jsonb("feedback_scores").default(sql`'{}'::jsonb`),
    overallRating: integer("overall_rating"),

    durationMinutes: integer("duration_minutes").default(0),

    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    completedAt: timestamp("completed_at", { mode: "date" }),
}, (table) => {
    return {
        userIdIdx: index("idx_interview_sessions_user_id").on(table.userId),
        statusIdx: index("idx_interview_sessions_status").on(table.userId, table.status),
    };
});
