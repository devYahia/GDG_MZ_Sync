import {
    timestamp,
    pgTable,
    text,
    primaryKey,
    integer,
    boolean,
    uuid,
    varchar,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import type { AdapterAccountType } from "next-auth/adapters";

export const users = pgTable("user", {
    id: uuid("id")
        .primaryKey()
        .default(sql`gen_random_uuid()`),
    name: text("name"),
    email: text("email").unique().notNull(),
    emailVerified: timestamp("emailVerified", { mode: "date" }),
    image: text("image"),
    hashedPassword: text("hashed_password"),

    // Custom fields
    bio: text("bio"),
    field: text("field").default("frontend").notNull(),
    experienceLevel: text("experience_level").default("student").notNull(),
    interests: text("interests").array().default(sql`'{}'::text[]`),
    region: text("region"),
    credits: integer("credits").default(10).notNull(),
    onboardingCompleted: boolean("onboarding_completed").default(false).notNull(),

    // Gamification
    xp: integer("xp").default(0).notNull(),
    currentLevel: integer("current_level").default(1).notNull(),
    isPremium: boolean("is_premium").default(false).notNull(),
    streakDays: integer("streak_days").default(0).notNull(),

    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});
