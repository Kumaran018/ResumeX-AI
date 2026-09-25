import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '../utils/api'
import { ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react'
import './SignIn.css'

export default function SignIn() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSignIn = async (e) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Please fill in both email and password.')
      return
    }

    setIsLoading(true)
    try {
      const data = await api.login({ email, password })

      // Store user session data
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.data.user))
      
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Network error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="signin-container">
      <div className="signin-card">
        <Link to="/" className="back-link">
          <ArrowLeft size={18} />
          <span>Back</span>
        </Link>
        <div className="signin-header">
          <a href="/" className="signin-brand">
            <div className="signin-brand-icon">
              <ShieldCheck size={24} strokeWidth={2.4} />
            </div>
            <div className="signin-brand-name">
              <span>ResumeX</span>
              <span className="signin-brand-badge">AI</span>
            </div>
          </a>
          <h2 className="signin-title">Welcome back</h2>
          <p className="signin-subtitle">Enter your details to access your account.</p>
        </div>

        <form className="signin-form" onSubmit={handleSignIn}>
          {error && (
            <div className="signin-error" style={{ color: '#D95338', backgroundColor: '#FDF1EF', padding: '10px 14px', borderRadius: '8px', fontSize: '0.88rem', fontWeight: '500', border: '1px solid #F6DCD8' }}>
              {error}
            </div>
          )}
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
              <a href="#" className="forgot-password">Forgot password?</a>
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

          <button type="submit" className="btn btn-primary signin-btn" disabled={isLoading}>
            <span>{isLoading ? 'Signing In...' : 'Sign In'}</span>
            {!isLoading && <ArrowRight size={18} />}
          </button>
        </form>

        <div className="signin-footer">
          <p>Don't have an account? <Link to="/signup" className="signup-link">Sign up</Link></p>
        </div>
      </div>
    </div>
  )
}
