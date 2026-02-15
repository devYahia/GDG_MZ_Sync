import { createClient } from './server'

/**
 * Get current authenticated user (server-side)
 */
export async function getCurrentUser() {
    const supabase = await createClient()
    const {
        data: { user },
        error,
    } = await supabase.auth.getUser()

    if (error) {
        console.error('Error getting user:', error)
        return null
    }

    return user
}

/**
 * Check if user is authenticated (server-side)
 */
export async function isAuthenticated(): Promise<boolean> {
    const user = await getCurrentUser()
    return !!user
}
