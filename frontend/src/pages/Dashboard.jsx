import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Activity, Heart, Plus, Users, FileText, TrendingUp, 
  Calendar, ArrowRight, Clock 
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../api'

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    totalPredictions: 0,
    diabetesPredictions: 0,
    heartPredictions: 0,
    recentPatients: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await api.get('/api/v1/patients/')
      const patients = response.data
      
      const diabetesCount = patients.filter(p => p.disease_type === 'diabetes').length
      const heartCount = patients.filter(p => p.disease_type === 'heart_disease').length

      setStats({
        totalPredictions: patients.length,
        diabetesPredictions: diabetesCount,
        heartPredictions: heartCount,
        recentPatients: patients.slice(0, 5)
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, {user?.full_name || user?.username}!
          </h1>
          <p className="text-slate-400">
            {user?.role === 'doctor' ? 'Manage your patients and their risk assessments' : 'View your health risk assessments'}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/select-disease')}
            className="glass-card rounded-2xl p-6 flex items-center gap-4 text-left group"
          >
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <Plus className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white group-hover:text-cyan-400 transition-colors">
                New Assessment
              </h3>
              <p className="text-slate-400 text-sm">Start a new diabetes or heart disease risk assessment</p>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/compare-patients')}
            className="glass-card rounded-2xl p-6 flex items-center gap-4 text-left group"
          >
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
              <Users className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white group-hover:text-purple-400 transition-colors">
                Compare Patients
              </h3>
              <p className="text-slate-400 text-sm">Compare risk assessments between patients</p>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
          </motion.button>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="text-slate-400 text-sm mb-1">Total Assessments</h3>
            <p className="text-3xl font-bold text-white">{stats.totalPredictions}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-slate-400 text-sm mb-1">Diabetes Tests</h3>
            <p className="text-3xl font-bold text-white">{stats.diabetesPredictions}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-slate-400 text-sm mb-1">Heart Tests</h3>
            <p className="text-3xl font-bold text-white">{stats.heartPredictions}</p>
          </motion.div>
        </div>

        {/* Recent Patients */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Recent Assessments</h2>
            <button 
              onClick={() => navigate('/model-transparency')}
              className="text-cyan-400 hover:text-cyan-300 text-sm font-medium"
            >
              View Model Info
            </button>
          </div>

          {stats.recentPatients.length > 0 ? (
            <div className="space-y-3">
              {stats.recentPatients.map((patient, index) => (
                <motion.div
                  key={patient.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      patient.disease_type === 'diabetes' 
                        ? 'bg-gradient-to-br from-emerald-500/20 to-teal-500/20' 
                        : 'bg-gradient-to-br from-rose-500/20 to-pink-500/20'
                    }`}>
                      {patient.disease_type === 'diabetes' ? (
                        <Activity className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <Heart className="w-5 h-5 text-rose-400" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-white font-medium">{patient.patient_name}</h4>
                      <p className="text-slate-400 text-sm capitalize">{patient.disease_type.replace('_', ' ')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-slate-400">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">{formatDate(patient.created_at)}</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-white font-medium mb-2">No assessments yet</h3>
              <p className="text-slate-400 mb-4">Start your first risk assessment</p>
              <button
                onClick={() => navigate('/select-disease')}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-2 rounded-lg hover:from-cyan-600 hover:to-blue-700"
              >
                Get Started
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  )
}
