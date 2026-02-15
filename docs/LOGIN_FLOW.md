# Login Flow Documentation

## Overview
This document describes the complete login flow from the landing page to the dashboard.

## Flow Steps

### 1. Landing Page (`/`)
- User clicks "Log in" button in the navbar
- Button is wrapped with `Link` component pointing to `/login`
- Navigation is handled by Next.js router

### 2. Login Page (`/login`)
**Location**: `app/(auth)/login/page.tsx`

**UI Components**:
- Email input field (required)
- Password input field (required, min 6 characters)
- Submit button with loading state
- Link to signup page for new users

**Form Handling**:
```typescript
function handleSubmit(formData: FormData) {
    startTransition(async () => {
        const result = await login(formData)
        
        if (result?.error) {
            toast.error(result.error)
        }
    })
}
```

### 3. Server Action (`login`)
**Location**: `app/(auth)/actions.ts`

**Process**:
1. Extract email and password from FormData
2. Validate using Zod schema:
   - Email must be valid format
   - Password must be 6-72 characters
3. Call Supabase `signInWithPassword()`
4. Handle errors and show toast notifications
5. On success:
   - Revalidate layout cache
   - Redirect to `/dashboard`

**Code**:
```typescript
export async function login(formData: FormData): Promise<AuthResult> {
    const rawData = {
        email: formData.get("email") as string,
        password: formData.get("password") as string,
    }

    const validated = authSchema.safeParse(rawData)
    if (!validated.success) {
        return { error: validated.error.issues[0].message }
    }

    const supabase = await createClient()

    const { error } = await supabase.auth.signInWithPassword({
        email: validated.data.email,
        password: validated.data.password,
    })

    if (error) {
        return { error: error.message }
    }

    revalidatePath("/", "layout")
    redirect("/dashboard")
}
```

### 4. Dashboard Page (`/dashboard`)
**Location**: `app/(dashboard)/dashboard/page.tsx`

**Authentication Check**:
- Server component fetches user from Supabase
- If no user, redirects to `/login`
- If user exists but onboarding not completed, redirects to `/signup`

**Profile Loading**:
- Fetches user profile from `profiles` table
- Displays personalized welcome message
- Shows user's field and experience level
- Renders available simulations

## Security Features

1. **Server-Side Validation**: All form data validated with Zod schemas
2. **Supabase Auth**: Secure authentication with JWT tokens
3. **Row Level Security**: Database enforces RLS policies
4. **Server Components**: Sensitive operations on server only
5. **Type Safety**: Full TypeScript coverage

## Error Handling

1. **Validation Errors**: Shown via toast notifications
2. **Auth Errors**: Supabase error messages displayed to user
3. **Network Errors**: Handled by Supabase client
4. **Redirect Errors**: Caught by Next.js error boundaries

## User Experience

1. **Loading States**: Button shows spinner during submission
2. **Disabled Inputs**: Form disabled while processing
3. **Toast Notifications**: Clear error messages
4. **Smooth Transitions**: Next.js navigation with loading states
5. **Premium Theme**: Consistent dark theme with purple accents

## Testing Checklist

- [ ] Click "Log in" from landing page navigates to `/login`
- [ ] Email validation works (invalid format shows error)
- [ ] Password validation works (< 6 chars shows error)
- [ ] Incorrect credentials show error toast
- [ ] Correct credentials redirect to `/dashboard`
- [ ] Dashboard shows user profile data
- [ ] Logout functionality works
- [ ] Protected routes redirect to login when not authenticated
