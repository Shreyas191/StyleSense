import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors (unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  signup: (data) => api.post('/api/auth/signup', data),
  login: (data) => api.post('/api/auth/login', data),
};

export const outfitAPI = {
  analyzeOutfit: (formData) => {
    return api.post('/api/outfit/analyze', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  getAnalysis: (id) => api.get(`/api/outfit/${id}`),
  chatWithStylist: (id, data) => api.post(`/api/outfit/chat/${id}`, data),

  // Community features
  getCommunityFeed: (limit = 50, skip = 0) => api.get(`/api/outfit/community/feed?limit=${limit}&skip=${skip}`),
  togglePublic: (id, tags) => api.post(`/api/outfit/${id}/toggle-public`, tags),
  toggleLike: (id) => api.post(`/api/outfit/${id}/like`),
  toggleDislike: (id) => api.post(`/api/outfit/${id}/dislike`),
  addComment: (id, text) => api.post(`/api/outfit/${id}/comment`, { text }),

  getUserAnalyses: (limit = 50, skip = 0) =>
    api.get(`/api/outfit/user/all?limit=${limit}&skip=${skip}`),
  deleteAnalysis: (id) => api.delete(`/api/outfit/${id}`),
};

export const closetAPI = {
  getCloset: () => api.get('/api/closet/'),
  addItem: (data) => api.post('/api/closet/', data),
  deleteItem: (id) => api.delete(`/api/closet/${id}`),
  updateItem: (id, data) => api.patch(`/api/closet/${id}`, data),
};

export default api;
