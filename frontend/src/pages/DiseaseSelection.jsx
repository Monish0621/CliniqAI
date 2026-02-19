import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Activity, Heart, ArrowRight, Shield } from 'lucide-react'

export default function DiseaseSelection() {
  const navigate = useNavigate()

  const handleSelect = (disease) => {
    navigate('/input-form', { state: { disease } })
  }

  const diseases = [
    {
      id: 'diabetes',
      name: 'Diabetes',
      icon: Activity,
      description: 'Predict the risk of Type 2 Diabetes based on clinical indicators',
      features: ['Blood Glucose', 'HbA1c Level', 'BMI', 'Hypertension'],
      color: 'from-emerald-500 to-teal-600',
      bgGlow: 'bg-emerald-500/20'
    },
    {
      id: 'heart_disease',
      name: 'Heart Disease',
      icon: Heart,
      description: 'Assess cardiovascular disease risk using clinical measurements',
      features: ['Blood Pressure', 'Cholesterol', 'Lifestyle Factors', 'BMI'],
      color: 'from-rose-500 to-pink-600',
      bgGlow: 'bg-rose-500/20'
    }
  ]

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold text-white mb-4">Select Assessment Type</h1>
        <p className="text-slate-400 text-lg">Choose a disease to assess risk for</p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl w-full">
        {diseases.map((disease, index) => (
          <motion.button
            key={disease.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSelect(disease.id)}
            className="glass-card rounded-2xl p-8 text-left group relative overflow-hidden"
          >
            {/* Background glow */}
            <div className={`absolute inset-0 ${disease.bgGlow} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
            
            <div className="relative z-10">
              {/* Icon */}
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${disease.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <disease.icon className="w-8 h-8 text-white" />
              </div>

              {/* Content */}
              <h2 className="text-2xl font-bold text-white mb-3">{disease.name}</h2>
              <p className="text-slate-400 mb-6">{disease.description}</p>

              {/* Features */}
              <div className="flex flex-wrap gap-2 mb-6">
                {disease.features.map((feature, i) => (
                  <span 
                    key={i}
                    className="px-3 py-1 bg-slate-800/50 rounded-full text-sm text-slate-300"
                  >
                    {feature}
                  </span>
                ))}
              </div>

              {/* CTA */}
              <div className="flex items-center text-white font-medium group-hover:text-cyan-400 transition-colors">
                <span>Start Assessment</span>
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Info card */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-12 flex items-center gap-3 text-slate-500"
      >
        <Shield className="w-5 h-5" />
        <span>All predictions are based on clinically validated machine learning models</span>
      </motion.div>
    </div>
  )
}
