import React from 'react'
import { ShieldCheck } from 'lucide-react'
import './Footer.css'

export default function Footer() {
  const scrollTo = (e, id) => {
    e.preventDefault()
    const el = document.querySelector(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <footer className="site-footer" id="about">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <a 
              href="#" 
              className="footer-logo"
              onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
            >
              <div className="brand-icon" style={{ width: '28px', height: '28px' }}>
                <ShieldCheck size={16} strokeWidth={2.4} />
              </div>
              <span>ResumeX AI</span>
            </a>
            <p className="footer-tagline">
              Evidence-Based Resume & Career Intelligence
            </p>
          </div>

          <nav className="footer-nav" aria-label="Footer Navigation">
            <a 
              href="#features" 
              className="footer-link"
              onClick={(e) => scrollTo(e, '#features')}
            >
              Features
            </a>
            <a 
              href="#how-it-works" 
              className="footer-link"
              onClick={(e) => scrollTo(e, '#how-it-works')}
            >
              How It Works
            </a>
            <a 
              href="#why-resumex" 
              className="footer-link"
              onClick={(e) => scrollTo(e, '#why-resumex')}
            >
              About
            </a>
            <a 
              href="#hero-cta" 
              className="footer-link"
              onClick={(e) => scrollTo(e, '#hero-cta')}
            >
              Contact
            </a>
          </nav>
        </div>

        <div className="footer-bottom">
          <div>
            © 2026 ResumeX AI. All rights reserved.
          </div>
          <div className="footer-terms">
            <a href="#about" onClick={(e) => scrollTo(e, '#about')}>Privacy Policy</a>
            <span>•</span>
            <a href="#about" onClick={(e) => scrollTo(e, '#about')}>Terms of Service</a>
            <span>•</span>
            <a href="#about" onClick={(e) => scrollTo(e, '#about')}>Security & Verification</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
