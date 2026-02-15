/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    // Fix ChunkLoadError for Monaco: transpile so Next bundles it correctly
    transpilePackages: ['@monaco-editor/react'],
};

export default nextConfig;
