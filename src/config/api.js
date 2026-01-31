// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Log API configuration in development
if (import.meta.env.DEV) {
  console.log('🔧 API Configuration:', {
    baseURL: API_BASE_URL,
    envVar: import.meta.env.VITE_API_BASE_URL || 'Not set (using default)',
    message: 'Make sure the backend server is running on port 5000'
  });
}

export default API_BASE_URL;
