import type { NextConfig } from 'next'

const allowedOrigins = ['localhost:3000']

// Add production / preview domains for Vercel
if (process.env.NEXT_PUBLIC_APP_URL) {
  try {
    const host = new URL(process.env.NEXT_PUBLIC_APP_URL).host
    if (host) allowedOrigins.push(host)
  } catch { /* ignore parse errors */ }
}
if (process.env.VERCEL_URL) {
  allowedOrigins.push(process.env.VERCEL_URL)
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },
  experimental: {
    serverActions: { allowedOrigins },
  },
}

export default nextConfig
