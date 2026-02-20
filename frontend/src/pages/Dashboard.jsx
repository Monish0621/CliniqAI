import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Activity, Heart, Plus, Users, FileText, TrendingUp, Calendar, ArrowRight, Sparkles, Zap } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { predictionsAPI } from '../api'

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({ totalPredictions: 0, diabetesPredictions: 0, heartPredictions: 0, recentPatients: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchStats() }, [])

  const fetchStats = async () => {
    try {
      const response = await predictionsAPI.getHistory()
      const predictions = response.data
      const diabetesCount = predictions.filter(p => p.disease_type === 'diabetes').length
      const heartCount = predictions.filter(p => p.disease_type === 'heart_disease').length
      setStats({ totalPredictions: predictions.length, diabetesPredictions: diabetesCount, heartPredictions: heartCount, recentPatients: predictions.slice(0, 5) })
    } catch (error) { console.error('Error fetching stats:', error) } 
    finally { setLoading(false) }
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const handleAssessmentClick = (patient) => {
    // Use patient_name from the top level (returned by backend)
    const patientName = patient.patient_name || patient.input_data?.patient_name || 'Unknown Patient'
    navigate('/results', { state: { prediction: patient, disease: patient.disease_type, patientName: patientName, inputData: patient.input_data, isFromHistory: true } })
  }

  const statCards = [
    { title: 'Total Assessments', value: stats.totalPredictions, icon: FileText, color: 'from-cyan-500 to-blue-600', delay: 0.1 },
    { title: 'Diabetes Tests', value: stats.diabetesPredictions, icon: Activity, color: 'from-emerald-500 to-teal-600', delay: 0.2 },
    { title: 'Heart Tests', value: stats.heartPredictions, icon: Heart, color: 'from-rose-500 to-pink-600', delay: 0.3 }
  ]

  return (
    <div className="min-h-screen py-8 px-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div animate={{ x: [0, 50, 0], y: [0, -30, 0] }} transition={{ duration: 15, repeat: Infinity }} className="absolute top-20 right-20 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl" />
        <motion.div animate={{ x: [0, -40, 0], y: [0, 40, 0] }} transition={{ duration: 12, repeat: Infinity }} className="absolute bottom-40 left-10 w-48 h-48 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center"
            >
              <Sparkles className="w-5 h-5 text-white" />
            </motion.div>
            <h1 className="text-3xl font-bold text-white">
              Welcome back, <span className="gradient-text">{user?.full_name || user?.username}!</span>
            </h1>
          </div>
          <p className="text-slate-400 ml-13">{user?.role === 'doctor' ? 'Manage your patients and their risk assessments' : 'View your health risk assessments'}</p>
        </motion.div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <motion.button 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(6, 182, 212, 0.3)" }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/select-disease')}
            className="glass-card rounded-2xl p-6 flex items-center gap-4 text-left group card-shine"
          >
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30"
            >
              <Plus className="w-7 h-7 text-white" />
            </motion.div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white group-hover:text-cyan-400 transition-colors flex items-center gap-2">
                New Assessment
                <Zap className="w-4 h-4 text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h3>
              <p className="text-slate-400 text-sm">Start a new diabetes or heart disease risk assessment</p>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
          </motion.button>
          
          <motion.button 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(139, 92, 246, 0.3)" }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/compare-patients')}
            className="glass-card rounded-2xl p-6 flex items-center gap-4 text-left group card-shine"
          >
            <motion.div 
              whileHover={{ scale: 1.1, rotate: -5 }}
              className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/30"
            >
              <Users className="w-7 h-7 text-white" />
            </motion.div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white group-hover:text-purple-400 transition-colors">Compare Patients</h3>
              <p className="text-slate-400 text-sm">Compare risk assessments between patients</p>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
          </motion.button>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: stat.delay }}
              whileHover={{ y: -5, boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }}
              className="glass-card rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <motion.div 
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}
                >
                  <stat.icon className="w-6 h-6 text-white" />
                </motion.div>
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              </div>
              <motion.h3 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: stat.delay + 0.2 }}
                className="text-slate-400 text-sm mb-1"
              >
                {stat.title}
              </motion.h3>
              <motion.p 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: stat.delay + 0.3, type: "spring" }}
                className="text-4xl font-bold text-white"
              >
                {loading ? (
                  <span className="skeleton inline-block w-16 h-10 rounded" />
                ) : (
                  <CountUp number={stat.value} />
                )}
              </motion.p>
            </motion.div>
          ))}
        </div>

        {/* Recent Assessments */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-cyan-400" />
              Recent Assessments
            </h2>
            <button onClick={() => navigate('/model-transparency')} className="text-cyan-400 hover:text-cyan-300 text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all">
              View Model Info <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="skeleton h-20 rounded-xl" />
              ))}
            </div>
          ) : stats.recentPatients.length > 0 ? (
            <div className="space-y-3">
              {stats.recentPatients.map((patient, index) => (
                <motion.div
                  key={patient.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ x: 5, backgroundColor: "rgba(30, 41, 59, 0.8)" }}
                  onClick={() => handleAssessmentClick(patient)}
                  className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl hover:bg-slate-800/50 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <motion.div 
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        patient.disease_type === 'diabetes' 
                          ? 'bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30' 
                          : 'bg-gradient-to-br from-rose-500/20 to-pink-500/20 border border-rose-500/30'
                      }`}
                    >
                      {patient.disease_type === 'diabetes' ? (
                        <Activity className="w-6 h-6 text-emerald-400" />
                      ) : (
                        <Heart className="w-6 h-6 text-rose-400" />
                      )}
                    </motion.div>
                    <div>
                      {/* Use patient_name from top level or fallback to input_data */}
                      <h4 className="text-white font-medium">{patient.patient_name || patient.input_data?.patient_name || 'Unknown Patient'}</h4>
                      <p className="text-slate-400 text-sm capitalize flex items-center gap-2">
                        {patient.disease_type.replace('_', ' ')}
                        <span className={`inline-block w-2 h-2 rounded-full ${
                          patient.risk_category === 'Low' ? 'bg-emerald-400' :
                          patient.risk_category === 'Moderate' ? 'bg-amber-400' :
                          patient.risk_category === 'High' ? 'bg-orange-400' : 'bg-rose-400'
                        }`} />
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-slate-400">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">{formatDate(patient.created_at)}</span>
                    </div>
                    <motion.span
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                    </motion.span>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-white font-medium mb-2 text-xl">No assessments yet</h3>
              <p className="text-slate-400 mb-6">Start your first risk assessment</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/select-disease')}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-3 rounded-xl hover:from-cyan-600 hover:to-blue-700 shadow-lg shadow-cyan-500/25"
              >
                Get Started
              </motion.button>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </div>
  )
}

function CountUp({ number }) {
  const [count, setCount] = useState(0)
  
  useEffect(() => {
    let start = 0
    const end = number
    const duration = 1000
    const increment = end / (duration / 16)
    
    const timer = setInterval(() => {
      start += increment
      if (start >= end) {
        setCount(end)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 16)
    
    return () => clearInterval(timer)
  }, [number])
  
  return count
}
