/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["@modelcontextprotocol/sdk", "@google/generative-ai", "playwright"],
};

export default nextConfig;
