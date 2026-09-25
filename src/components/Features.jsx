import React from 'react'
import { 
  ShieldCheck, 
  Target, 
  AlertOctagon, 
  Wand2, 
  Eye, 
  HelpCircle 
} from 'lucide-react'
import './Features.css'

export default function Features() {
  const featureList = [
    {
      id: 'evidence',
      icon: <ShieldCheck size={24} strokeWidth={2.2} />,
      theme: 'coral',
      title: 'Evidence-Based Analysis',
      desc: 'See whether your claimed skills are supported by meaningful resume evidence.'
    },
    {
      id: 'job-match',
      icon: <Target size={24} strokeWidth={2.2} />,
      theme: 'teal',
      title: 'Job Match Analysis',
      desc: 'Compare your resume with a specific job description.'
    },
    {
      id: 'skill-gap',
      icon: <AlertOctagon size={24} strokeWidth={2.2} />,
      theme: 'coral',
      title: 'Skill Gap Detection',
      desc: 'Identify important skills that are missing or weakly supported.'
    },
    {
      id: 'improvements',
      icon: <Wand2 size={24} strokeWidth={2.2} />,
      theme: 'teal',
      title: 'Resume Improvements',
      desc: 'Get practical suggestions for improving your resume.'
    },
    {
      id: 'recruiter',
      icon: <Eye size={24} strokeWidth={2.2} />,
      theme: 'coral',
      title: 'Recruiter Review',
      desc: 'Understand what an initial recruiter review may focus on.'
    },
    {
      id: 'interview',
      icon: <HelpCircle size={24} strokeWidth={2.2} />,
      theme: 'teal',
      title: 'Interview Questions',
      desc: 'Generate personalized interview questions based on your resume and target role.'
    }
  ]

  return (
    <section className="section-padding features-section" id="features">
      <div className="container">
        <div className="section-header">
          <div className="eyebrow" style={{ backgroundColor: '#FDF0ED' }}>
            <span className="eyebrow-dot"></span>
            <span>COMPREHENSIVE CAPABILITIES</span>
          </div>
          <h2 className="section-title">
            Everything you need to understand your resume
          </h2>
          <p className="section-desc">
            Built from the ground up to eliminate guesswork and replace keyword stuffing with verifiable professional credibility.
          </p>
        </div>

        <div className="features-grid">
          {featureList.map((item) => (
            <div className="feature-card" key={item.id}>
              <div className={`feature-icon-wrapper ${item.theme}`}>
                {item.icon}
              </div>
              <h3 className="feature-card-title">{item.title}</h3>
              <p className="feature-card-desc">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
