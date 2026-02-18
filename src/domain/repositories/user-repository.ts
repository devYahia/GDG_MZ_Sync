import { User } from "@/domain/entities/user";

export interface CreateUserParams extends Omit<User, "id" | "createdAt" | "updatedAt" | "emailVerified" | "xp" | "currentLevel" | "isPremium" | "streakDays"> {
    password?: string; // Optional for OAuth users
}

export interface UpdateUserParams extends Partial<User> { }

export interface IUserRepository {
    findById(id: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    create(data: CreateUserParams): Promise<User>;
    update(id: string, data: UpdateUserParams): Promise<User>;
    updateCredits(id: string, delta: number): Promise<number>;
}
