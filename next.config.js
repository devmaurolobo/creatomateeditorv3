/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  compiler: {
    styledComponents: true,
  },
  images: {
    domains: ['creatomate-static.s3.amazonaws.com'],
  }
};

module.exports = nextConfig;
