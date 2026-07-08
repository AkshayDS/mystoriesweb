import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
});

// Attach admin JWT token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('storynest-admin-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Books ───────────────────────────────────────────────────────────────────

export const getBooks = (params = {}) => api.get('/books', { params });
export const getBook = (id) => api.get(`/books/${id}`);
export const incrementRead = (id) => api.post(`/books/${id}/increment-read`);
export const createReaderSession = (id) => api.post(`/books/${id}/session`);
export const getPageUrl = (bookId, pageNum, sessionToken) =>
  api.get(`/books/${bookId}/page/${pageNum}`, {
    headers: { 'x-reader-session': sessionToken },
  });

// ─── Admin ───────────────────────────────────────────────────────────────────

export const adminLogin = (credentials) => api.post('/admin/login', credentials);
export const getAdminBooks = () => api.get('/admin/books');
export const uploadBook = (formData) =>
  api.post('/admin/books', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      const percent = Math.round((e.loaded * 100) / e.total);
      return percent;
    },
  });
export const updateBook = (id, formData) =>
  api.put(`/admin/books/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const deleteBook = (id) => api.delete(`/admin/books/${id}`);
export const toggleBookStatus = (id) =>
  api.patch(`/admin/books/${id}/toggle-status`);
export const toggleBookFeatured = (id) =>
  api.patch(`/admin/books/${id}/toggle-featured`);

export default api;
