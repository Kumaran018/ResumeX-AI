import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldCheck, Menu, X, ArrowRight } from 'lucide-react'
import './Navbar.css'

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navigate = useNavigate()

  const handleNavClick = (e, targetId) => {
    e.preventDefault()
    setMobileMenuOpen(false)
    const element = document.querySelector(targetId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <header className="navbar-wrapper">
      <div className="container">
        <nav className="navbar" aria-label="Main Navigation">
          {/* Logo */}
          <a href="#" className="brand" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>
            <div className="brand-icon">
              <ShieldCheck size={20} strokeWidth={2.4} />
            </div>
            <div className="brand-name">
              <span>ResumeX</span>
              <span className="brand-badge">AI</span>
            </div>
          </a>

          {/* Center Links */}
          <ul className="nav-menu">
            <li>
              <a 
                href="#features" 
                className="nav-link"
                onClick={(e) => handleNavClick(e, '#features')}
              >
                Features
              </a>
            </li>
            <li>
              <a 
                href="#how-it-works" 
                className="nav-link"
                onClick={(e) => handleNavClick(e, '#how-it-works')}
              >
                How It Works
              </a>
            </li>
            <li>
              <a 
                href="#why-resumex" 
                className="nav-link"
                onClick={(e) => handleNavClick(e, '#why-resumex')}
              >
                Why ResumeX
              </a>
            </li>
            <li>
              <a 
                href="#about" 
                className="nav-link"
                onClick={(e) => handleNavClick(e, '#about')}
              >
                About
              </a>
            </li>
          </ul>

          {/* Right Action */}
          <div className="nav-actions">
            <button 
              className="btn btn-primary btn-sm"
              onClick={() => navigate('/signin')}
            >
              <span>Get Started</span>
            </button>
            
            <button 
              className="mobile-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile Drawer */}
      <div className={`mobile-drawer ${mobileMenuOpen ? 'open' : ''}`}>
        <ul className="mobile-nav-list">
          <li>
            <a 
              href="#features" 
              className="mobile-nav-link"
              onClick={(e) => handleNavClick(e, '#features')}
            >
              Features
            </a>
          </li>
          <li>
            <a 
              href="#how-it-works" 
              className="mobile-nav-link"
              onClick={(e) => handleNavClick(e, '#how-it-works')}
            >
              How It Works
            </a>
          </li>
          <li>
            <a 
              href="#why-resumex" 
              className="mobile-nav-link"
              onClick={(e) => handleNavClick(e, '#why-resumex')}
            >
              Why ResumeX
            </a>
          </li>
          <li>
            <a 
              href="#about" 
              className="mobile-nav-link"
              onClick={(e) => handleNavClick(e, '#about')}
            >
              About
            </a>
          </li>
        </ul>
        <button 
          className="btn btn-primary"
          style={{ width: '100%', marginTop: '16px' }}
          onClick={() => {
            setMobileMenuOpen(false);
            navigate('/signin');
          }}
        >
          <span>Get Started</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </header>
  )
}
