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
};

export default nextConfig;
