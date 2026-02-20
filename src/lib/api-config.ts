/**
 * Shared utility to get the backend API base URL.
 * Handles trailing slashes and environment variable fallback.
 */
export const getBackendBase = () => {
    if (typeof window !== "undefined") {
        // Client-side routes through Next.js rewrite
        return "/api/backend"
    }

    // Always prioritize the direct Docker service name in production server-side 
    // to bypass external DNS resolution (fixes ENOTFOUND).
    if (process.env.NODE_ENV === "production" && process.env.IS_DOCKER !== "false") {
        return "http://backend:8001"
    }

    const url = process.env.INTERNAL_BACKEND_URL ?? process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8001"
    return url.replace(/\/+$/, "")
}
