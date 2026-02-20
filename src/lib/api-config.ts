/**
 * Shared utility to get the backend API base URL.
 * Handles trailing slashes and environment variable fallback.
 */
export const getBackendBase = () => {
    if (typeof window !== "undefined") {
        // Client-side routes through Next.js rewrite
        return "/api/backend"
    }
    // Server-side directly connects to Docker container or env var
    const isProd = process.env.NODE_ENV === "production"
    const url = process.env.NEXT_PUBLIC_API_URL ?? process.env.API_URL ?? (isProd ? "http://backend:8001" : "http://127.0.0.1:8001")
    return url.replace(/\/+$/, "")
}
