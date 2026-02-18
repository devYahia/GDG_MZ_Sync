/**
 * Shared utility to get the backend API base URL.
 * Handles trailing slashes and environment variable fallback.
 */
export const getBackendBase = () => {
    const url = process.env.NEXT_PUBLIC_API_URL ?? process.env.API_URL ?? "http://127.0.0.1:8001"
    return url.replace(/\/+$/, "")
}
