const BASE_URL = 'http://localhost:5000/api';

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

export const api = {
  // Auth
  login: (credentials) => apiClient('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  signup: (userData) => apiClient('/auth/signup', { method: 'POST', body: JSON.stringify(userData) }),
  logout: () => apiClient('/auth/logout', { method: 'POST' }),
  getMe: () => apiClient('/auth/me'),

  // Resumes
  uploadResume: (formData) => apiClient('/resumes', { method: 'POST', body: formData }),
  getResumes: () => apiClient('/resumes'),
  getResume: (id) => apiClient(`/resumes/${id}`),
  deleteResume: (id) => apiClient(`/resumes/${id}`, { method: 'DELETE' }),

  // Jobs
  createJob: (jobData) => apiClient('/jobs', { method: 'POST', body: JSON.stringify(jobData) }),
  getJobs: () => apiClient('/jobs'),
  getJob: (id) => apiClient(`/jobs/${id}`),

  // Analysis
  analyze: (analysisData) => apiClient('/analyze', { method: 'POST', body: JSON.stringify(analysisData) }),
  getAnalyses: () => apiClient('/analyses'),
  getAnalysis: (id) => apiClient(`/analyses/${id}`)
};
