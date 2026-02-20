/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    // Fix ChunkLoadError for Monaco: transpile so Next bundles it correctly
    transpilePackages: ['@monaco-editor/react'],
    // Skip TypeScript type checking during build (runs separately)
    typescript: {
        ignoreBuildErrors: true,
    },
    devIndicators: {
        buildActivity: false,
        appIsrStatus: false,
    },
    async rewrites() {
        // Enforce direct docker routing in Docker production environments to prevent ENOTFOUND
        const isDockerProd = process.env.NODE_ENV === 'production' && process.env.IS_DOCKER !== 'false';

        let backendBase = 'http://127.0.0.1:8001';
        if (isDockerProd) {
            backendBase = process.env.INTERNAL_BACKEND_URL || 'http://backend:8001';
        } else {
            backendBase = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://127.0.0.1:8001';
        }

        return [
            {
                source: '/api/backend/:path*',
                destination: `${backendBase}/:path*`, // Proxy to Backend
            },
        ];
    },
};

export default nextConfig;
