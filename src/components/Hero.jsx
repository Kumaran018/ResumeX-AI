import React from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Check, 
  AlertTriangle, 
  X, 
  ArrowRight, 
  Sparkles, 
  FileText, 
  CheckCircle2, 
  SearchCheck,
  Building2,
  TrendingUp
} from 'lucide-react'
import './Hero.css'

export default function Hero() {
  const navigate = useNavigate()

  const scrollToSection = (e, id) => {
    e.preventDefault()
    const element = document.querySelector(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section className="hero-section" id="hero-cta">
      <div className="container">
        <div className="hero-grid">
          {/* Left Column: Value Proposition & CTAs */}
          <div className="hero-left">
            <h1 className="hero-headline" style={{ display: 'inline-grid', gridTemplateColumns: 'auto auto', columnGap: '16px', textAlign: 'left' }}>
              <span style={{ textAlign: 'right' }}>Your Resume</span>
              <span className="accent">Your Evidence</span>
              <span style={{ gridColumn: '1 / span 2', textAlign: 'center' }}>Your Career...</span>
            </h1>

            <p className="hero-subtext">
              Analyze your resume against a target job and discover which skills are supported by real evidence, where your gaps are, and how to improve your chances of getting noticed.
            </p>

            <div className="hero-cta-group">
              <button 
                className="btn btn-primary btn-lg"
                onClick={() => navigate('/signin')}
              >
                <span>Analyze My Resume</span>
                <ArrowRight size={18} />
              </button>
              <a 
                href="#how-it-works" 
                className="btn btn-secondary btn-lg"
                onClick={(e) => scrollToSection(e, '#how-it-works')}
              >
                <span>See How It Works</span>
              </a>
            </div>

            {/* Trust Indicators */}
            <div className="hero-trust-indicators">
              <div className="trust-item">
                <div className="trust-icon">
                  <Check size={13} strokeWidth={3} />
                </div>
                <span>Evidence-based analysis</span>
              </div>
              <div className="trust-item">
                <div className="trust-icon">
                  <Check size={13} strokeWidth={3} />
                </div>
                <span>Job-specific insights</span>
              </div>
              <div className="trust-item">
                <div className="trust-icon">
                  <Check size={13} strokeWidth={3} />
                </div>
                <span>Personalized interview questions</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
