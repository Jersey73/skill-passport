import { Suspense } from 'react'
import Navbar from '@/components/shared/Navbar'
import Hero from '@/components/landing/Hero'
import FeatureCards from '@/components/landing/FeatureCards'
import CallToAction from '@/components/landing/CallToAction'

export default function LandingPage() {
  return (
    <main className="relative min-h-screen bg-[var(--bg-void)]">
      <Navbar />

      {/* Hero uses searchParams — needs Suspense boundary */}
      <Suspense fallback={<div className="min-h-screen" />}>
        <Hero />
      </Suspense>

      <FeatureCards />
      <CallToAction />
    </main>
  )
}
