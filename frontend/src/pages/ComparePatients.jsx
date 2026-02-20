import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, Activity, Heart, ArrowRight, AlertCircle, Filter } from 'lucide-react'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts'
import api from '../api'

export default function ComparePatients() {
  const [patients, setPatients] = useState([])
  const [selectedDisease, setSelectedDisease] = useState('diabetes')
  const [selectedPatient1, setSelectedPatient1] = useState(null)
  const [selectedPatient2, setSelectedPatient2] = useState(null)
  const [comparison, setComparison] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchPatients()
  }, [])

  const fetchPatients = async () => {
    try {
      const response = await api.get('/api/v1/patients/')
      setPatients(response.data)
    } catch (error) {
      console.error('Error fetching patients:', error)
    }
  }

  // Filter patients by selected disease type
  const filteredPatients = patients.filter(p => p.disease_type === selectedDisease)

  const handleDiseaseChange = (disease) => {
    setSelectedDisease(disease)
    setSelectedPatient1(null)
    setSelectedPatient2(null)
    setComparison(null)
    setError('')
  }

  const handleCompare = async () => {
    if (!selectedPatient1 || !selectedPatient2) return
    
    // Check if both patients have the same disease type
    const patient1 = patients.find(p => p.id === parseInt(selectedPatient1))
    const patient2 = patients.find(p => p.id === parseInt(selectedPatient2))
    
    if (patient1.disease_type !== patient2.disease_type) {
      setError('Cannot compare patients with different disease types. Please select patients with the same disease type.')
      return
    }
    
    setError('')
    setLoading(true)
    try {
      const response = await api.post('/api/v1/patients/compare', {
        record_id_1: selectedPatient1,
        record_id_2: selectedPatient2
      })
      setComparison(response.data)
    } catch (error) {
      console.error('Error comparing patients:', error)
      setError('Failed to compare patients. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getRiskColor = (category) => {
    switch (category) {
      case 'Low': return 'text-emerald-400'
      case 'Moderate': return 'text-amber-400'
      case 'High': return 'text-orange-400'
      case 'Critical': return 'text-rose-400'
      default: return 'text-slate-400'
    }
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  // Prepare chart data for comparison
  const getChartData = (shapValues) => {
    if (!shapValues || !Array.isArray(shapValues)) return []
    return shapValues.slice(0, 6).map(item => ({
      feature: item.feature,
      value: Math.abs(item.value),
      originalValue: item.value
    }))
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 mb-4">
            <Users className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Compare Patients</h1>
          <p className="text-slate-400">Select two patient records of the same disease type to compare their risk assessments</p>
        </div>

        {/* Disease Type Selection */}
        <div className="glass-card rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Filter className="w-5 h-5 text-cyan-400" />
            <span className="text-slate-300 font-medium">Select Disease Type:</span>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => handleDiseaseChange('diabetes')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all ${
                selectedDisease === 'diabetes' 
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white' 
                  : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50'
              }`}
            >
              <Activity className="w-5 h-5" />
              Diabetes
            </button>
            <button
              onClick={() => handleDiseaseChange('heart_disease')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all ${
                selectedDisease === 'heart_disease' 
                  ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white' 
                  : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50'
              }`}
            >
              <Heart className="w-5 h-5" />
              Heart Disease
            </button>
          </div>
          {filteredPatients.length === 0 && (
            <p className="text-slate-400 mt-4">No patients found for {selectedDisease === 'diabetes' ? 'Diabetes' : 'Heart Disease'}. Make some predictions first!</p>
          )}
        </div>

        {/* Patient Selection */}
        {filteredPatients.length > 0 && (
          <div className="glass-card rounded-2xl p-6 mb-8">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Patient 1 */}
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  Patient 1 <span className="text-cyan-400">({selectedDisease === 'diabetes' ? 'Diabetes' : 'Heart Disease'})</span>
                </label>
                <select
                  value={selectedPatient1 || ''}
                  onChange={(e) => {
                    setSelectedPatient1(e.target.value)
                    setComparison(null)
                  }}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="">Select a patient</option>
                  {filteredPatients.map(patient => (
                    <option key={patient.id} value={patient.id}>
                      {patient.patient_name} ({formatDate(patient.created_at)})
                    </option>
                  ))}
                </select>
              </div>

              {/* Patient 2 */}
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  Patient 2 <span className="text-cyan-400">({selectedDisease === 'diabetes' ? 'Diabetes' : 'Heart Disease'})</span>
                </label>
                <select
                  value={selectedPatient2 || ''}
                  onChange={(e) => {
                    setSelectedPatient2(e.target.value)
                    setComparison(null)
                  }}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="">Select a patient</option>
                  {filteredPatients.filter(p => p.id !== parseInt(selectedPatient1 || '0')).map(patient => (
                    <option key={patient.id} value={patient.id}>
                      {patient.patient_name} ({formatDate(patient.created_at)})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-4 bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-300 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <div className="mt-6 flex justify-center">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCompare}
                disabled={!selectedPatient1 || !selectedPatient2 || loading}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold py-3 px-8 rounded-lg disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Compare Patients <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </motion.button>
            </div>
          </div>
        )}

        {/* Comparison Results */}
        {comparison && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Patient Cards */}
            <div className="grid md:grid-cols-2 gap-8">
              {/* Patient 1 */}
              <div className="glass-card rounded-2xl p-6 border-2 border-cyan-500/30">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                    {comparison.prediction_1.disease_type === 'diabetes' ? (
                      <Activity className="w-5 h-5 text-white" />
                    ) : (
                      <Heart className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{comparison.record_1.patient_name}</h3>
                    <p className="text-slate-400 text-sm capitalize">{comparison.record_1.disease_type.replace('_', ' ')}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Risk Probability</span>
                    <span className={`text-2xl font-bold ${getRiskColor(comparison.prediction_1.risk_category)}`}>
                      {(comparison.prediction_1.risk_probability * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Category</span>
                    <span className={`font-semibold ${getRiskColor(comparison.prediction_1.risk_category)}`}>
                      {comparison.prediction_1.risk_category}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Confidence Interval</span>
                    <span className="text-white">
                      {(comparison.prediction_1.confidence_interval_low * 100).toFixed(1)}% - {(comparison.prediction_1.confidence_interval_high * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Patient 2 */}
              <div className="glass-card rounded-2xl p-6 border-2 border-pink-500/30">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
                    {comparison.prediction_2.disease_type === 'diabetes' ? (
                      <Activity className="w-5 h-5 text-white" />
                    ) : (
                      <Heart className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{comparison.record_2.patient_name}</h3>
                    <p className="text-slate-400 text-sm capitalize">{comparison.record_2.disease_type.replace('_', ' ')}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Risk Probability</span>
                    <span className={`text-2xl font-bold ${getRiskColor(comparison.prediction_2.risk_category)}`}>
                      {(comparison.prediction_2.risk_probability * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Category</span>
                    <span className={`font-semibold ${getRiskColor(comparison.prediction_2.risk_category)}`}>
                      {comparison.prediction_2.risk_category}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Confidence Interval</span>
                    <span className="text-white">
                      {(comparison.prediction_2.confidence_interval_low * 100).toFixed(1)}% - {(comparison.prediction_2.confidence_interval_high * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* SHAP Comparison Chart */}
            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-white mb-6 text-center">SHAP Values Comparison</h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-lg font-medium text-cyan-400 mb-4 text-center">{comparison.record_1.patient_name}</h4>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={getChartData(comparison.prediction_1.shap_values)}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis type="number" stroke="#94a3b8" />
                        <YAxis dataKey="feature" type="category" stroke="#94a3b8" width={60} tick={{ fontSize: 10 }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#1e293b',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px'
                          }}
                        />
                        <Bar dataKey="value" fill="#0ea5e9" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-medium text-pink-400 mb-4 text-center">{comparison.record_2.patient_name}</h4>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={getChartData(comparison.prediction_2.shap_values)}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis type="number" stroke="#94a3b8" />
                        <YAxis dataKey="feature" type="category" stroke="#94a3b8" width={60} tick={{ fontSize: 10 }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#1e293b',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px'
                          }}
                        />
                        <Bar dataKey="value" fill="#f43f5e" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>

            {/* Differences Summary */}
            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-white mb-6 text-center">Comparison Summary</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                  <span className="text-slate-400 text-sm">Risk Difference</span>
                  <p className="text-3xl font-bold text-white mt-2">
                    {Math.abs((comparison.prediction_1.risk_probability - comparison.prediction_2.risk_probability) * 100).toFixed(1)}%
                  </p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                  <span className="text-slate-400 text-sm">Higher Risk</span>
                  <p className="text-lg font-semibold text-white mt-2">
                    {comparison.prediction_1.risk_probability > comparison.prediction_2.risk_probability 
                      ? comparison.record_1.patient_name 
                      : comparison.record_2.patient_name}
                  </p>
                  <span className={`text-sm ${getRiskColor(comparison.prediction_1.risk_probability > comparison.prediction_2.risk_probability ? comparison.prediction_1.risk_category : comparison.prediction_2.risk_category)}`}>
                    {(Math.max(comparison.prediction_1.risk_probability, comparison.prediction_2.risk_probability) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                  <span className="text-slate-400 text-sm">Risk Category</span>
                  <p className="text-lg font-semibold text-white mt-2">
                    {comparison.prediction_1.risk_category !== comparison.prediction_2.risk_category ? 'Different' : 'Same'}
                  </p>
                  <p className="text-sm text-slate-400">
                    {comparison.prediction_1.risk_category} vs {comparison.prediction_2.risk_category}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {(!comparison && patients.length > 0 && filteredPatients.length === 0) && (
          <div className="glass-card rounded-2xl p-12 text-center">
            <AlertCircle className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Patients for Selected Disease</h3>
            <p className="text-slate-400">No {selectedDisease === 'diabetes' ? 'diabetes' : 'heart disease'} predictions found. Make some predictions first!</p>
          </div>
        )}

        {patients.length === 0 && (
          <div className="glass-card rounded-2xl p-12 text-center">
            <AlertCircle className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Patient Records</h3>
            <p className="text-slate-400">Make some predictions first to compare patients</p>
          </div>
        )}
      </motion.div>
    </div>
  )
}
