import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { Heart, Mail, Lock, ArrowRight, Sparkles, Eye, EyeOff } from 'lucide-react'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [focusedField, setFocusedField] = useState(null)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(username, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div animate={{ x: [0, 30, 0], y: [0, -30, 0], scale: [1, 1.2, 1] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} className="orb orb-1" />
        <motion.div animate={{ x: [0, -40, 0], y: [0, 40, 0], scale: [1, 1.3, 1] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }} className="orb orb-2" />
        <motion.div animate={{ x: [0, 20, 0], y: [0, -20, 0], scale: [1, 1.1, 1] }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }} className="orb orb-3" />
      </div>

      <motion.div initial={{ opacity: 0, y: 30, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.5, ease: "easeOut" }} className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 200, damping: 15 }} className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-600 mb-4 shadow-lg shadow-cyan-500/30">
            <motion.div animate={{ scale: [1, 1.1, 1], filter: ['brightness(1)', 'brightness(1.3)', 'brightness(1)'] }} transition={{ duration: 2, repeat: Infinity }}>
              <Heart className="w-10 h-10 text-white" />
            </motion.div>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-4xl font-bold gradient-text">CliniqAI</motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-slate-400 mt-2 flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            AI Doctor's Second Opinion
            <Sparkles className="w-4 h-4 text-cyan-400" />
          </motion.p>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-3xl p-8 card-shine">
          <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-2xl font-semibold text-white mb-6 text-center">Welcome Back</motion.h2>
          
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -10, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, y: -10, height: 0 }} className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 mb-4 text-red-300 text-sm">
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>{error}</motion.span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4 text-cyan-400" />
                Username
              </label>
              <div className="relative">
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} onFocus={() => setFocusedField('username')} onBlur={() => setFocusedField(null)} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-all input-glow" placeholder="Enter your username" required />
                <motion.div initial={{ scale: 0 }} animate={{ scale: focusedField === 'username' ? 1 : 0 }} className="absolute left-3 top-1/2 -translate-y-1/2">
                  <Mail className="w-5 h-5 text-cyan-400" />
                </motion.div>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2 flex items-center gap-2">
                <Lock className="w-4 h-4 text-purple-400" />
                Password
              </label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} onFocus={() => setFocusedField('password')} onBlur={() => setFocusedField(null)} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3.5 pl-11 pr-12 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-all input-glow" placeholder="Enter your password" required />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <motion.button type="button" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </motion.button>
              </div>
            </div>

            <motion.button whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(6, 182, 212, 0.4)" }} whileTap={{ scale: 0.98 }} type="submit" disabled={loading} className="w-full bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-2 hover:from-cyan-600 hover:via-blue-700 hover:to-purple-700 transition-all shadow-lg shadow-cyan-500/25 relative overflow-hidden group">
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-white/20 group-hover:animate-shimmer" />
              {loading ? (
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full" />
              ) : (
                <span className="relative z-10 flex items-center gap-2">Sign In <ArrowRight className="w-5 h-5" /></span>
              )}
            </motion.button>
          </form>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-center text-slate-400 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-cyan-400 hover:text-cyan-300 font-medium inline-flex items-center gap-1 hover:gap-2 transition-all">
              Register here
              <motion.span animate={{ x: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>→</motion.span>
            </Link>
          </motion.p>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="flex justify-center mt-6 gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div key={i} animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }} className="w-2 h-2 rounded-full bg-cyan-400" />
          ))}
        </motion.div>
      </motion.div>
    </div>
  )
}
