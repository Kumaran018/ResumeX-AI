const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Helper to handle fetch requests with auth token
 */
export const apiClient = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  const headers = {
    ...options.headers,
  };

  // Only set Content-Type if it's not FormData (fetch sets multipart boundary automatically)
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
};

let resumesCache = null;
let jobsCache = null;

export const api = {
  // Auth
  login: (credentials) => apiClient('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  signup: (userData) => apiClient('/auth/signup', { method: 'POST', body: JSON.stringify(userData) }),
  logout: () => apiClient('/auth/logout', { method: 'POST' }),
  getMe: () => apiClient('/auth/me'),

  // Resumes
  uploadResume: async (formData) => {
    const res = await apiClient('/resumes', { method: 'POST', body: formData });
    resumesCache = null;
    return res;
  },
  getResumes: async (force = false) => {
    if (!force && resumesCache) return resumesCache;
    const res = await apiClient('/resumes');
    resumesCache = res;
    return res;
  },
  getResume: (id) => apiClient(`/resumes/${id}`),
  deleteResume: async (id) => {
    const res = await apiClient(`/resumes/${id}`, { method: 'DELETE' });
    resumesCache = null;
    return res;
  },

  // Jobs
  createJob: async (jobData) => {
    const res = await apiClient('/jobs', { method: 'POST', body: JSON.stringify(jobData) });
    jobsCache = null;
    return res;
  },
  getJobs: async (force = false) => {
    if (!force && jobsCache) return jobsCache;
    const res = await apiClient('/jobs');
    jobsCache = res;
    return res;
  },
  getJob: (id) => apiClient(`/jobs/${id}`),

  // Analysis
  analyze: (analysisData, options = {}) => apiClient('/analyze', { method: 'POST', body: JSON.stringify(analysisData), ...options }),
  getAnalyses: () => apiClient('/analyses'),
  getAnalysis: (id) => apiClient(`/analyses/${id}`),

  // Admin
  getAdminStats: () => apiClient('/admin/stats'),
  getAdminUsers: () => apiClient('/admin/users'),
  getAdminResumes: () => apiClient('/admin/resumes'),
  getAdminJobs: () => apiClient('/admin/jobs'),
  getAdminAnalyses: () => apiClient('/admin/analyses'),
  getAdminAiMonitoring: () => apiClient('/admin/ai-monitoring'),
  getAdminSystemHealth: () => apiClient('/admin/system-health')
};
