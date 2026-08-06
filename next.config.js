/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  swcMinify: false,
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
