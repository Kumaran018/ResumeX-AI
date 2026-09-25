import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '../utils/api'
import { ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react'
import './SignUp.css'

export default function SignUp() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSignUp = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!name || !email || !password) {
      setError('Please fill in all fields.')
      return
    }

    setIsLoading(true)
    try {
      await api.signup({ name, email, password })

      setSuccess('Account created successfully! Redirecting to login...')
      
      // Redirect to sign in page after short delay
      setTimeout(() => {
        navigate('/signin')
      }, 1500)
    } catch (err) {
      setError(err.message || 'Network error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="signup-container">
      <div className="signup-card">
        <Link to="/" className="back-link">
          <ArrowLeft size={18} />
          <span>Back</span>
        </Link>
        <div className="signup-header">
          <a href="/" className="signup-brand">
            <div className="signup-brand-icon">
              <ShieldCheck size={24} strokeWidth={2.4} />
            </div>
            <div className="signup-brand-name">
              <span>ResumeX</span>
              <span className="signup-brand-badge">AI</span>
            </div>
          </a>
          <h2 className="signup-title">Create an account</h2>
          <p className="signup-subtitle">Sign up to get started with ResumeX AI.</p>
        </div>

        <form className="signup-form" onSubmit={handleSignUp}>
          {error && (
            <div className="signup-error" style={{ color: '#D95338', backgroundColor: '#FDF1EF', padding: '10px 14px', borderRadius: '8px', fontSize: '0.88rem', fontWeight: '500', border: '1px solid #F6DCD8' }}>
              {error}
            </div>
          )}
          {success && (
            <div className="signup-success" style={{ color: '#196D45', backgroundColor: '#EDF7F2', padding: '10px 14px', borderRadius: '8px', fontSize: '0.88rem', fontWeight: '500', border: '1px solid rgba(36, 122, 107, 0.2)' }}>
              {success}
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input 
              type="text" 
              id="name" 
              placeholder="John Doe" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required 
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email address</label>
            <input 
              type="email" 
              id="email" 
              placeholder="you@example.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          <div className="form-group">
            <div className="password-header">
              <label htmlFor="password">Password</label>
            </div>
            <input 
              type="password" 
              id="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>

          <button type="submit" className="btn btn-primary signup-btn" disabled={isLoading}>
            <span>{isLoading ? 'Creating Account...' : 'Sign Up'}</span>
            {!isLoading && <ArrowRight size={18} />}
          </button>
        </form>

        <div className="signup-footer">
          <p>Already have an account? <Link to="/signin" className="signin-link">Sign in</Link></p>
        </div>
      </div>
    </div>
  )
}
