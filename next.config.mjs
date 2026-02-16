/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    // Fix ChunkLoadError for Monaco: transpile so Next bundles it correctly
    transpilePackages: ['@monaco-editor/react'],
    // Skip ESLint during production build (lint runs separately in CI)
    eslint: {
        ignoreDuringBuilds: true,
    },
    // Skip TypeScript type checking during build (runs separately)
    typescript: {
        ignoreBuildErrors: true,
    },
};

export default nextConfig;
