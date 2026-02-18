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

                    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
                    const user = result[0];

                    if (!user) return null;
                    if (!user.hashedPassword) return null; // OAuth users have no password

                    const passwordsMatch = await bcrypt.compare(password, user.hashedPassword);
                    if (passwordsMatch) return user;
                }

                console.log("Invalid credentials");
                return null;
            },
        }),
    ],
});
