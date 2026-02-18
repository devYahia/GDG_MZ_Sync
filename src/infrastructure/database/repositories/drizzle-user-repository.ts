import { IUserRepository, CreateUserParams, UpdateUserParams } from "@/domain/repositories/user-repository";
import { User } from "@/domain/entities/user";
import { db } from "../drizzle";
import { users } from "../schema/users";
import { eq, sql } from "drizzle-orm";

export class DrizzleUserRepository implements IUserRepository {
    async findById(id: string): Promise<User | null> {
        const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
        return (result[0] as unknown as User) || null;
    }

    async findByEmail(email: string): Promise<User | null> {
        const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
        return (result[0] as unknown as User) || null;
    }

    async create(data: CreateUserParams): Promise<User> {
        const result = await db.insert(users).values({
            ...data,
            // Default values handled by DB defaults usually, but here strict typing might require them?
            // Drizzle insert inputs are partial if defaults exist.
            // But we passed Omit<User, ...>.
            // We map explicit fields.
            name: data.name,
            email: data.email,
            image: data.image,
            hashedPassword: data.password, // map password to hashedPassword
            bio: data.bio,
            field: data.field,
            experienceLevel: data.experienceLevel,
            interests: data.interests as any, // Cast for array compatibility if needed
            region: data.region,
            credits: data.credits,
            onboardingCompleted: data.onboardingCompleted,
        }).returning();

        return result[0] as unknown as User;
    }

    async update(id: string, data: UpdateUserParams): Promise<User> {
        const result = await db.update(users)
            .set({
                ...data,
                updatedAt: new Date(),
            })
            .where(eq(users.id, id))
            .returning();

        return result[0] as unknown as User;
    }

    async updateCredits(id: string, delta: number): Promise<number> {
        const result = await db.update(users)
            .set({
                credits: sql`${users.credits} + ${delta}`,
                updatedAt: new Date(),
            })
            .where(eq(users.id, id))
            .returning({ credits: users.credits });

        return result[0]?.credits || 0;
    }
}
