export const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://your-production-api.com'
  : 'http://localhost:8080';

export const API_ENDPOINTS = {
  users: `${API_BASE_URL}/api/users`,
  courses: `${API_BASE_URL}/api/courses`,
  categories: `${API_BASE_URL}/api/categories`,
  progress: `${API_BASE_URL}/api/progress`,
}; 