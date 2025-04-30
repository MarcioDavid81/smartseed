/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        hostname: "source.unsplash.com",
        hostname: "plus.unsplash.com",
        pathname: "**",
      },
    ],
  },
};

export default nextConfig;
