import {
    timestamp,
    pgTable,
    text,
    uuid,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { simulations } from "./simulations";

export const personas = pgTable("personas", {
    id: uuid("id")
        .primaryKey()
        .default(sql`gen_random_uuid()`),
    simulationId: uuid("simulation_id")
        .notNull()
        .references(() => simulations.id, { onDelete: "cascade" }),

    name: text("name").notNull(),
    role: text("role").notNull(),
    personality: text("personality"),
    systemPrompt: text("system_prompt"),
    initialMessage: text("initial_message"),

    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});
