import React from 'react'
import { UploadCloud, Target, SearchCheck, Lightbulb } from 'lucide-react'
import './HowItWorks.css'

export default function HowItWorks() {
  const steps = [
    {
      number: '01',
      icon: <UploadCloud size={24} strokeWidth={2} />,
      title: 'Upload Resume',
      desc: 'Import your existing resume in PDF or DOCX format. Our parser extracts experience, projects, and skills without altering formatting.'
    },
    {
      number: '02',
      icon: <Target size={24} strokeWidth={2} />,
      title: 'Add Target Job',
      desc: 'Paste a target job description or select a standard industry role to benchmark your qualifications against exact hiring requirements.'
    },
    {
      number: '03',
      icon: <SearchCheck size={24} strokeWidth={2} />,
      title: 'Analyze Skills & Evidence',
      desc: 'ResumeX AI cross-examines claimed skills against work achievements, verifying metrics, project ownership, and depth of experience.'
    },
    {
      number: '04',
      icon: <Lightbulb size={24} strokeWidth={2} />,
      title: 'Get Personalized Insights',
      desc: 'Receive tailored recommendations to strengthen weak proof points, bridge skill gaps, and practice custom interview questions.'
    }
  ]

  return (
    <section className="section-padding how-it-works-section" id="how-it-works">
      <div className="container">
        <div className="section-header">
          <div className="eyebrow" style={{ backgroundColor: '#FAF1E8' }}>
            <span className="eyebrow-dot"></span>
            <span>SIMPLE 4-STEP PROCESS</span>
          </div>
          <h2 className="section-title">
            From Resume to Career Insights
          </h2>
          <p className="section-desc">
            A transparent workflow designed to give you clarity on what your resume proves to recruiters and automated ATS screeners.
          </p>
        </div>

        <div className="steps-container">
          <div className="steps-connector-line"></div>
          <div className="steps-grid">
            {steps.map((step) => (
              <div className="step-card" key={step.number}>
                <div className="step-header">
                  <div className="step-icon-wrapper">
                    {step.icon}
                  </div>
                  <span className="step-number">{step.number}</span>
                </div>
                <h3 className="step-title">{step.title}</h3>
                <p className="step-desc">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
