/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lightgrey-flamingo-522119.hostingersite.com",
        pathname: "/wp-content/uploads/**",
      },
    ],
  },
};

export default nextConfig;
