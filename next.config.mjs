/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Every page here is per-user/dynamic (auth, messages, admin data).
    // The default 30s client-side router cache was serving stale data on
    // revisits until a hard reload; disabling it for dynamic routes makes
    // navigation always fetch fresh data instead.
    staleTimes: {
      dynamic: 0,
    },
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // The app doesn't use any of these browser APIs, so deny them outright.
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};

export default nextConfig;
