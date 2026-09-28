import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { Users, FileText, Briefcase, Activity, Target, BrainCircuit, CheckCircle, AlertTriangle, Clock, ServerCrash, PieChart, Server, Database } from 'lucide-react';
import './AdminPanel.css';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('Overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalResumes: 0,
    totalJobs: 0,
    totalAnalyses: 0,
    averageAtsScore: 0,
    geminiRequests: 0,
    successfulRequests: 0,
    deterministicFallbackCount: 0
  });

  const [users, setUsers] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [analyses, setAnalyses] = useState([]);
  const [monitoring, setMonitoring] = useState({
    geminiRequests: 0,
    successfulRequests: 0,
    timeoutCount: 0,
    quotaErrorCount: 0,
    deterministicFallbackCount: 0,
    llmSuccessRate: 0
  });
  const [health, setHealth] = useState({
    backend: 'checking...',
    database: 'checking...',
    pythonAI: 'checking...',
    gemini: 'checking...'
  });

  useEffect(() => {
    fetchData(activeTab);
  }, [activeTab]);

  const fetchData = async (tab) => {
    setLoading(true);
    setError(null);
    try {
      if (tab === 'Overview') {
        const res = await api.getAdminStats();
        if (res.data) setStats(res.data);
      } else if (tab === 'Users') {
        const res = await api.getAdminUsers();
        if (res.data && res.data.users) setUsers(res.data.users);
      } else if (tab === 'Resumes') {
        const res = await api.getAdminResumes();
        if (res.data && res.data.resumes) setResumes(res.data.resumes);
      } else if (tab === 'Jobs') {
        const res = await api.getAdminJobs();
        if (res.data && res.data.jobs) setJobs(res.data.jobs);
      } else if (tab === 'Analyses') {
        const res = await api.getAdminAnalyses();
        if (res.data && res.data.analyses) setAnalyses(res.data.analyses);
      } else if (tab === 'AI Monitoring') {
        const res = await api.getAdminAiMonitoring();
        if (res.data) setMonitoring(res.data);
      } else if (tab === 'System Health') {
        const res = await api.getAdminSystemHealth();
        console.log('System Health API response:', res);
        
        if (res.data && res.data.health) {
          const parsedHealth = {
            backend: res.data.health.backend || 'unknown',
            database: res.data.health.database || 'unknown',
            pythonAI: res.data.health.pythonAI || 'unknown',
            gemini: res.data.health.gemini || 'unknown'
          };
          console.log('Parsed health object:', parsedHealth);
          setHealth(parsedHealth);
        }
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to fetch admin data. Ensure you have admin privileges and the backend is running.');
      if (tab === 'System Health') {
        setHealth({
          backend: 'unavailable',
          database: 'unavailable',
          pythonAI: 'unavailable',
          gemini: 'unavailable'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const tabs = ['Overview', 'Users', 'Resumes', 'Jobs', 'Analyses', 'AI Monitoring', 'System Health'];

  const getStatusColor = (status) => {
    const s = status ? status.toLowerCase() : '';
    if (s === 'healthy' || s === 'up' || s === 'online') return '#276749';
    if (s === 'unhealthy' || s === 'down' || s === 'offline' || s === 'critical' || s === 'unavailable') return '#9b2c2c';
    if (s === 'checking...') return '#4a5568';
    return '#975a16'; // for not_configured or unknown
  };

  const getStatusBg = (status) => {
    const s = status ? status.toLowerCase() : '';
    if (s === 'healthy' || s === 'up' || s === 'online') return '#c6f6d5';
    if (s === 'unhealthy' || s === 'down' || s === 'offline' || s === 'critical' || s === 'unavailable') return '#fed7d7';
    if (s === 'checking...') return '#e2e8f0';
    return '#fefcbf'; // for not_configured or unknown
  };

  const formatStatus = (status) => {
    const s = status ? status.toLowerCase() : '';
    if (s === 'healthy') return 'Healthy';
    if (s === 'unhealthy') return 'Unhealthy';
    if (s === 'not_configured') return 'Not Configured';
    if (s === 'checking...') return 'Checking...';
    if (s === 'unavailable') return 'Unavailable';
    return status;
  };

  return (
    <div className="admin-panel-container">
      <div className="admin-panel-header">
        <h1>Admin Control Panel</h1>
        <div className="admin-tabs">
          {tabs.map(tab => (
            <button 
              key={tab} 
              className={`admin-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="admin-panel-content">
        {error && (
          <div style={{ backgroundColor: '#fed7d7', color: '#822727', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
            <strong>Access Denied / Error:</strong> {error}
          </div>
        )}

        {(loading && activeTab !== 'System Health') ? (
          <div>Loading {activeTab} data...</div>
        ) : (
          <>
            {activeTab === 'Overview' && (
              <div className="admin-grid">
                <div className="admin-card">
                  <div className="admin-stat">
                    <div className="admin-stat-icon"><Users /></div>
                    <div className="admin-stat-content">
                      <h4>Total Users</h4>
                      <p>{stats.totalUsers}</p>
                    </div>
                  </div>
                </div>
                <div className="admin-card">
                  <div className="admin-stat">
                    <div className="admin-stat-icon"><FileText /></div>
                    <div className="admin-stat-content">
                      <h4>Total Resumes</h4>
                      <p>{stats.totalResumes}</p>
                    </div>
                  </div>
                </div>
                <div className="admin-card">
                  <div className="admin-stat">
                    <div className="admin-stat-icon"><Briefcase /></div>
                    <div className="admin-stat-content">
                      <h4>Total Jobs</h4>
                      <p>{stats.totalJobs}</p>
                    </div>
                  </div>
                </div>
                <div className="admin-card">
                  <div className="admin-stat">
                    <div className="admin-stat-icon"><Activity /></div>
                    <div className="admin-stat-content">
                      <h4>Total Analyses</h4>
                      <p>{stats.totalAnalyses}</p>
                    </div>
                  </div>
                </div>
                <div className="admin-card">
                  <div className="admin-stat">
                    <div className="admin-stat-icon"><Target /></div>
                    <div className="admin-stat-content">
                      <h4>Avg ATS Score</h4>
                      <p>{stats.averageAtsScore}</p>
                    </div>
                  </div>
                </div>
                <div className="admin-card">
                  <div className="admin-stat">
                    <div className="admin-stat-icon"><BrainCircuit /></div>
                    <div className="admin-stat-content">
                      <h4>Gemini Requests</h4>
                      <p>{stats.geminiRequests}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Users' && (
              <div className="admin-card">
                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Resumes</th>
                        <th>Analyses</th>
                        <th>Created Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.length > 0 ? users.map((u, i) => (
                        <tr key={i}>
                          <td style={{ fontWeight: '500' }}>{u.name}</td>
                          <td>{u.email}</td>
                          <td><span className="admin-badge" style={{ backgroundColor: u.role === 'admin' ? '#ebf8ff' : '#edf2f7', color: u.role === 'admin' ? '#2b6cb0' : '#4a5568' }}>{u.role || 'user'}</span></td>
                          <td>{u.resumeCount}</td>
                          <td>{u.analysisCount}</td>
                          <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                        </tr>
                      )) : (
                        <tr><td colSpan="6" style={{ textAlign: 'center' }}>No users found</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'Resumes' && (
              <div className="admin-card">
                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Resume Title</th>
                        <th>Owner</th>
                        <th>Upload Date</th>
                        <th>Analysis Count</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resumes.length > 0 ? resumes.map((r, i) => (
                        <tr key={i}>
                          <td style={{ fontWeight: '500' }}>{r.title}</td>
                          <td>{r.ownerName}</td>
                          <td>{new Date(r.uploadDate).toLocaleDateString()}</td>
                          <td>{r.analysisCount}</td>
                        </tr>
                      )) : (
                        <tr><td colSpan="4" style={{ textAlign: 'center' }}>No resumes found</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'Jobs' && (
              <div className="admin-card">
                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Job Title</th>
                        <th>Owner</th>
                        <th>Created Date</th>
                        <th>Analysis Count</th>
                      </tr>
                    </thead>
                    <tbody>
                      {jobs.length > 0 ? jobs.map((j, i) => (
                        <tr key={i}>
                          <td style={{ fontWeight: '500' }}>{j.title}</td>
                          <td>{j.ownerName}</td>
                          <td>{new Date(j.createdAt).toLocaleDateString()}</td>
                          <td>{j.analysisCount}</td>
                        </tr>
                      )) : (
                        <tr><td colSpan="4" style={{ textAlign: 'center' }}>No jobs found</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'Analyses' && (
              <div className="admin-card">
                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Candidate</th>
                        <th>Job</th>
                        <th>Score</th>
                        <th>LLM Source</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analyses.length > 0 ? analyses.map((a, i) => (
                        <tr key={i}>
                          <td>{a.candidateName}</td>
                          <td style={{ fontWeight: '500' }}>{a.jobTitle}</td>
                          <td>
                            <span style={{ fontWeight: 'bold', color: a.score >= 80 ? '#276749' : (a.score >= 60 ? '#975a16' : '#9b2c2c') }}>
                              {a.score}/100
                            </span>
                          </td>
                          <td><span className="admin-badge" style={{ backgroundColor: '#ebf8ff', color: '#2b6cb0' }}>{a.llmSource || 'Gemini'}</span></td>
                          <td>{new Date(a.createdAt).toLocaleDateString()}</td>
                        </tr>
                      )) : (
                        <tr><td colSpan="5" style={{ textAlign: 'center' }}>No analyses found</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'AI Monitoring' && (
              <>
                <div className="admin-grid">
                  <div className="admin-card">
                    <div className="admin-stat">
                      <div className="admin-stat-icon"><BrainCircuit /></div>
                      <div className="admin-stat-content">
                        <h4>Total Requests</h4>
                        <p>{monitoring.geminiRequests}</p>
                      </div>
                    </div>
                  </div>
                  <div className="admin-card">
                    <div className="admin-stat">
                      <div className="admin-stat-icon" style={{ backgroundColor: '#f0fdf4', color: '#196D45' }}><CheckCircle /></div>
                      <div className="admin-stat-content">
                        <h4>Successful</h4>
                        <p>{monitoring.successfulRequests}</p>
                      </div>
                    </div>
                  </div>
                  <div className="admin-card">
                    <div className="admin-stat">
                      <div className="admin-stat-icon" style={{ backgroundColor: '#feebc8', color: '#dd6b20' }}><AlertTriangle /></div>
                      <div className="admin-stat-content">
                        <h4>Fallbacks</h4>
                        <p>{monitoring.deterministicFallbackCount}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div className="admin-card">
                    <div className="admin-card-header">
                      <h3>Error Diagnostics</h3>
                    </div>
                    <div style={{ display: 'flex', gap: '20px' }}>
                      <div style={{ flex: 1, padding: '15px', backgroundColor: '#fff5f5', border: '1px solid #fed7d7', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                          <Clock size={20} color="#e53e3e" />
                          <h4 style={{ margin: 0, color: '#c53030' }}>Timeouts</h4>
                        </div>
                        <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>{monitoring.timeoutCount}</p>
                      </div>
                      <div style={{ flex: 1, padding: '15px', backgroundColor: '#fffaf0', border: '1px solid #feebc8', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                          <ServerCrash size={20} color="#dd6b20" />
                          <h4 style={{ margin: 0, color: '#c05621' }}>Quota Errors (429)</h4>
                        </div>
                        <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>{monitoring.quotaErrorCount}</p>
                      </div>
                    </div>
                  </div>

                  <div className="admin-card">
                    <div className="admin-card-header">
                      <h3>LLM Success Rate</h3>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                      <PieChart size={48} color="#196D45" />
                      <div>
                        <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{monitoring.llmSuccessRate || 0}%</div>
                        <div style={{ color: '#718096', fontSize: '14px' }}>Successfully processed by Gemini</div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'System Health' && (
              <div className="admin-grid">
                <div className="admin-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                    <Server size={24} color="#4a5568" />
                    <h3 style={{ margin: 0 }}>Node.js Backend</h3>
                  </div>
                  <span className="admin-badge" style={{ backgroundColor: getStatusBg(health.backend), color: getStatusColor(health.backend) }}>
                    {formatStatus(health.backend)}
                  </span>
                </div>
                <div className="admin-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                    <Database size={24} color="#4a5568" />
                    <h3 style={{ margin: 0 }}>PostgreSQL / Neon</h3>
                  </div>
                  <span className="admin-badge" style={{ backgroundColor: getStatusBg(health.database), color: getStatusColor(health.database) }}>
                    {formatStatus(health.database)}
                  </span>
                </div>
                <div className="admin-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                    <Activity size={24} color="#4a5568" />
                    <h3 style={{ margin: 0 }}>Python AI Service</h3>
                  </div>
                  <span className="admin-badge" style={{ backgroundColor: getStatusBg(health.pythonAI), color: getStatusColor(health.pythonAI) }}>
                    {formatStatus(health.pythonAI)}
                  </span>
                </div>
                <div className="admin-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                    <BrainCircuit size={24} color="#4a5568" />
                    <h3 style={{ margin: 0 }}>Gemini API</h3>
                  </div>
                  <span className="admin-badge" style={{ backgroundColor: getStatusBg(health.gemini), color: getStatusColor(health.gemini) }}>
                    {formatStatus(health.gemini)}
                  </span>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
