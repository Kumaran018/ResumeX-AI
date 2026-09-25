import React from 'react'
import { Check, X, ShieldAlert, Sparkles } from 'lucide-react'
import './Differentiator.css'

export default function Differentiator() {
  return (
    <section className="section-padding differentiator-section" id="why-resumex">
      <div className="container">
        <div className="section-header">
          <div className="eyebrow" style={{ backgroundColor: '#F3EAE4' }}>
            <span className="eyebrow-dot"></span>
            <span>THE EVIDENCE ADVANTAGE</span>
          </div>
          <h2 className="section-title">
            A keyword isn't always proof of a skill.
          </h2>
          <p className="section-desc">
            Most resume analyzers focus on finding keywords. ResumeX AI looks deeper by examining whether your resume actually provides evidence supporting the skills you claim.
          </p>
        </div>

        {/* Visual Comparison Grid */}
        <div className="diff-grid">
          {/* Traditional Card */}
          <div className="diff-card traditional">
            <div className="diff-header">
              <span className="diff-category">Surface Level</span>
              <h3 className="diff-title">Traditional Resume Check</h3>
            </div>

            <ul className="diff-list">
              <li className="diff-item">
                <span className="diff-check-icon">
                  <Check size={14} strokeWidth={3} />
                </span>
                <span>Finds keywords</span>
              </li>
              <li className="diff-item diff-item-dimmed">
                <span className="diff-check-icon">
                  <X size={14} strokeWidth={3} />
                </span>
                <span>Checks supporting evidence</span>
              </li>
              <li className="diff-item diff-item-dimmed">
                <span className="diff-check-icon">
                  <X size={14} strokeWidth={3} />
                </span>
                <span>Identifies skill gaps</span>
              </li>
              <li className="diff-item diff-item-dimmed">
                <span className="diff-check-icon">
                  <X size={14} strokeWidth={3} />
                </span>
                <span>Connects skills to projects and experience</span>
              </li>
            </ul>

            <div className="diff-footnote">
              ⚠️ Flags matches even if a keyword was only mentioned in a hobby or without context.
            </div>
          </div>

          {/* ResumeX AI Card */}
          <div className="diff-card resumex">
            <div className="diff-card-badge">Intelligent Proof</div>
            <div className="diff-header">
              <span className="diff-category">Evidence-Driven</span>
              <h3 className="diff-title">ResumeX AI</h3>
            </div>

            <ul className="diff-list">
              <li className="diff-item">
                <span className="diff-check-icon">
                  <Check size={14} strokeWidth={3} />
                </span>
                <span><strong>Finds keywords</strong> across your entire profile</span>
              </li>
              <li className="diff-item">
                <span className="diff-check-icon">
                  <Check size={14} strokeWidth={3} />
                </span>
                <span><strong>Checks supporting evidence</strong> with impact metrics</span>
              </li>
              <li className="diff-item">
                <span className="diff-check-icon">
                  <Check size={14} strokeWidth={3} />
                </span>
                <span><strong>Identifies skill gaps</strong> against hiring requirements</span>
              </li>
              <li className="diff-item">
                <span className="diff-check-icon">
                  <Check size={14} strokeWidth={3} />
                </span>
                <span><strong>Connects skills</strong> to projects and work history</span>
              </li>
            </ul>

            <div className="diff-footnote">
              💡 Gives you actionable confidence that recruiters will see concrete evidence for your claims.
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
