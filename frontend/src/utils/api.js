import axios from 'axios';

// 1. THIS IS THE MISSING PIECE: Create the 'api' instance
const api = axios.create({
   baseURL: 'https://localhost:5000/api',
  withCredentials: true, // Send cookies with requests
});

// 2. THIS IS THE INTERCEPTOR YOU NEED: For CSRF protection
api.interceptors.request.use(async (config) => {

// Only add CSRF token to state-changing methods
if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(config.method.toUpperCase())) {
  try {
    // Use the 'api' instance to fetch the token
    // This is simpler and uses the baseURL and credentials
    const { data } = await api.get('/csrf-token');
    
    // Set the 'X-CSRF-TOKEN' header
    config.headers['X-CSRF-TOKEN'] = data.csrfToken;
   
  } catch (error) {
      console.error('Failed to fetch CSRF token:', error);
      return Promise.reject('CSRF token fetch failed.');
    }
}
 
  return config;
}, (error) => {
  return Promise.reject(error);
});

// 3. THIS IS THE FIX: Export the 'api' instance
export default api;

// (The second interceptor for 'Authorization: Bearer' has been removed,
// as your server uses cookies and sessions, not JWTs in localStorage.)