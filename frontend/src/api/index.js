import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  register: (data) => api.post('/api/v1/auth/register', data),
  login: (data) => api.post('/api/v1/auth/login', data),
  getMe: () => api.get('/api/v1/auth/me')
}

// Predictions API
export const predictionsAPI = {
  predictDiabetes: (data) => api.post('/api/v1/predictions/diabetes', data),
  predictHeartDisease: (data) => api.post('/api/v1/predictions/heart_disease', data),
  whatIf: (data) => api.post('/api/v1/predictions/what-if', data),
  getModelInfo: (diseaseType) => api.get(`/api/v1/predictions/info/${diseaseType}`),
  getHistory: () => api.get('/api/v1/predictions/history')
}

// Patients API
export const patientsAPI = {
  getAll: () => api.get('/api/v1/patients/'),
  create: (data) => api.post('/api/v1/patients/', data),
  getOne: (id) => api.get(`/api/v1/patients/${id}`),
  compare: (data) => api.post('/api/v1/patients/compare', data),
  getPredictions: (id) => api.get(`/api/v1/patients/${id}/predictions`)
}

// Reports API
export const reportsAPI = {
  downloadPDF: (predictionId) => api.get(`/api/v1/reports/pdf?prediction_id=${predictionId}`, {
    responseType: 'blob'
  })
}

export default api
