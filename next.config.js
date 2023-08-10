/** @type {import('next').NextConfig} */

const internalBaseService = JSON.parse(
  process.env.NEXT_PUBLIC_BUSINESS_INTERNAL_BASE_SERVICE
);

const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: "/api/v1/:path*",
        headers: [
          ...Object.entries(internalBaseService.headers).map(
            ([key, value]) => ({ key, value }),
            { key: "Hello", value: "World" }
          ),
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${internalBaseService.url_one}/:path*`,
      },
      {
        source: "/api/v1-baa/:path*",
        destination: `${internalBaseService.url_two}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
