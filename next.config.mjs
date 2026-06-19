/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lightgrey-flamingo-522119.hostingersite.com",
        pathname: "/wp-content/uploads/**",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'www.sahbavape.com',
          },
        ],
        destination: 'https://sahbavape.com/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
