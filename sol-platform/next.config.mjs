/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co', // This allows your real animal photos to load safely!
      },
      {
        protocol: 'https',
        hostname: 'placehold.co', // This allows the placeholder API!
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com', // Just in case you are using this API instead!
      }
    ],
  },
};

export default nextConfig;