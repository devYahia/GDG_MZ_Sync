import {
    timestamp,
    pgTable,
    text,
    integer,
    jsonb,
    uuid,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./users";

export const simulations = pgTable("simulations", {
    id: uuid("id")
        .primaryKey()
        .default(sql`gen_random_uuid()`),
    userId: uuid("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),

    title: text("title").notNull(),
    context: text("context"),
    domain: text("domain"),
    difficulty: text("difficulty"), // easy/medium/hard
    level: integer("level").default(1),
    estimatedDuration: text("estimated_duration"),

    techStack: text("tech_stack").array().default(sql`'{}'::text[]`),
    overview: text("overview"),
    learningObjectives: text("learning_objectives").array().default(sql`'{}'::text[]`),
    functionalRequirements: text("functional_requirements").array().default(sql`'{}'::text[]`),
    nonFunctionalRequirements: text("non_functional_requirements").array().default(sql`'{}'::text[]`),

    milestones: jsonb("milestones").default(sql`'[]'::jsonb`),
    resources: jsonb("resources").default(sql`'[]'::jsonb`),
    quiz: jsonb("quiz").default(sql`'[]'::jsonb`),

    field: text("field"),
    duration: text("duration"),
    tools: text("tools").array().default(sql`'{}'::text[]`),

    clientPersona: text("client_persona"),
    clientMood: text("client_mood"),
    description: text("description"),

    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});
