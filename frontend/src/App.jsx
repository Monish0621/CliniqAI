import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'
import Login from './pages/Login'
import Register from './pages/Register'
import DiseaseSelection from './pages/DiseaseSelection'
import InputForm from './pages/InputForm'
import Results from './pages/Results'
import ComparePatients from './pages/ComparePatients'
import ModelTransparency from './pages/ModelTransparency'
import Dashboard from './pages/Dashboard'
import Layout from './components/Layout'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    )
  }
  
  return user ? children : <Navigate to="/login" />
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    )
  }
  
  return user ? <Navigate to="/dashboard" /> : children
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="select-disease" element={<DiseaseSelection />} />
        <Route path="input-form" element={<InputForm />} />
        <Route path="results" element={<Results />} />
        <Route path="compare-patients" element={<ComparePatients />} />
        <Route path="model-transparency" element={<ModelTransparency />} />
      </Route>
    </Routes>
  )
}

export default App
