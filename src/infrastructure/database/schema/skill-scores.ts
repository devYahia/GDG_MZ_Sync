
import {
    timestamp,
    pgTable,
    text,
    integer,
    uuid,
    index,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./users";

export const skillScores = pgTable("skill_scores", {
    id: uuid("id")
        .primaryKey()
        .default(sql`gen_random_uuid()`),
    userId: uuid("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),

    sourceType: text("source_type").notNull(),
    // "chat_analysis", "code_review", "interview_feedback"

    sourceId: text("source_id"), // Can be null if it's a manual override or general assessment

    communication: integer("communication").default(0).notNull(),
    codeQuality: integer("code_quality").default(0).notNull(),
    requirementsGathering: integer("requirements_gathering").default(0).notNull(),
    technicalDepth: integer("technical_depth").default(0).notNull(),
    problemSolving: integer("problem_solving").default(0).notNull(),
    professionalism: integer("professionalism").default(0).notNull(),

    overallScore: integer("overall_score").default(0).notNull(),

    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),

}, (table) => {
    return {
        userIdIdx: index("idx_skill_scores_user_id").on(table.userId),
        sourceIdx: index("idx_skill_scores_source").on(table.userId, table.sourceType),
    };
});
