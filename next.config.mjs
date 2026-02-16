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
};

export default nextConfig;
