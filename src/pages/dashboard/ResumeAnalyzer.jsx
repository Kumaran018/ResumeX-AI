import React, { useState, useEffect } from 'react'
import { api } from '../../utils/api'

export default function ResumeAnalyzer() {
  const [title, setTitle] = useState('')
  const [file, setFile] = useState(null)
  const [status, setStatus] = useState('')
  const [resumes, setResumes] = useState([])

  const fetchResumes = async () => {
    try {
      const res = await api.getResumes()
      if (res.data && res.data.resumes) {
        setResumes(res.data.resumes)
      }
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchResumes()
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
      fetchResumes()
    } catch (err) {
      setStatus(`Error: ${err.message}`)
    }
  }

  return (
    <div className="placeholder-page" style={{ padding: '20px' }}>
      <div className="placeholder-header">
        <h1>Resume Analyzer</h1>
      </div>
      <div className="placeholder-content" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'left' }}>
        
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

        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <h2 style={{ marginTop: 0 }}>Your Resumes</h2>
          {resumes.length === 0 ? (
            <p>No resumes uploaded yet.</p>
          ) : (
            <ul style={{ listStyleType: 'none', padding: 0 }}>
              {resumes.map(r => (
                <li key={r._id} style={{ padding: '10px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
                  <strong>{r.title}</strong>
                  <span style={{ color: '#666', fontSize: '0.9em' }}>{new Date(r.createdAt).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
