import React, { useEffect, useState } from 'react'
import { useNavigate, Outlet, Link, NavLink } from 'react-router-dom'
import { api } from '../utils/api'
import { ShieldCheck, LogOut, LayoutDashboard, FileText, Search, BrainCircuit, Lightbulb, Mic, User } from 'lucide-react'
import ThemeToggle from '../components/ThemeToggle'
import './Dashboard.css'

export default function Dashboard() {
  const navigate = useNavigate()
  const [userName, setUserName] = useState('')

  useEffect(() => {
    const fetchUser = () => {
      const userStr = localStorage.getItem('user')
      if (userStr) {
        try {
          const user = JSON.parse(userStr)
          if (user && user.name) {
            setUserName(user.name)
          }
        } catch (e) {
          // ignore
        }
      }
    }
    
    fetchUser()
    window.addEventListener('user-profile-updated', fetchUser)
    return () => window.removeEventListener('user-profile-updated', fetchUser)
  }, [])

  const handleSignOut = async () => {
    try {
      await api.logout()
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      navigate('/signin')
    }
  }

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={18} />, exact: true },
    { name: 'Resume Analyzer', path: '/dashboard/resume-analyzer', icon: <FileText size={18} /> },
    { name: 'ATS & Job Match', path: '/dashboard/job-match', icon: <Search size={18} /> },
    { name: 'Skills Gap', path: '/dashboard/skills-gap', icon: <BrainCircuit size={18} /> },
    { name: 'Resume Improvement', path: '/dashboard/resume-improvement', icon: <Lightbulb size={18} /> },
    { name: 'Interview Prep', path: '/dashboard/interview', icon: <Mic size={18} /> }
  ]

  return (
    <div className="dashboard-container">
      {/* Top Header */}
      <header className="dashboard-top-header">
        <Link to="/" className="dashboard-logo">
          <div className="dashboard-logo-icon">
            <ShieldCheck size={20} strokeWidth={2.4} />
          </div>
          <div className="dashboard-logo-text">
            <span>ResumeX</span>
            <span className="dashboard-logo-badge">AI</span>
          </div>
        </Link>
        
        <div className="dashboard-top-actions">
          <ThemeToggle />
          <Link to="/dashboard/profile" className="dashboard-user-profile" style={{ textDecoration: 'none' }}>
            <div className="user-avatar">
              <User size={16} />
            </div>
            <span className="user-name-header">{userName || 'User'}</span>
          </Link>
        </div>
      </header>

      <div className="dashboard-body">
        {/* Sidebar */}
        <aside className="dashboard-sidebar">
          <nav className="dashboard-nav">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.exact}
                className={({ isActive }) => 
                  isActive ? "dashboard-nav-link active" : "dashboard-nav-link"
                }
              >
                {link.icon}
                <span>{link.name}</span>
              </NavLink>
            ))}
          </nav>

          <div className="dashboard-sidebar-footer">
            <button onClick={handleSignOut} className="dashboard-signout">
              <LogOut size={18} />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="dashboard-content-wrapper">
          <main className="dashboard-main">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
