import {
    timestamp,
    pgTable,
    text,
    integer,
    uuid,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./users";

export const achievements = pgTable("achievements", {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    slug: text("slug").unique().notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    icon: text("icon").notNull(),
    category: text("category").notNull(),
    xpReward: integer("xp_reward").default(0).notNull(),
    creditReward: integer("credit_reward").default(0).notNull(),
    rarity: text("rarity").default("common").notNull(), // common, rare, epic, legendary
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const userAchievements = pgTable("user_achievements", {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    achievementId: uuid("achievement_id").notNull().references(() => achievements.id, { onDelete: "cascade" }),
    unlockedAt: timestamp("unlocked_at", { mode: "date" }).defaultNow().notNull(),
});
