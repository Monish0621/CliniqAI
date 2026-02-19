import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Activity, Heart, Download, RefreshCw, TrendingUp, 
  TrendingDown, Minus, AlertCircle, Info 
} from 'lucide-react'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, XAxis as XAxis2, YAxis as YAxis2 
} from 'recharts'
import { predictionsAPI, reportsAPI } from '../api'

export default function Results() {
  const location = useLocation()
  const navigate = useNavigate()
  const { prediction: initialPrediction, disease, patientName, inputData } = location.state || {}

  const [prediction, setPrediction] = useState(initialPrediction)
  const [whatIfData, setWhatIfData] = useState(inputData || {})
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState([])

  const diseaseName = disease === 'diabetes' ? 'Diabetes' : 'Heart Disease'
  const Icon = disease === 'diabetes' ? Activity : Heart

  useEffect(() => {
    if (initialPrediction) {
      setWhatIfData(inputData)
    }
  }, [initialPrediction, inputData])

  const handleWhatIfChange = async (field, value) => {
    const newData = { ...whatIfData, [field]: value }
    setWhatIfData(newData)
    
    // Debounce API call
    clearTimeout(window.whatIfTimeout)
    window.whatIfTimeout = setTimeout(async () => {
      setLoading(true)
      try {
      const response = await predictionsAPI.whatIf({
          disease_type: disease,
          input_data: newData
        })
        setPrediction(response.data)
      } catch (error) {
        console.error('What-if prediction error:', error)
      } finally {
        setLoading(false)
      }
    }, 500)
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

  const getRiskBgColor = (category) => {
    switch (category) {
      case 'Low': return 'bg-emerald-500'
      case 'Moderate': return 'bg-amber-500'
      case 'High': return 'bg-orange-500'
      case 'Critical': return 'bg-rose-500'
      default: return 'bg-slate-500'
    }
  }

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="w-5 h-5 text-rose-400" />
      case 'decreasing': return <TrendingDown className="w-5 h-5 text-emerald-400" />
      default: return <Minus className="w-5 h-5 text-slate-400" />
    }
  }

  const handleDownload = async () => {
    try {
      const response = await reportsAPI.downloadPDF(prediction.id)
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `cliniqai_report_${prediction.id}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      console.error('Download error:', error)
    }
  }

  const diabetesFields = [
    { name: 'gender', label: 'Gender', type: 'select', options: ['Female', 'Male', 'Other'] },
    { name: 'age', label: 'Age', type: 'number' },
    { name: 'hypertension', label: 'Hypertension', type: 'select', options: ['No', 'Yes'] },
    { name: 'heart_disease', label: 'Heart Disease', type: 'select', options: ['No', 'Yes'] },
    { name: 'smoking_history', label: 'Smoking', type: 'select', options: ['never', 'not current', 'ever', 'former', 'current', 'unknown'] },
    { name: 'bmi', label: 'BMI', type: 'number' },
    { name: 'HbA1c_level', label: 'HbA1c', type: 'number' },
    { name: 'blood_glucose_level', label: 'Blood Glucose', type: 'number' },
  ]

  const heartFields = [
    { name: 'age', label: 'Age', type: 'number' },
    { name: 'gender', label: 'Gender', type: 'select', options: ['Female', 'Male'] },
    { name: 'ap_hi', label: 'Systolic BP', type: 'number' },
    { name: 'ap_lo', label: 'Diastolic BP', type: 'number' },
    { name: 'smoke', label: 'Smoking', type: 'select', options: ['No', 'Yes'] },
    { name: 'alco', label: 'Alcohol', type: 'select', options: ['No', 'Yes'] },
    { name: 'active', label: 'Active', type: 'select', options: ['No', 'Yes'] },
    { name: 'bmi', label: 'BMI', type: 'number' },
  ]

  const fields = disease === 'diabetes' ? diabetesFields : heartFields

  if (!prediction) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h2 className="text-xl text-white mb-2">No Prediction Data</h2>
          <p className="text-slate-400 mb-4">Please make a prediction first</p>
          <button 
            onClick={() => navigate('/select-disease')}
            className="bg-cyan-500 text-white px-6 py-2 rounded-lg hover:bg-cyan-600"
          >
            Start Assessment
          </button>
        </div>
      </div>
    )
  }

  const riskProb = prediction.risk_probability * 100
  const ciLow = prediction.confidence_interval_low * 100
  const ciHigh = prediction.confidence_interval_high * 100

  return (
    <div className="min-h-screen py-8 px-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{diseaseName} Risk Assessment</h1>
                <p className="text-slate-400 text-sm">Patient: {patientName || 'Unknown'}</p>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/select-disease')}
              className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700"
            >
              <RefreshCw className="w-4 h-4" />
              New Assessment
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDownload}
              className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-2 rounded-lg"
            >
              <Download className="w-4 h-4" />
              Download Report
            </motion.button>
          </div>
        </div>

        {/* Main Content - Split Layout */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* LEFT: What-If Simulator */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card rounded-2xl p-6"
          >
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-cyan-400" />
              What-If Simulator
            </h2>
            <p className="text-slate-400 text-sm mb-6">
              Adjust values to see how they affect the prediction in real-time
            </p>

            <div className="space-y-4">
              {fields.map((field) => (
                <div key={field.name}>
                  <label className="block text-slate-300 text-sm mb-2">{field.label}</label>
                  {field.type === 'select' ? (
                    <select
                      value={whatIfData[field.name] || ''}
                      onChange={(e) => handleWhatIfChange(field.name, e.target.value)}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-2 px-3 text-white text-sm focus:outline-none focus:border-cyan-500"
                    >
                      {field.options.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="number"
                      value={whatIfData[field.name] || ''}
                      onChange={(e) => handleWhatIfChange(field.name, parseFloat(e.target.value))}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-2 px-3 text-white text-sm focus:outline-none focus:border-cyan-500"
                    />
                  )}
                </div>
              ))}
            </div>

            {loading && (
              <div className="mt-4 flex items-center justify-center gap-2 text-slate-400">
                <div className="w-4 h-4 border-2 border-slate-400/30 border-t-slate-400 rounded-full animate-spin" />
                <span>Updating...</span>
              </div>
            )}
          </motion.div>

          {/* RIGHT: Results */}
          <div className="space-y-6">
            {/* Risk Gauge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card rounded-2xl p-6"
            >
              <h2 className="text-xl font-semibold text-white mb-6">Risk Assessment</h2>
              
              <div className="flex items-center justify-center mb-6">
                <div className="relative w-48 h-48">
                  {/* Background circle */}
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="96"
                      cy="96"
                      r="80"
                      fill="none"
                      stroke="rgba(255,255,255,0.1)"
                      strokeWidth="12"
                    />
                    <circle
                      cx="96"
                      cy="96"
                      r="80"
                      fill="none"
                      className={`${getRiskBgColor(prediction.risk_category)}`}
                      strokeWidth="12"
                      strokeLinecap="round"
                      strokeDasharray={`${riskProb * 5.02} 502`}
                      style={{ transition: 'stroke-dasharray 1s ease-out' }}
                    />
                  </svg>
                  {/* Center text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className={`text-4xl font-bold ${getRiskColor(prediction.risk_category)}`}
                    >
                      {riskProb.toFixed(1)}%
                    </motion.span>
                    <span className="text-slate-400 text-sm">Risk Probability</span>
                  </div>
                </div>
              </div>

              {/* Confidence Interval */}
              <div className="bg-slate-800/50 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400 text-sm">Confidence Interval</span>
                  <span className="text-white font-medium">{ciLow.toFixed(1)}% - {ciHigh.toFixed(1)}%</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    className={`h-full ${getRiskBgColor(prediction.risk_category)}`}
                    style={{ 
                      marginLeft: `${ciLow}%`, 
                      width: `${ciHigh - ciLow}%` 
                    }}
                  />
                </div>
              </div>

              {/* Risk Category Badge */}
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${getRiskBgColor(prediction.risk_category)} bg-opacity-20`}>
                <span className={`font-semibold ${getRiskColor(prediction.risk_category)}`}>
                  {prediction.risk_category} Risk
                </span>
              </div>
            </motion.div>

            {/* SHAP Values */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card rounded-2xl p-6"
            >
              <h2 className="text-xl font-semibold text-white mb-4">Risk Factors (SHAP)</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={prediction.shap_values?.slice(0, 8) || []}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis type="number" stroke="#94a3b8" />
                    <YAxis 
                      dataKey="feature" 
                      type="category" 
                      stroke="#94a3b8"
                      width={70}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar 
                      dataKey="value" 
                      fill="#0ea5e9"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Clinical Explanation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card rounded-2xl p-6"
            >
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Info className="w-5 h-5 text-cyan-400" />
                Clinical Interpretation
              </h2>
              <p className="text-slate-300 leading-relaxed">
                {prediction.clinical_explanation}
              </p>
            </motion.div>

            {/* Risk Trajectory Placeholder */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass-card rounded-2xl p-6"
            >
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-cyan-400" />
                Risk Trajectory
              </h2>
              <div className="h-48 flex items-center justify-center text-slate-500">
                <p>Historical predictions will appear here as you make more assessments</p>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
