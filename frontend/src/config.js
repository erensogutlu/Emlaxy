/**
 * Emlaxy Frontend Configuration File
 * Centralized API base URL setup
 */

// If there is an environment variable VITE_API_URL defined, use it.
// Otherwise, use local backend url in development mode and Render backend in production.
export const API_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.DEV ? 'http://127.0.0.1:5000' : 'https://emlaxy.onrender.com');
