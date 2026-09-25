import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import Dashboard from './pages/Dashboard'
import DashboardHome from './pages/dashboard/DashboardHome'
import ResumeAnalyzer from './pages/dashboard/ResumeAnalyzer'
import JobMatch from './pages/dashboard/JobMatch'
import SkillsGap from './pages/dashboard/SkillsGap'
import ResumeImprovement from './pages/dashboard/ResumeImprovement'
import InterviewPrep from './pages/dashboard/InterviewPrep'
import Profile from './pages/dashboard/Profile'

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/dashboard" element={<Dashboard />}>
          <Route index element={<DashboardHome />} />
          <Route path="resume-analyzer" element={<ResumeAnalyzer />} />
          <Route path="job-match" element={<JobMatch />} />
          <Route path="skills-gap" element={<SkillsGap />} />
          <Route path="resume-improvement" element={<ResumeImprovement />} />
          <Route path="interview" element={<InterviewPrep />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </Router>
  )
}
