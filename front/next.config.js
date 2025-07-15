module.exports = {
    output: 'standalone',
    webpack: (config, { isServer }) => {
        if (!isServer) {
            config.resolve.fallback = {
                fs: false,
            };
        }
        return config;
    },
    async redirects() {
        return [
            {
                source: '/',
                destination: '/index',
                permanent: true,
            },
        ];
    },
};