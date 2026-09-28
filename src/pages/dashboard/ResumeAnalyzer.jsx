import React, { useState, useEffect } from 'react'
import { api } from '../../utils/api'
import { CheckCircle, AlertCircle, XCircle, ChevronDown, ChevronUp, FileText, Search, Star, MessageSquare } from 'lucide-react'

export default function ResumeAnalyzer() {
  const [title, setTitle] = useState('')
  const [file, setFile] = useState(null)
  const [status, setStatus] = useState('')
  const [resumes, setResumes] = useState([])
  const [jobs, setJobs] = useState([])

  const fetchData = async () => {
    try {
      const [jobsRes, resumesRes] = await Promise.all([
        api.getJobs(),
        api.getResumes()
      ]);
      if (jobsRes.data && jobsRes.data.jobs) {
        setJobs(jobsRes.data.jobs);
      }
      if (resumesRes.data && resumesRes.data.resumes) {
        setResumes(resumesRes.data.resumes)
      }
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!file || !title) return;
    setStatus('Uploading...')
    
    const formData = new FormData();
    formData.append('title', title);
    formData.append('resume', file);

    try {
      await api.uploadResume(formData)
      setStatus('Resume uploaded successfully!')
      setTitle('')
      setFile(null)
      fetchData()
    } catch (err) {
      setStatus(`Error: ${err.message}`)
    }
  }

  const [selectedResumeId, setSelectedResumeId] = useState('')
  const [selectedJobId, setSelectedJobId] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [analysisResult, setAnalysisResult] = useState(null)
  const [analysisStatus, setAnalysisStatus] = useState('')
  const [isTimeout, setIsTimeout] = useState(false)
  const [expandedSection, setExpandedSection] = useState('improvements');

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? '' : section);
  };

  const handleAnalyze = async (e) => {
    if (e) e.preventDefault()
    if (!selectedResumeId || !selectedJobId) {
      setAnalysisStatus('Please select both a resume and target job.')
      return
    }
    if (isLoading) return;

    setIsLoading(true)
    setAnalysisStatus('Analyzing Resume...')
    setAnalysisResult(null)
    setIsTimeout(false)
    console.log("[Resume Analyzer] Request started:", { resumeId: selectedResumeId, jobId: selectedJobId })

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000)

    try {
      const res = await api.analyze({ resumeId: selectedResumeId, jobId: selectedJobId }, { signal: controller.signal })
      clearTimeout(timeoutId)
      setAnalysisStatus('Analysis complete!')
      console.log("[Resume Analyzer] Request completed. Response:", res.data)
      if (res.data && res.data.analysis) {
        setAnalysisResult(res.data.analysis)
      } else {
        setAnalysisResult(res.data)
      }
    } catch (err) {
      clearTimeout(timeoutId)
      console.log("[Resume Analyzer] Request failed")
      if (err.name === 'AbortError') {
        setIsTimeout(true)
        setAnalysisStatus('Analysis is taking longer than expected. Please try again.')
      } else {
        setAnalysisStatus(`Error: ${err.message || 'Failed to process request.'}`)
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    setAnalysisResult(null)
    setAnalysisStatus('')
  }, [selectedResumeId, selectedJobId])

  return (
    <div className="placeholder-page" style={{ padding: '20px' }}>
      <div className="placeholder-header">
        <h1>Resume Analyzer</h1>
      </div>
      <div className="placeholder-content" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'left' }}>
        
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
          <h2 style={{ marginTop: 0 }}>Upload New Resume</h2>
          <form onSubmit={handleUpload}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Resume Title</label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Frontend Developer Resume 2026"
                className="form-control"
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                required
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Resume File (PDF)</label>
              <input 
                type="file" 
                accept="application/pdf"
                onChange={(e) => setFile(e.target.files[0])}
                style={{ width: '100%', padding: '10px', border: '1px dashed #ccc', borderRadius: '4px' }}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              Upload Resume
            </button>
            {status && <div style={{ marginTop: '15px', color: status.startsWith('Error') ? 'red' : 'green', fontWeight: 'bold' }}>{status}</div>}
          </form>
        </div>

        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
          <h2 style={{ marginTop: 0 }}>Analyze Resume</h2>
          <form onSubmit={handleAnalyze}>
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
                  <option key={j._id || j.id} value={j._id || j.id}>{j.title}</option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={isLoading}>
              {isLoading ? 'Analyzing Resume...' : isTimeout ? 'Retry' : 'Analyze'}
            </button>
            {analysisStatus && <div style={{ marginTop: '15px', color: analysisStatus.startsWith('Error') || analysisStatus.startsWith('Please') || isTimeout ? 'red' : 'green', fontWeight: 'bold' }}>{analysisStatus}</div>}
          </form>
        </div>

        {analysisResult && (
          <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
            <h2 style={{ marginTop: 0, borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Analysis Result</h2>
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ color: '#2b6cb0' }}>Score: {analysisResult.matchScore !== undefined ? analysisResult.matchScore : analysisResult.score}/100</h3>
            </div>
            
            {/* Feedback / HR Review */}
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Search size={20} color="#2b6cb0" /> Feedback</h3>
              <div style={{ backgroundColor: '#f7fafc', padding: '15px', borderRadius: '6px', borderLeft: '4px solid #4299e1' }}>
                <p style={{ margin: '0 0 15px 0' }}>{analysisResult.hrReview?.summary || analysisResult.feedback}</p>
                
                {analysisResult.hrReview && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    {analysisResult.hrReview.strengths && analysisResult.hrReview.strengths.length > 0 && (
                      <div>
                        <strong style={{ color: '#2b6cb0', display: 'block', marginBottom: '10px' }}>Key Strengths</strong>
                        <ul style={{ margin: 0, paddingLeft: '20px' }}>
                          {analysisResult.hrReview.strengths.map((s, i) => <li key={i}>{s}</li>)}
                        </ul>
                      </div>
                    )}
                    {analysisResult.hrReview.concerns && analysisResult.hrReview.concerns.length > 0 && (
                      <div>
                        <strong style={{ color: '#D95338', display: 'block', marginBottom: '10px' }}>Primary Concerns</strong>
                        <ul style={{ margin: 0, paddingLeft: '20px' }}>
                          {analysisResult.hrReview.concerns.map((c, i) => <li key={i}>{c}</li>)}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
                {analysisResult.hrReview?.recommendation && (
                  <div style={{ marginTop: '15px', padding: '15px', backgroundColor: '#fff', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    <strong>Recommendation:</strong> {analysisResult.hrReview.recommendation}
                  </div>
                )}
              </div>
            </div>

            {/* Skills Gap Analysis */}
            <div style={{ marginBottom: '30px' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Star size={20} color="#2b6cb0" /> Skills Gap Analysis
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                <div style={{ border: '1px solid #c6f6d5', borderRadius: '8px', padding: '15px', backgroundColor: '#f0fff4' }}>
                  <h4 style={{ margin: '0 0 15px 0', color: '#276749', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <CheckCircle size={16} /> Strong/Matching Skills
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {(analysisResult.strongSkills || analysisResult.matchingSkills || []).map((skill, i) => (
                      <span key={i} style={{ backgroundColor: '#c6f6d5', color: '#22543d', padding: '4px 10px', borderRadius: '15px', fontSize: '13px', fontWeight: '500' }}>{skill}</span>
                    ))}
                    {(analysisResult.strongSkills || analysisResult.matchingSkills || []).length === 0 && <span style={{ fontSize: '13px', color: '#718096' }}>None identified</span>}
                  </div>
                </div>

                <div style={{ border: '1px solid #fefcbf', borderRadius: '8px', padding: '15px', backgroundColor: '#fffff0' }}>
                  <h4 style={{ margin: '0 0 10px 0', color: '#975a16', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <AlertCircle size={16} /> Weak Evidence
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {(analysisResult.weakEvidence || []).map((skill, i) => (
                      <span key={i} style={{ backgroundColor: '#fefcbf', color: '#744210', padding: '4px 10px', borderRadius: '15px', fontSize: '13px', fontWeight: '500' }}>{skill}</span>
                    ))}
                    {(analysisResult.weakEvidence || []).length === 0 && <span style={{ fontSize: '13px', color: '#718096' }}>None identified</span>}
                  </div>
                </div>

                <div style={{ border: '1px solid #fed7d7', borderRadius: '8px', padding: '15px', backgroundColor: '#fff5f5' }}>
                  <h4 style={{ margin: '0 0 15px 0', color: '#9b2c2c', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <XCircle size={16} /> Missing Skills
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {(analysisResult.missingSkills || []).map((skill, i) => (
                      <span key={i} style={{ backgroundColor: '#fed7d7', color: '#822727', padding: '4px 10px', borderRadius: '15px', fontSize: '13px', fontWeight: '500' }}>{skill}</span>
                    ))}
                    {(analysisResult.missingSkills || []).length === 0 && <span style={{ fontSize: '13px', color: '#718096' }}>None identified</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* Keyword Analysis & Formatting */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
              {/* Keyword Analysis */}
              {analysisResult.keywordAnalysis && (
                <div>
                  <h3 style={{ borderBottom: '2px solid #eee', paddingBottom: '10px' }}>Keyword Coverage</h3>
                  <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px solid #e2e8f0' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2b6cb0' }}>{analysisResult.keywordAnalysis.keywordMatchPercentage}%</div>
                        <div style={{ fontSize: '12px', color: '#718096', textTransform: 'uppercase' }}>Match Rate</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{analysisResult.keywordAnalysis.matchedCount} / {analysisResult.keywordAnalysis.totalJobKeywords}</div>
                        <div style={{ fontSize: '12px', color: '#718096', textTransform: 'uppercase' }}>Keywords Found</div>
                      </div>
                    </div>
                    {analysisResult.keywordAnalysis.missingKeywords && analysisResult.keywordAnalysis.missingKeywords.length > 0 && (
                      <div>
                        <strong style={{ fontSize: '14px', color: '#4a5568', display: 'block', marginBottom: '8px' }}>Missing Keywords:</strong>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                          {analysisResult.keywordAnalysis.missingKeywords.map((kw, i) => (
                            <span key={i} style={{ fontSize: '12px', backgroundColor: '#edf2f7', padding: '3px 8px', borderRadius: '4px', color: '#4a5568' }}>{kw}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Formatting */}
              {analysisResult.formatting && (
                <div>
                  <h3 style={{ borderBottom: '2px solid #eee', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileText size={20} color="#2b6cb0" /> Structure & Formatting
                  </h3>
                  <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
                      <strong style={{ fontSize: '16px' }}>Formatting Score</strong>
                      <span style={{ backgroundColor: analysisResult.formatting.score >= 80 ? '#c6f6d5' : '#fefcbf', color: analysisResult.formatting.score >= 80 ? '#22543d' : '#744210', padding: '4px 12px', borderRadius: '15px', fontWeight: 'bold' }}>
                        {analysisResult.formatting.score}/100
                      </span>
                    </div>
                    
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '15px' }}>
                      <span style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', color: analysisResult.formatting.hasSummary ? '#276749' : '#9b2c2c' }}>
                        {analysisResult.formatting.hasSummary ? <CheckCircle size={14}/> : <XCircle size={14}/>} Summary
                      </span>
                      <span style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', color: analysisResult.formatting.hasExperience ? '#276749' : '#9b2c2c' }}>
                        {analysisResult.formatting.hasExperience ? <CheckCircle size={14}/> : <XCircle size={14}/>} Experience
                      </span>
                      <span style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', color: analysisResult.formatting.hasEducation ? '#276749' : '#9b2c2c' }}>
                        {analysisResult.formatting.hasEducation ? <CheckCircle size={14}/> : <XCircle size={14}/>} Education
                      </span>
                      <span style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', color: analysisResult.formatting.hasSkills ? '#276749' : '#9b2c2c' }}>
                        {analysisResult.formatting.hasSkills ? <CheckCircle size={14}/> : <XCircle size={14}/>} Skills
                      </span>
                    </div>

                    {analysisResult.formatting.issues && analysisResult.formatting.issues.length > 0 && (
                      <div>
                        <strong style={{ fontSize: '14px', color: '#4a5568', display: 'block', marginBottom: '8px' }}>Issues Detected:</strong>
                        <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#4a5568' }}>
                          {analysisResult.formatting.issues.map((issue, i) => <li key={i}>{issue}</li>)}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Improvements */}
            {analysisResult.improvements && analysisResult.improvements.length > 0 && (
              <div style={{ marginBottom: '30px' }}>
                <div 
                  onClick={() => toggleSection('improvements')}
                  style={{ cursor: 'pointer', borderBottom: '2px solid #eee', paddingBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <h3 style={{ margin: 0 }}>Actionable Improvements</h3>
                  {expandedSection === 'improvements' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
                
                {expandedSection === 'improvements' && (
                  <div style={{ padding: '20px', backgroundColor: '#f8fafc', borderRadius: '0 0 8px 8px', border: '1px solid #e2e8f0', borderTop: 'none' }}>
                    <ul style={{ margin: 0, paddingLeft: '20px' }}>
                      {analysisResult.improvements.map((item, i) => (
                        <li key={i} style={{ marginBottom: '12px', lineHeight: '1.5' }}>
                          {typeof item === 'string' ? item : (item.suggestion || item.improvement || JSON.stringify(item))}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Interview Questions */}
            {analysisResult.interviewQuestions && analysisResult.interviewQuestions.length > 0 && (
              <div style={{ marginBottom: '10px' }}>
                <div 
                  onClick={() => toggleSection('interview')}
                  style={{ cursor: 'pointer', borderBottom: '2px solid #eee', paddingBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MessageSquare size={20} color="#2b6cb0" /> Interview Preparation
                  </h3>
                  {expandedSection === 'interview' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
                
                {expandedSection === 'interview' && (
                  <div style={{ padding: '20px', backgroundColor: '#f8fafc', borderRadius: '0 0 8px 8px', border: '1px solid #e2e8f0', borderTop: 'none' }}>
                    <div style={{ display: 'grid', gap: '15px' }}>
                      {analysisResult.interviewQuestions.map((q, i) => (
                        <div key={i} style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                            <span style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', color: '#2b6cb0', backgroundColor: '#ebf8ff', padding: '3px 8px', borderRadius: '4px' }}>
                              {q.category || 'Question'}
                            </span>
                          </div>
                          <strong style={{ display: 'block', fontSize: '15px', marginBottom: '8px' }}>{q.question || q}</strong>
                          {q.guidance && <p style={{ margin: 0, fontSize: '14px', color: '#4a5568', lineHeight: '1.5' }}><span style={{ fontWeight: 'bold' }}>Guidance:</span> {q.guidance}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  )
}
