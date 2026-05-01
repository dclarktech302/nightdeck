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
      {
        protocol: 'https',
        hostname: 'nightdeck-media.s3.us-east-1.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'nightdeck-media.s3.amazonaws.com',
      },
    ],
  },
}

export default nextConfig