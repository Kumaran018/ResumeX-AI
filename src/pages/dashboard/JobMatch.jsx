import React, { useState, useEffect } from 'react'
import { api } from '../../utils/api'
import { CheckCircle, AlertCircle, XCircle, ChevronDown, ChevronUp, FileText, Search, Star, MessageSquare } from 'lucide-react'

export default function JobMatch() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [requirements, setRequirements] = useState('')
  const [status, setStatus] = useState('')
  const [jobs, setJobs] = useState([])
  
  const [resumes, setResumes] = useState([])
  const [selectedJob, setSelectedJob] = useState('')
  const [selectedResume, setSelectedResume] = useState('')
  const [analysisStatus, setAnalysisStatus] = useState('')
  const [analysisResult, setAnalysisResult] = useState(null)

  const fetchData = async () => {
    try {
      const [jobsRes, resumesRes] = await Promise.all([
        api.getJobs(),
        api.getResumes()
      ]);
      if (jobsRes.data && jobsRes.data.jobs) {
        setJobs(jobsRes.data.jobs);
        console.log("FETCHED JOBS:", jobsRes.data.jobs);
      }
      if (resumesRes.data && resumesRes.data.resumes) setResumes(resumesRes.data.resumes);
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleCreateJob = async (e) => {
    e.preventDefault()
    if (!title || !description) return;
    setStatus('Saving...')
    
    try {
      await api.createJob({ title, description, requirements })
      setStatus('Job saved successfully!')
      setTitle('')
      setDescription('')
      setRequirements('')
      fetchData()
    } catch (err) {
      setStatus(`Error: ${err.message}`)
    }
  }

  const handleAnalyze = async (e) => {
    e.preventDefault()
    if (!selectedJob || !selectedResume) return;
    setAnalysisStatus('Analyzing...')
    setAnalysisResult(null)
    
    console.log("SELECTED JOB ID:", selectedJob);
    console.log(
      "SELECTED JOB:",
      jobs.find(job => job._id === selectedJob)
    );

    console.log("ANALYZE REQUEST:", {
      resumeId: selectedResume,
      jobId: selectedJob
    });

    try {
      const res = await api.analyze({ resumeId: selectedResume, jobId: selectedJob })
      
      console.log("ANALYZE API RESPONSE:", res);
      console.log("REAL ANALYSIS RESPONSE:", JSON.stringify(res.data, null, 2));

      setAnalysisStatus('Analysis complete!')
      if (res.data && res.data.analysis) {
        setAnalysisResult(res.data.analysis)
      }
    } catch (err) {
      console.error("ANALYSIS ERROR:", err);
      setAnalysisStatus(`Error: ${err.message || 'Analysis failed. Please try again.'}`)
    }
  }

  // Clear stale data if user changes dropdown
  useEffect(() => {
    setAnalysisResult(null)
    setAnalysisStatus('')
  }, [selectedResume, selectedJob])

  const [expandedSection, setExpandedSection] = useState('overview');

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? '' : section);
  };

  return (
    <div className="placeholder-page" style={{ padding: '20px' }}>
      <div className="placeholder-header">
        <h1>ATS & Job Match</h1>
      </div>
      <div className="placeholder-content" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'left' }}>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
          {/* Create Job Form */}
          <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <h2 style={{ marginTop: 0 }}>Add Target Job</h2>
            <form onSubmit={handleCreateJob}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Job Title</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="form-control"
                  style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                  required
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Job Description</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="form-control"
                  style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', minHeight: '100px' }}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                Save Job
              </button>
              {status && <div style={{ marginTop: '15px', color: status.startsWith('Error') ? 'red' : 'green', fontWeight: 'bold' }}>{status}</div>}
            </form>
          </div>

          {/* Analyze Form */}
          <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <h2 style={{ marginTop: 0 }}>Run Analysis</h2>
            <form onSubmit={handleAnalyze}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Select Resume</label>
                <select 
                  value={selectedResume}
                  onChange={(e) => setSelectedResume(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                  required
                >
                  <option value="">-- Choose Resume --</option>
                  {resumes.map(r => <option key={r._id} value={r._id}>{r.title}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Select Target Job</label>
                <select 
                  value={selectedJob}
                  onChange={(e) => setSelectedJob(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                  required
                >
                  <option value="">-- Choose Job --</option>
                  {jobs.map(j => <option key={j._id || j.id} value={j._id || j.id}>{j.title}</option>)}
                </select>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', backgroundColor: '#196D45', borderColor: '#196D45' }}>
                Analyze Match
              </button>
              {analysisStatus && <div style={{ marginTop: '15px', color: analysisStatus.startsWith('Error') ? 'red' : '#196D45', fontWeight: 'bold' }}>{analysisStatus}</div>}
            </form>
          </div>
        </div>

        {/* Results Dashboard */}
        {analysisResult && (
          <div style={{ backgroundColor: '#fff', padding: '0', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.08)', overflow: 'hidden', marginTop: '30px' }}>
            <div style={{ backgroundColor: '#196D45', padding: '25px', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '24px' }}>AI Match Analysis</h2>
                <p style={{ margin: '5px 0 0 0', opacity: 0.9 }}>Comprehensive review of your resume against the target job</p>
              </div>
              <div style={{ textAlign: 'center', backgroundColor: 'rgba(255,255,255,0.1)', padding: '15px 25px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.2)' }}>
                <div style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '5px' }}>Match Score</div>
                <div style={{ fontSize: '36px', fontWeight: 'bold' }}>
                  {analysisResult.matchScore !== undefined ? analysisResult.matchScore : analysisResult.score}<span style={{ fontSize: '20px', opacity: 0.8 }}>/100</span>
                </div>
              </div>
            </div>

            <div style={{ padding: '30px' }}>
              
              {/* HR Review Section */}
              {analysisResult.hrReview && (
                <div style={{ marginBottom: '30px' }}>
                  <h3 style={{ borderBottom: '2px solid #eee', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Search size={20} color="#196D45" /> Recruiter Evaluation
                  </h3>
                  <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '8px', borderLeft: '4px solid #196D45' }}>
                    <p style={{ margin: '0 0 15px 0', fontSize: '16px', lineHeight: '1.6' }}><strong>Summary:</strong> {analysisResult.hrReview.summary || analysisResult.feedback}</p>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                      {analysisResult.hrReview.strengths && analysisResult.hrReview.strengths.length > 0 && (
                        <div>
                          <strong style={{ color: '#196D45', display: 'block', marginBottom: '10px' }}>Key Strengths</strong>
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
                    {analysisResult.hrReview.recommendation && (
                      <div style={{ marginTop: '15px', padding: '15px', backgroundColor: '#fff', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                        <strong>Recommendation:</strong> {analysisResult.hrReview.recommendation}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Skills Gap Analysis */}
              <div style={{ marginBottom: '30px' }}>
                <h3 style={{ borderBottom: '2px solid #eee', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Star size={20} color="#196D45" /> Skills Gap Analysis
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                  <div style={{ border: '1px solid #c6f6d5', borderRadius: '8px', padding: '15px', backgroundColor: '#f0fff4' }}>
                    <h4 style={{ margin: '0 0 15px 0', color: '#276749', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <CheckCircle size={16} /> Strong Skills
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
                    <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#718096' }}>Mentioned, but lacks project context/impact.</p>
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
                            {analysisResult.keywordAnalysis.missingKeywords.slice(0, 8).map((kw, i) => (
                              <span key={i} style={{ fontSize: '12px', backgroundColor: '#edf2f7', padding: '3px 8px', borderRadius: '4px', color: '#4a5568' }}>{kw}</span>
                            ))}
                            {analysisResult.keywordAnalysis.missingKeywords.length > 8 && (
                              <span style={{ fontSize: '12px', color: '#718096', padding: '3px' }}>+{analysisResult.keywordAnalysis.missingKeywords.length - 8} more</span>
                            )}
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
                      <FileText size={20} color="#196D45" /> Structure & Formatting
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
                      <MessageSquare size={20} color="#196D45" /> Interview Preparation
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
          </div>
        )}
      </div>
    </div>
  )
}
