import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  githubCallback: (code) => apiClient.post('/auth/github/callback', { code }),
  login: (email, password) => apiClient.post('/auth/login', { email, password }),
  getCurrentUser: () => apiClient.get('/auth/me'),
  logout: () => apiClient.post('/auth/logout'),
};

export const ingestAPI = {
  uploadResume: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post('/ingest/resume', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  fetchGithub: (username) => apiClient.post('/ingest/github', { username }),
  setJobGoal: (jobGoal) => apiClient.post('/ingest/job-goal', { jobGoal }),
};

export const portfolioAPI = {
  generatePortfolio: () => apiClient.post('/portfolio/generate'),
  listPortfolios: () => apiClient.get('/portfolio/list'),
  getPortfolio: (id) => apiClient.get(`/portfolio/${id}`),
  publishPortfolio: (id) => apiClient.post(`/portfolio/${id}/publish`),
  updatePortfolio: (id, data) => apiClient.put(`/portfolio/${id}/update`, data),
  deletePortfolio: (id) => apiClient.delete(`/portfolio/${id}/delete`),
};
