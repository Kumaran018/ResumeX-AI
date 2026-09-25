import React, { useState, useEffect } from 'react'
import { api } from '../../utils/api'

export default function InterviewPrep() {
  const [resumes, setResumes] = useState([])
  const [jobs, setJobs] = useState([])
  const [selectedResumeId, setSelectedResumeId] = useState('')
  const [selectedJobId, setSelectedJobId] = useState('')
  const [status, setStatus] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [analysisResult, setAnalysisResult] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resumesRes, jobsRes] = await Promise.all([
          api.getResumes(),
          api.getJobs()
        ])
        if (resumesRes.data && resumesRes.data.resumes) {
          setResumes(resumesRes.data.resumes)
        }
        if (jobsRes.data && jobsRes.data.jobs) {
          setJobs(jobsRes.data.jobs)
        }
      } catch (err) {
        console.error("Error fetching data:", err)
      }
    }
    fetchData()
  }, [])

  const handlePrep = async (e) => {
    e.preventDefault()
    if (!selectedResumeId || !selectedJobId) {
      setStatus('Please select both a resume and a job.')
      return
    }

    setStatus('')
    setIsLoading(true)
    setAnalysisResult(null)

    try {
      const res = await api.analyze({ resumeId: selectedResumeId, jobId: selectedJobId })
      setStatus('Preparation context loaded!')
      console.log('Interview Prep API Response:', res.data)
      if (res.data && res.data.analysis) {
        setAnalysisResult(res.data.analysis)
      }
    } catch (err) {
      setStatus(`Error: ${err.message || 'Failed to process request.'}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="placeholder-page" style={{ padding: '20px' }}>
      <div className="placeholder-header">
        <h1>AI Interview Preparation</h1>
      </div>
      <div className="placeholder-content" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'left' }}>
        
        {!analysisResult ? (
          <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <h2 style={{ marginTop: 0 }}>Select Context for Interview Prep</h2>
            <form onSubmit={handlePrep}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Select Resume</label>
                <select 
                  value={selectedResumeId} 
                  onChange={(e) => setSelectedResumeId(e.target.value)}
                  className="form-control"
                  style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                  required
                >
                  <option value="">-- Choose a resume --</option>
                  {resumes.map(r => (
                    <option key={r._id} value={r._id}>{r.title}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Select Target Job</label>
                <select 
                  value={selectedJobId} 
                  onChange={(e) => setSelectedJobId(e.target.value)}
                  className="form-control"
                  style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                  required
                >
                  <option value="">-- Choose a job --</option>
                  {jobs.map(j => (
                    <option key={j._id} value={j._id}>{j.title}</option>
                  ))}
                </select>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={isLoading}>
                {isLoading ? 'Loading Preparation Context...' : 'Start Interview Prep'}
              </button>
              {status && <div style={{ marginTop: '15px', color: status.startsWith('Error') ? 'red' : 'green', fontWeight: 'bold' }}>{status}</div>}
            </form>
          </div>
        ) : (
          <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <h2 style={{ marginTop: 0, borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Interview Context Provided by Backend</h2>
            
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ color: '#2b6cb0' }}>Relevance Score: {analysisResult.score}/100</h3>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ color: '#38a169' }}>Identified Strengths to Highlight</h3>
              <ul style={{ paddingLeft: '20px' }}>
                {analysisResult.matchingSkills && analysisResult.matchingSkills.length > 0 ? (
                  analysisResult.matchingSkills.map((skill, i) => <li key={i}>{skill}</li>)
                ) : (
                  <li>No matching skills found.</li>
                )}
              </ul>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ color: '#e53e3e' }}>Areas to Prepare For (Missing Skills)</h3>
              <ul style={{ paddingLeft: '20px' }}>
                {analysisResult.missingSkills && analysisResult.missingSkills.length > 0 ? (
                  analysisResult.missingSkills.map((skill, i) => <li key={i}>{skill}</li>)
                ) : (
                  <li>No missing target skills identified.</li>
                )}
              </ul>
            </div>

            {analysisResult.interviewQuestions && analysisResult.interviewQuestions.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ color: '#d69e2e' }}>Recommended Interview Questions</h3>
                <div style={{ display: 'grid', gap: '15px' }}>
                  {analysisResult.interviewQuestions.map((q, i) => (
                    <div key={i} style={{ padding: '15px', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: '#fdfdfd' }}>
                      <strong style={{ display: 'block', marginBottom: '8px', fontSize: '15px' }}>{q.question || q}</strong>
                      {q.category && (
                        <span style={{ fontSize: '12px', padding: '3px 8px', backgroundColor: '#ebf8ff', color: '#2b6cb0', borderRadius: '4px', display: 'inline-block', marginBottom: '8px' }}>
                          {q.category}
                        </span>
                      )}
                      {q.context && (
                        <p style={{ margin: 0, fontSize: '13px', color: '#4a5568' }}><strong>Why they might ask:</strong> {q.context}</p>
                      )}
                      {q.guidance && (
                        <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: '#2f855a' }}><strong>How to answer:</strong> {q.guidance}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ marginBottom: '20px' }}>
              <h3>General Preparation Feedback</h3>
              <p style={{ backgroundColor: '#f7fafc', padding: '15px', borderRadius: '6px', borderLeft: '4px solid #4299e1' }}>
                {analysisResult.feedback}
              </p>
            </div>
            
            <div style={{ marginTop: '24px', padding: '16px', backgroundColor: '#fff3cd', borderRadius: '8px', color: '#856404' }}>
              <strong>Note:</strong> The backend response does not currently provide an interactive chat interface. The data above represents the actual backend response.
            </div>

            <button onClick={() => setAnalysisResult(null)} className="btn btn-primary" style={{ marginTop: '20px' }}>
              Prepare for Another Role
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
