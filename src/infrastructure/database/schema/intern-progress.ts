import {
    timestamp,
    pgTable,
    text,
    boolean,
    unique,
    uuid,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./users";

export const internProgress = pgTable("intern_progress", {
    id: uuid("id")
        .primaryKey()
        .default(sql`gen_random_uuid()`),
    userId: uuid("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),

    projectId: text("project_id").notNull(),
    status: text("status").notNull().default("in_progress"),

    lastActivityAt: timestamp("last_activity_at", { mode: "date" }).defaultNow(),
    lastReviewAt: timestamp("last_review_at", { mode: "date" }),
    lastReviewApproved: boolean("last_review_approved"),

    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
}, (t) => ({
    unq: unique().on(t.userId, t.projectId),
}));
