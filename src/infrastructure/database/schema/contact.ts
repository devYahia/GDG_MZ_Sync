import {
    timestamp,
    pgTable,
    text,
    uuid,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const contactSubmissions = pgTable("contact_submissions", {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    fullName: text("full_name").notNull(),
    email: text("email").notNull(),
    subject: text("subject").notNull(),
    message: text("message").notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});
