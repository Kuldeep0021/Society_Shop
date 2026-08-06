/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  experimental: {
    serverComponentsExternalPackages: [
      'mongoose',
      'bcryptjs',
      'razorpay',
      '@sendgrid/mail',
      'next-auth',
    ],
  },
};

module.exports = nextConfig;
