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
        const isProd = process.env.NODE_ENV === 'production';
        const backendBase = process.env.NEXT_PUBLIC_API_URL
            || process.env.API_URL
            || (isProd ? 'http://backend:8001' : 'http://127.0.0.1:8001');
        return [
            {
                source: '/api/backend/:path*',
                destination: `${backendBase}/:path*`, // Proxy to Backend
            },
        ];
    },
};

export default nextConfig;
