import React from 'react'
import { ArrowRight, Sparkles } from 'lucide-react'
import './FinalCTA.css'

export default function FinalCTA() {
  const handleScrollToTop = (e) => {
    e.preventDefault()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <section className="cta-section">
      <div className="container">
        <div className="cta-banner">
          <div className="cta-content">
            <h2 className="cta-title">
              Know what your resume proves.
            </h2>
            <p className="cta-subtext">
              Turn your resume into a clearer picture of your skills, evidence, and career readiness.
            </p>
            <div className="cta-button-wrapper">
              <a 
                href="#hero-cta" 
                className="btn btn-primary btn-lg"
                onClick={handleScrollToTop}
              >
                <span>Analyze My Resume</span>
                <ArrowRight size={18} />
              </a>
            </div>
            <p className="cta-micro-guarantee">
              ✓ Free initial evidence scan • No credit card required • Instant results
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
