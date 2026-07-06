/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ["pdfkit", "exceljs", "postgres"],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
