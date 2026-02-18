# Login Flow Documentation

## Overview
This document describes the current authentication flow using NextAuth.js (Auth.js v5) and Drizzle ORM.

## Flow Steps

### 1. Landing Page (`/`)
- User clicks "Log in" button in the navbar.
- Navigation points to `/login`.

### 2. Login Page (`/login`)
**Location**: `src/app/(auth)/login/page.tsx`

**Process**:
- User enters Email and Password.
- `loginAction` (server action) is called upon form submission.

### 3. Server Action (`loginAction`)
**Location**: `src/app/actions/auth-actions.ts`

**Steps**:
1. Validate input using Zod.
2. Call `signIn("credentials", ...)` from `@/infrastructure/auth/auth`.
3. NextAuth triggers the `authorize` callback in `src/infrastructure/auth/auth.ts`.
4. `authorize` callback uses Drizzle to find the user and `bcrypt` to verify the password.
5. On success, a JWT session is created.
6. User is redirected to `/dashboard`.

### 4. Dashboard Protected Layout
**Location**: `src/app/(dashboard)/layout.tsx`

- Uses `auth()` to check for a valid session.
- If no session, redirects to `/login`.
- If session exists but profile is incomplete (no `field` or `experienceLevel`), redirects to `/onboarding`.

## Security Features

1. **Auth.js v5**: Industry-standard session management.
2. **Password Hashing**: Uses `bcryptjs` for secure storage.
3. **Zod Validation**: Strict schema validation for all inputs.
4. **Environment Security**: Sensitive keys (`AUTH_SECRET`, `DATABASE_URL`) stored in env vars.

## Testing Checklist

- [ ] Click "Log in" navigates to `/login`.
- [ ] Invalid email format shows error.
- [ ] Wrong password shows error toast.
- [ ] Correct credentials redirect to `/dashboard`.
- [ ] Unauthenticated access to `/dashboard` redirects to `/login`.
- [ ] Logout clears the session and redirects to home.
