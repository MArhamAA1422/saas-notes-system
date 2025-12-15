import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3333/api',
  withCredentials: true, // Send cookies with requests
  headers: {
    'Content-Type': 'application/json',
  },
})

/* DON'T auto-redirect on 401 - let components handle it
   Response interceptor for error handling (optional logging) */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    /* Just pass the error through, don't redirect
       The AuthContext and ProtectedRoute will handle authentication */
    return Promise.reject(error)
  }
)

export default api