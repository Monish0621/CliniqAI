import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Activity, Heart, ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react'
import api from '../api'

export default function InputForm() {
  const location = useLocation()
  const navigate = useNavigate()
  const disease = location.state?.disease || 'diabetes'

  const [formData, setFormData] = useState({})
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [patientName, setPatientName] = useState('')

  const diabetesFields = [
    { name: 'gender', label: 'Gender', type: 'select', options: ['Female', 'Male', 'Other'], required: true },
    { name: 'age', label: 'Age', type: 'number', min: 0, max: 120, required: true },
    { name: 'hypertension', label: 'Hypertension', type: 'select', options: ['No', 'Yes'], required: true },
    { name: 'heart_disease', label: 'Heart Disease', type: 'select', options: ['No', 'Yes'], required: true },
    { name: 'smoking_history', label: 'Smoking History', type: 'select', options: ['never', 'not current', 'ever', 'former', 'current', 'unknown'], required: true },
    { name: 'bmi', label: 'BMI', type: 'number', min: 10, max: 100, step: 0.1, required: true },
    { name: 'HbA1c_level', label: 'HbA1c Level (%)', type: 'number', min: 3, max: 15, step: 0.1, required: true },
    { name: 'blood_glucose_level', label: 'Blood Glucose Level (mg/dL)', type: 'number', min: 50, max: 500, required: true },
  ]

  const heartFields = [
    { name: 'age', label: 'Age', type: 'number', min: 0, max: 120, required: true },
    { name: 'gender', label: 'Gender', type: 'select', options: ['Female', 'Male'], required: true },
    { name: 'ap_hi', label: 'Systolic Blood Pressure (mmHg)', type: 'number', min: 50, max: 250, required: true },
    { name: 'ap_lo', label: 'Diastolic Blood Pressure (mmHg)', type: 'number', min: 30, max: 150, required: true },
    { name: 'smoke', label: 'Smoking', type: 'select', options: ['No', 'Yes'], required: true },
    { name: 'alco', label: 'Alcohol Consumption', type: 'select', options: ['No', 'Yes'], required: true },
    { name: 'active', label: 'Physical Activity', type: 'select', options: ['No', 'Yes'], required: true },
    { name: 'bmi', label: 'BMI', type: 'number', min: 10, max: 100, step: 0.1, required: true },
  ]

  const fields = disease === 'diabetes' ? diabetesFields : heartFields
  const diseaseName = disease === 'diabetes' ? 'Diabetes' : 'Heart Disease'
  const Icon = disease === 'diabetes' ? Activity : Heart

  useEffect(() => {
    // Initialize form with default values
    const initialData = {}
    fields.forEach(field => {
      if (field.type === 'number') {
        initialData[field.name] = ''
      } else if (field.type === 'select') {
        initialData[field.name] = field.options[0]
      }
    })
    setFormData(initialData)
  }, [disease])

  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value })
    // Clear error when user types
    if (errors[name]) {
      setErrors({ ...errors, [name]: null })
    }
  }

  const validate = () => {
    const newErrors = {}
    fields.forEach(field => {
      if (field.required && !formData[field.name]) {
        newErrors[field.name] = `${field.label} is required`
      }
      if (field.type === 'number') {
        const numValue = parseFloat(formData[field.name])
        if (isNaN(numValue)) {
          newErrors[field.name] = `${field.label} must be a number`
        } else if (field.min !== undefined && numValue < field.min) {
          newErrors[field.name] = `${field.label} must be at least ${field.min}`
        } else if (field.max !== undefined && numValue > field.max) {
          newErrors[field.name] = `${field.label} must be at most ${field.max}`
        }
      }
    })
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      // Convert form data to API format
      const apiData = { ...formData }
      
      // Convert string booleans to actual booleans
      fields.forEach(field => {
        if (field.type === 'select') {
          const options = field.options
          if (options.includes('Yes') || options.includes('No')) {
            apiData[field.name] = formData[field.name] === 'Yes'
          }
        }
      })

      const endpoint = disease === 'diabetes' 
        ? '/api/v1/predictions/diabetes'
        : '/api/v1/predictions/heart_disease'

      const response = await api.post(endpoint, apiData)
      
      // Save prediction to localStorage as backup
      localStorage.setItem('lastPrediction', JSON.stringify(response.data))
      
      // Navigate to results with the prediction data
      navigate('/results', { 
        state: { 
          prediction: response.data, 
          disease,
          patientName: patientName || 'Patient',
          inputData: formData
        } 
      })
    } catch (error) {
      console.error('Prediction error:', error)
      setErrors({ submit: 'Failed to make prediction. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 mb-4">
            <Icon className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">{diseaseName} Risk Assessment</h1>
          <p className="text-slate-400">Please enter the clinical information below</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-8">
          {/* Patient Name */}
          <div className="mb-6">
            <label className="block text-slate-300 text-sm font-medium mb-2">Patient Name (Optional)</label>
            <input
              type="text"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
              placeholder="Enter patient name"
            />
          </div>

          {/* Form Fields */}
          <div className="grid md:grid-cols-2 gap-6">
            {fields.map((field, index) => (
              <motion.div
                key={field.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  {field.label}
                  {field.required && <span className="text-red-400 ml-1">*</span>}
                </label>
                
                {field.type === 'select' ? (
                  <select
                    value={formData[field.name] || ''}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                  >
                    {field.options.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="number"
                    value={formData[field.name] || ''}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    min={field.min}
                    max={field.max}
                    step={field.step || 1}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                  />
                )}
                
                {errors[field.name] && (
                  <p className="text-red-400 text-xs mt-1">{errors[field.name]}</p>
                )}
              </motion.div>
            ))}
          </div>

          {errors.submit && (
            <div className="mt-4 bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-300 text-sm">
              {errors.submit}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between mt-8">
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/select-disease')}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </motion.button>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold py-3 px-8 rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Get Prediction <ArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
