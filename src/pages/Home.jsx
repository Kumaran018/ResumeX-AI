import React from 'react'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import Differentiator from '../components/Differentiator'
import HowItWorks from '../components/HowItWorks'
import Features from '../components/Features'
import FinalCTA from '../components/FinalCTA'
import Footer from '../components/Footer'

export default function Home() {
  return (
    <div className="app-root">
      {/* Organic Warm Background Shapes */}
      <div className="bg-warm-pattern" aria-hidden="true">
        <div className="bg-warm-shape-1"></div>
        <div className="bg-warm-shape-2"></div>
      </div>

      {/* 1. Navbar */}
      <Navbar />

      <main>
        {/* 2. Hero Section with realistic product preview mockup */}
        <Hero />

        {/* 4. Differentiator Section */}
        <Differentiator />

        {/* 5. How It Works Section */}
        <HowItWorks />

        {/* 6. Features Section */}
        <Features />

        {/* 7. Final CTA Section */}
        <FinalCTA />
      </main>

      {/* 8. Footer */}
      <Footer />
    </div>
  )
}
