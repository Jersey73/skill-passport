import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://skill-passport.vercel.app'),
  title: {
    default: 'Skill Passport — Verified Developer Credentials',
    template: '%s | Skill Passport',
  },
  description:
    'AI-powered technical skill verification for developers. Take a secure assessment, earn a verified Skill Passport, and share it with the world.',
  keywords: ['developer', 'coding assessment', 'skill verification', 'AI evaluation', 'portfolio'],
  authors: [{ name: 'Skill Passport' }],
  openGraph: {
    type:        'website',
    locale:      'en_US',
    url:         'https://skillpassport.dev',
    siteName:    'Skill Passport',
    title:       'Skill Passport — Verified Developer Credentials',
    description: 'Take a secure coding assessment. Get an AI-verified score. Share your Skill Passport.',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card:        'summary_large_image',
    title:       'Skill Passport',
    description: 'AI-powered developer skill verification.',
    images:      ['/og-image.png'],
  },
  robots: {
    index:  true,
    follow: true,
  },
}

export const viewport: Viewport = {
  themeColor: '#03030a',
  colorScheme: 'dark',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        {/* Favicon */}
        <link rel="icon" href="/favicon.png" type="image/png" />
        {/* Preconnect to Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-noise antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}
