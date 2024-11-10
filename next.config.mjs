/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    experimental: {
        serverActions: {
            allowedOrigins: ['symmetrical-space-giggle-v97wp5jpjv62prgv-3000.com'],
            allowedForwardedHosts: ['symmetrical-space-giggle-v97wp5jpjv62prgv-3000.com'],
        },
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    images: {
        remotePatterns: [{
            protocol: 'https',
            hostname: 'lh3.googleusercontent.com'
        },]
    }
};
// https://lh3.googleusercontent.com/pw/AP1GczNTV486nBxfzYRbsNETqPVqAFhfH9zBypOZpu775N6bvwA8Bq1dJk2ZcW3STY8vCkp0DoCMHmYdtr_GQOtjUJZfVGIqAOb6Q5UybQLXuXkzD21f-LYVtkkXDGENxH9rlj4fnyYfG_AT-V34HmkT5TOt=w945-h968-s-no-gm?authuser=0
export default nextConfig;


