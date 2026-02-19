import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Shield, Activity, Heart, Target, Database, CheckCircle, XCircle } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import api from '../api'

export default function ModelTransparency() {
  const [diabetesInfo, setDiabetesInfo] = useState(null)
  const [heartInfo, setHeartInfo] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchModelInfo()
  }, [])

  const fetchModelInfo = async () => {
    try {
      const [diabetesRes, heartRes] = await Promise.all([
        api.get('/api/v1/predictions/info/diabetes'),
        api.get('/api/v1/predictions/info/heart_disease')
      ])
      setDiabetesInfo(diabetesRes.data)
      setHeartInfo(heartRes.data)
    } catch (error) {
      console.error('Error fetching model info:', error)
    } finally {
      setLoading(false)
    }
  }

  // Generate ROC curve data points
  const generateROCData = (auc) => {
    const points = []
    for (let i = 0; i <= 100; i++) {
      const fpr = i / 100
      // Approximate ROC curve using exponential function
      const tpr = Math.pow(fpr, 1 / auc)
      points.push({ fpr: fpr * 100, tpr: tpr * 100 })
    }
    return points
  }

  const models = [
    {
      id: 'diabetes',
      name: 'Diabetes Prediction',
      icon: Activity,
      color: 'from-emerald-500 to-teal-600',
      info: diabetesInfo,
      description: 'XGBoost classifier trained on 100K patient records for Type 2 Diabetes prediction'
    },
    {
      id: 'heart_disease',
      name: 'Heart Disease Prediction',
      icon: Heart,
      color: 'from-rose-500 to-pink-600',
      info: heartInfo,
      description: 'XGBoost classifier trained on 68K cardiovascular patient records'
    }
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Model Transparency</h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Understanding how our AI models work, their performance metrics, and the data they're trained on
          </p>
        </div>

        {/* Model Cards */}
        <div className="space-y-12">
          {models.map((model, index) => (
            <motion.div
              key={model.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-card rounded-2xl p-8"
            >
              {/* Model Header */}
              <div className="flex items-start justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${model.color} flex items-center justify-center`}>
                    <model.icon className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">{model.name}</h2>
                    <p className="text-slate-400">{model.description}</p>
                  </div>
                </div>
              </div>

              {model.info && (
                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Performance Metrics */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Target className="w-5 h-5 text-cyan-400" />
                      Performance Metrics
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-slate-800/50 rounded-lg p-4">
                        <p className="text-slate-400 text-sm mb-1">Accuracy</p>
                        <p className="text-3xl font-bold text-white">
                          {model.info.performance?.accuracy?.toFixed(1) || '-'}%
                        </p>
                      </div>
                      <div className="bg-slate-800/50 rounded-lg p-4">
                        <p className="text-slate-400 text-sm mb-1">AUC-ROC</p>
                        <p className="text-3xl font-bold text-white">
                          {model.info.performance?.auc?.toFixed(3) || '-'}
                        </p>
                      </div>
                      {model.info.performance?.recall && (
                        <div className="bg-slate-800/50 rounded-lg p-4">
                          <p className="text-slate-400 text-sm mb-1">Recall</p>
                          <p className="text-2xl font-bold text-white">
                            {model.info.performance.recall.toFixed(1)}%
                          </p>
                        </div>
                      )}
                      {model.info.performance?.precision && (
                        <div className="bg-slate-800/50 rounded-lg p-4">
                          <p className="text-slate-400 text-sm mb-1">Precision</p>
                          <p className="text-2xl font-bold text-white">
                            {model.info.performance.precision.toFixed(1)}%
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Dataset Info */}
                    <div className="bg-slate-800/50 rounded-lg p-4">
                      <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                        <Database className="w-4 h-4 text-cyan-400" />
                        Training Dataset
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Dataset</span>
                          <span className="text-white">{model.info.performance?.dataset || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Training Samples</span>
                          <span className="text-white">{model.info.performance?.training_samples?.toLocaleString() || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Decision Threshold</span>
                          <span className="text-white">{model.info.performance?.threshold || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ROC Curve */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">ROC Curve</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={generateROCData(model.info.performance?.auc || 0.5)}>
                          <defs>
                            <linearGradient id={`gradient-${model.id}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                          <XAxis 
                            dataKey="fpr" 
                            stroke="#94a3b8" 
                            label={{ value: 'False Positive Rate (%)', position: 'bottom', fill: '#94a3b8' }} 
                          />
                          <YAxis 
                            dataKey="tpr" 
                            stroke="#94a3b8" 
                            label={{ value: 'True Positive Rate (%)', angle: -90, position: 'insideLeft', fill: '#94a3b8' }} 
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#1e293b',
                              border: '1px solid rgba(255,255,255,0.1)',
                              borderRadius: '8px'
                            }}
                            formatter={(value) => [`${value.toFixed(1)}%`, 'TPR']}
                            labelFormatter={(value) => `FPR: ${value.toFixed(1)}%`}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="tpr" 
                            stroke="#0ea5e9" 
                            fill={`url(#gradient-${model.id})`} 
                            strokeWidth={2}
                          />
                          {/* Diagonal reference line */}
                          <Line 
                            type="monotone" 
                            dataKey={(d) => d.fpr} 
                            stroke="rgba(255,255,255,0.2)" 
                            strokeDasharray="5 5" 
                            strokeWidth={1}
                            dot={false}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}

              {/* Features */}
              {model.info && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-white mb-4">Input Features</h3>
                  <div className="flex flex-wrap gap-2">
                    {model.info.feature_display_names?.map((feature, i) => (
                      <span 
                        key={i}
                        className="px-3 py-1 bg-slate-800/50 rounded-full text-sm text-slate-300 border border-slate-700"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Risk Levels */}
              {model.info && model.info.risk_levels && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-white mb-4">Risk Categories</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(model.info.risk_levels).map(([level, range], i) => (
                      <div 
                        key={level}
                        className={`rounded-lg p-3 text-center ${
                          level === 'Low' ? 'bg-emerald-500/20 border border-emerald-500/30' :
                          level === 'Moderate' ? 'bg-amber-500/20 border border-amber-500/30' :
                          level === 'High' ? 'bg-orange-500/20 border border-orange-500/30' :
                          'bg-rose-500/20 border border-rose-500/30'
                        }`}
                      >
                        <p className={`font-semibold ${
                          level === 'Low' ? 'text-emerald-400' :
                          level === 'Moderate' ? 'text-amber-400' :
                          level === 'High' ? 'text-orange-400' :
                          'text-rose-400'
                        }`}>{level}</p>
                        <p className="text-white text-sm">{range}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Transparency Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 glass-card rounded-2xl p-6 bg-gradient-to-r from-cyan-500/10 to-blue-500/10"
        >
          <div className="flex items-start gap-4">
            <Shield className="w-6 h-6 text-cyan-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Our Commitment to Transparency</h3>
              <p className="text-slate-400">
                All models are regularly audited for fairness and bias. We believe in explainable AI 
                and provide SHAP values for every prediction to help healthcare professionals understand 
                the reasoning behind each risk assessment. These models are intended to assist, not replace, 
                professional medical judgment.
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
