/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    ALPHAGENOME_API_KEY: process.env.ALPHAGENOME_API_KEY,
  },
}

module.exports = nextConfig