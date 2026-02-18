import { User } from "@/domain/entities/user";

export type UserDTO = User; // Entity already omits sensitive info if defined correctly, but User entity has everything.
// Actually User entity interface is domain model. It shouldn't leak sensitive data if returned via API.
// NextAuth session user handles sensitive data removal.
// But use cases return User entities.

export type CreateUserDTO = Omit<User, "id" | "createdAt" | "updatedAt" | "emailVerified"> & {
    password?: string;
};

export type UpdateUserDTO = Partial<User>;
