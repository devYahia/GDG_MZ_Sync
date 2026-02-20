const nextConfig = {
    async rewrites() {
        return [
            {
                source: '/api/backend/:path*',
                destination: 'http://backend:8001/:path*', // Proxy to Backend
            },
        ];
    },
};
console.log(nextConfig);
