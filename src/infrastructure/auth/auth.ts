import NextAuth from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "../database/drizzle"; // Absolute import might be safer if aliases not working perfectly yet? 
// ../database/drizzle is relative to src/infrastructure/auth/
import { authConfig } from "./auth.config";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { users } from "../database/schema/users";
import { eq } from "drizzle-orm";

// Make sure to export proper runtime config if needed
// But implementation uses node-postgres so it's Node runtime.

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    adapter: DrizzleAdapter(db) as any, // Type mismatch workaround sometimes needed
    session: { strategy: "jwt" },
    providers: [
        Credentials({
            async authorize(credentials) {
                const parsedCredentials = z
                    .object({ email: z.string().email(), password: z.string().min(6) })
                    .safeParse(credentials);

                if (parsedCredentials.success) {
                    const { email, password } = parsedCredentials.data;

                    console.log(`[Auth] Attempting login for email: ${email}`);

                    try {
                        const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
                        const user = result[0];

                        if (!user) {
                            console.log(`[Auth] User not found for email: ${email}`);
                            return null;
                        }

                        if (!user.hashedPassword) {
                            console.log(`[Auth] User has no password (OAuth user): ${email}`);
                            return null;
                        }

                        const passwordsMatch = await bcrypt.compare(password, user.hashedPassword);
                        if (passwordsMatch) {
                            console.log(`[Auth] Login successful for email: ${email}`);
                            return user;
                        } else {
                            console.log(`[Auth] Password mismatch for email: ${email}`);
                        }
                    } catch (error) {
                        console.error("[Auth] Database error during login:", error);
                        return null;
                    }
                }

                console.log("Invalid credentials or validation failed");
                return null;
            },
        }),
    ],
});
