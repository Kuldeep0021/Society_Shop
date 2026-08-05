const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  transpilePackages: [
    'firebase',
    '@firebase/auth',
    '@firebase/firestore',
    '@firebase/storage',
    '@firebase/app',
    '@firebase/util',
    '@firebase/component',
  ],
  experimental: {
    serverComponentsExternalPackages: [
      'firebase-admin',
      'razorpay',
      '@sendgrid/mail',
    ],
  },
  webpack: (config, { isServer }) => {
    config.cache = false;
    if (isServer) {
      // Force browser condition for @firebase/auth so it doesn't pull in
      // the Node ESM build (which imports undici and uses private class
      // fields that SWC can't parse in this Next version). Use an absolute
      // path to bypass the package "exports" field restrictions.
      const authBrowserBuild = path.join(
        process.cwd(),
        'node_modules/@firebase/auth/dist/esm2017/index.js',
      );
      config.resolve = {
        ...config.resolve,
        conditionNames: ['browser', 'import', 'module', 'default', 'require'],
        alias: {
          ...config.resolve.alias,
          '@firebase/auth': authBrowserBuild,
        },
      };
    }
    return config;
  },
};

module.exports = nextConfig;
