
import {
    timestamp,
    pgTable,
    text,
    jsonb,
    uuid,
    index,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./users";

export const activityLog = pgTable("activity_log", {
    id: uuid("id")
        .primaryKey()
        .default(sql`gen_random_uuid()`),
    userId: uuid("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),

    eventType: text("event_type").notNull(),
    // "simulation_started", "simulation_completed", "chat_message_sent",
    // "code_review_requested", "code_review_completed", "interview_started",
    // "interview_completed", "quiz_completed", "report_generated", "achievement_unlocked"

    contextType: text("context_type"), // "simulation", "review", "interview"
    contextId: text("context_id"), // UUID or string ID

    metadata: jsonb("metadata").default(sql`'{}'::jsonb`),

    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
}, (table) => {
    return {
        userIdIdx: index("idx_activity_log_user_id").on(table.userId),
        userEventIdx: index("idx_activity_log_user_event").on(table.userId, table.eventType),
        createdIdx: index("idx_activity_log_created").on(table.createdAt),
    };
});
