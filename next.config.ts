import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.amazonaws.com', // AWS S3
      },
      {
        protocol: 'https',
        hostname: 'chart.googleapis.com', // QR codes
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co', // Supabase storage if used later
      },
    ],
  },
}

export default nextConfig