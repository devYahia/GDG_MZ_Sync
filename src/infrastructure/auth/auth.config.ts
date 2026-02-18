import type { NextAuthConfig } from "next-auth";

export const authConfig = {
    pages: {
        signIn: '/login',
        newUser: '/onboarding'
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const onDashboard = nextUrl.pathname.startsWith('/dashboard');
            const onAuth = nextUrl.pathname.startsWith('/login') || nextUrl.pathname.startsWith('/signup');

            if (onDashboard) {
                if (isLoggedIn) return true;
                return false; // Redirect unauthenticated users to login page
            } else if (onAuth) {
                if (isLoggedIn) {
                    return Response.redirect(new URL('/dashboard', nextUrl));
                }
                return true;
            }
            return true;
        },
        session({ session, token }) {
            if (token.sub && session.user) {
                session.user.id = token.sub;
            }
            return session;
        },
        jwt({ token, user, trigger, session }) {
            if (trigger === "update" && session?.user) {
                return {
                    ...token,
                    ...session.user
                }
            }
            return token;
        }
    },
    providers: [], // Providers added in auth.ts
} satisfies NextAuthConfig;
