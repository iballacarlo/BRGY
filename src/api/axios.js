import axios from 'axios'

function getApiBase(){
  const envBase = import.meta.env.VITE_API_BASE
  if(envBase) return envBase

  // Default backend URL expected by the project README.
  // If you run PHP on a different host/port, set VITE_API_BASE.
  return 'http://localhost/barangay-api/api.php'
}

const api = axios.create({
  baseURL: getApiBase(),
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
})

// Auto-attach token to requests
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if(token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default api
