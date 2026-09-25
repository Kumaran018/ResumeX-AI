import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FileText, Search, BrainCircuit, Lightbulb, Mic, Sparkles, ArrowRight, FileCheck, Clock } from 'lucide-react'
import { api } from '../../utils/api'

export default function DashboardHome() {
  const [userName, setUserName] = useState('')
  const [resumeCount, setResumeCount] = useState(0)
  const [latestAnalysis, setLatestAnalysis] = useState(null)
  const [recentAnalyses, setRecentAnalyses] = useState([])
  const [recentResumes, setRecentResumes] = useState([])

  const getScore = (analysis) => {
    if (!analysis) return 0;
    return analysis.score !== undefined ? analysis.score : (analysis.matchScore || 0);
  }

  useEffect(() => {
    const fetchDashboardData = async () => {
      // User info
      const userStr = localStorage.getItem('user')
      if (userStr) {
        try {
          const user = JSON.parse(userStr)
          if (user && user.name) setUserName(user.name)
        } catch (e) {}
      }
      
      try {
        const [resumesRes, analysesRes] = await Promise.all([
          api.getResumes(),
          api.getAnalyses()
        ]);
        
        if (resumesRes && resumesRes.data && resumesRes.data.resumes) {
          setResumeCount(resumesRes.data.resumes.length)
          setRecentResumes(resumesRes.data.resumes.slice(0, 3))
        }
        
        if (analysesRes && analysesRes.data && analysesRes.data.analyses && analysesRes.data.analyses.length > 0) {
          setLatestAnalysis(analysesRes.data.analyses[0])
          setRecentAnalyses(analysesRes.data.analyses.slice(0, 3))
        }
      } catch (err) {
        console.error('Failed to load dashboard data', err)
      }
    }
    
    fetchDashboardData()
    window.addEventListener('user-profile-updated', fetchDashboardData)
    return () => window.removeEventListener('user-profile-updated', fetchDashboardData)
  }, [])

  const features = [
    {
      id: 'resume-analyzer',
      category: 'CONTENT & STRUCTURE',
      title: 'Resume Analyzer',
      description: 'Upload your resume and get an AI-powered analysis of its structure, content and strengths.',
      icon: <FileText size={20} strokeWidth={2.2} />,
      buttonText: 'Analyze Resume',
      path: '/dashboard/resume-analyzer',
      themeClass: 'card-theme-orange'
    },
    {
      id: 'job-match',
      category: 'JOB COMPATIBILITY',
      title: 'ATS & Job Match',
      description: 'Compare your resume with a target job description and discover your match level.',
      icon: <Search size={20} strokeWidth={2.2} />,
      buttonText: 'Analyze Job Match',
      path: '/dashboard/job-match',
      themeClass: 'card-theme-blue'
    },
    {
      id: 'skills-gap',
      category: 'SKILL DEVELOPMENT',
      title: 'Skills Gap Analyzer',
      description: 'Find the skills you already have and identify the skills you should improve for your target role.',
      icon: <BrainCircuit size={20} strokeWidth={2.2} />,
      buttonText: 'Find Skill Gaps',
      path: '/dashboard/skills-gap',
      themeClass: 'card-theme-purple'
    },
    {
      id: 'resume-improvement',
      category: 'ENHANCEMENT',
      title: 'Resume Improvement',
      description: 'Get practical suggestions to improve your resume and make your experience clearer and stronger.',
      icon: <Lightbulb size={20} strokeWidth={2.2} />,
      buttonText: 'Improve My Resume',
      path: '/dashboard/resume-improvement',
      themeClass: 'card-theme-orange'
    },
    {
      id: 'interview',
      category: 'PRACTICE',
      title: 'AI Interview Preparation',
      description: 'Prepare for interviews using questions generated from your resume and target job.',
      icon: <Mic size={20} strokeWidth={2.2} />,
      buttonText: 'Start Interview',
      path: '/dashboard/interview',
      themeClass: 'card-theme-green'
    }
  ]

  return (
    <div className="dashboard-home-wrapper">
      <div className="welcome-bar">
        <div className="welcome-bar-content">
          <h1 className="welcome-title">Welcome back{userName ? `, ${userName}` : ''} 👋</h1>
          <p className="welcome-subtitle">Ready to improve your resume and prepare for your next opportunity?</p>
        </div>
        <div className="welcome-bar-decoration">
          <Sparkles size={24} className="welcome-icon-decor" />
        </div>
      </div>

      <section className="dashboard-overview compact-overview">
        <div className="overview-stats-left">
          <div className="overview-item">
            <span className="overview-label">Resumes Uploaded</span>
            <span className="overview-value">
              {resumeCount}
            </span>
          </div>
          <div className="overview-divider"></div>
          <div className="overview-item">
            <span className="overview-label">Last Analysis Date</span>
            <span className="overview-value date-value">
              {latestAnalysis ? new Date(latestAnalysis.createdAt).toLocaleDateString() : 'N/A'}
            </span>
          </div>
        </div>
        
        <div className="overview-divider mobile-hide"></div>
        
        <div className="overview-item health-item">
          <span className="overview-label">Resume Health</span>
          <div className="health-container">
            <div className="health-circle-wrapper">
              <svg viewBox="0 0 36 36" className="circular-chart">
                <path className="circle-bg"
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path className="circle"
                  strokeDasharray={`${getScore(latestAnalysis)}, 100`}
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="health-score-text">
                {latestAnalysis ? getScore(latestAnalysis) : '--'}
              </div>
            </div>
            
            <div className="health-details">
              <div className="health-score-display">
                {latestAnalysis ? getScore(latestAnalysis) : '--'} <span className="total">/ 100</span>
              </div>
              {latestAnalysis && latestAnalysis.status && (
                <div className="health-status">{latestAnalysis.status}</div>
              )}
              {latestAnalysis && latestAnalysis.feedback && (
                <div className="health-support">{latestAnalysis.feedback}</div>
              )}
              <Link to="/dashboard/resume-improvement" className="health-btn">
                Improve my resume &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="dashboard-content-grid">
        <div className="dashboard-left-column">
          <section className="dashboard-features">
            <h2 className="dashboard-section-title">AI Tools</h2>
            <p className="dashboard-section-subtitle">Get AI-powered insights to build a stronger resume and land your dream job.</p>
            <div className="features-grid">
              {features.slice(0, 3).map(feature => (
                <Link to={feature.path} key={feature.id} className={`feature-card ${feature.themeClass}`}>
                  <div className="feature-card-header">
                    <div className="feature-icon-wrapper">
                      {feature.icon}
                    </div>
                    <div className="feature-category">{feature.category}</div>
                  </div>
                  <div className="feature-card-body">
                    <h3>{feature.title}</h3>
                    <p>{feature.description}</p>
                  </div>
                  <div className="feature-action">
                    <span>{feature.buttonText}</span>
                    <ArrowRight size={16} strokeWidth={2.5} />
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {recentResumes.length > 0 && (
            <section className="dashboard-recent-resumes">
              <div className="recent-header-row">
                <h2 className="dashboard-section-title">Your Recent Resumes</h2>
                <Link to="/dashboard/resume-analyzer" className="view-all-link">View all &rarr;</Link>
              </div>
              <div className="recent-list-horizontal">
                {recentResumes.map(resume => (
                  <div key={resume._id || resume.id} className="recent-resume-card">
                    <div className="recent-icon-box resume-icon">
                      <FileCheck size={16} />
                    </div>
                    <div className="recent-item-content">
                      <div className="recent-item-title">{resume.title || resume.fileName || 'Resume Document'}</div>
                      <div className="recent-item-meta">{new Date(resume.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <div className="dashboard-right-column">
          <section className="dashboard-recent-activity-panel">
            <div className="recent-header-row">
              <h2 className="dashboard-section-title">Recent Activity</h2>
              <Link to="/dashboard/resume-analyzer" className="view-all-link">View all &rarr;</Link>
            </div>
            
            {recentAnalyses.length > 0 ? (
              <div className="recent-activity-list">
                {recentAnalyses.map(analysis => (
                  <div key={analysis._id || analysis.id} className="activity-list-item">
                    <div className="recent-icon-box activity-icon">
                      <Clock size={16} />
                    </div>
                    <div className="recent-item-content">
                      <div className="recent-item-title">Resume Analysis</div>
                      <div className="recent-item-meta">
                        {analysis.jobTitle || 'General Resume'} &bull; {new Date(analysis.createdAt).toLocaleDateString()}
                      </div>
                      <div className="recent-item-result">
                        Score: {getScore(analysis)}/100
                      </div>
                    </div>
                    <div className="activity-arrow">
                      <ArrowRight size={14} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No recent activity yet.</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}

