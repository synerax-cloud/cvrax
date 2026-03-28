/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Image optimization for Google OAuth avatars
  images: {
    domains: ['lh3.googleusercontent.com'],
  },
  
  // API rewrites for LaTeX service (Phase 1)
  // Only add rewrites if LATEX_SERVICE_URL is configured
  async rewrites() {
    const rewrites = [];
    
    if (process.env.LATEX_SERVICE_URL) {
      rewrites.push({
        source: '/api/latex/:path*',
        destination: `${process.env.LATEX_SERVICE_URL}/:path*`,
      });
    }
    
    return rewrites;
  },
  
  // Environment variables exposed to browser
  env: {
    NEXT_PUBLIC_APP_NAME: process.env.APP_NAME || 'CVRAX',
    NEXT_PUBLIC_APP_URL: process.env.APP_URL || 'http://localhost:3000',
  },
  
  // Compression
  compress: true,
  
  // Remove X-Powered-By header
  poweredByHeader: false,
};

module.exports = nextConfig;
