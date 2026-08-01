const defaultBaseUrl =
  typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:8000'
    : 'https://tour-management-backend-0cbt.onrender.com';

export const BASE_URL = process.env.REACT_APP_BASE_URL || defaultBaseUrl;

 