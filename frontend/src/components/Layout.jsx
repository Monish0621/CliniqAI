import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  LayoutDashboard, Activity, Heart, Users, Shield, 
  LogOut, Menu, X, Bell, ChevronDown 
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/select-disease', icon: Activity, label: 'New Assessment' },
    { path: '/compare-patients', icon: Users, label: 'Compare Patients' },
    { path: '/model-transparency', icon: Shield, label: 'Model Info' },
  ]

  return (
    <div className="min-h-screen flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-slate-900/50 backdrop-blur-xl border-r border-slate-800">
        {/* Logo */}
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">CliniqAI</h1>
              <p className="text-xs text-slate-400">AI Doctor's Opinion</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-slate-800">
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800/50 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-semibold">
                {user?.username?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 text-left">
                <p className="text-white font-medium text-sm">{user?.full_name || user?.username}</p>
                <p className="text-slate-400 text-xs capitalize">{user?.role}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute bottom-full left-0 right-0 mb-2 bg-slate-800 rounded-xl border border-slate-700 overflow-hidden"
                >
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-slate-700/50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -100 }}
              animate={{ x: 0 }}
              exit={{ x: -100 }}
              className="lg:hidden fixed top-0 left-0 bottom-0 w-64 bg-slate-900 z-50"
            >
              <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                    <Heart className="w-5 h-5 text-white" />
                  </div>
                  <h1 className="text-lg font-bold text-white">CliniqAI</h1>
                </div>
                <button onClick={() => setSidebarOpen(false)}>
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>
              <nav className="p-4 space-y-2">
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-500/30'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                      }`
                    }
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </NavLink>
                ))}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-slate-800/50 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Sign Out</span>
                </button>
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header - Mobile */}
        <header className="lg:hidden flex items-center justify-between p-4 bg-slate-900/50 backdrop-blur-xl border-b border-slate-800">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)}>
              <Menu className="w-6 h-6 text-white" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <Heart className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-lg font-bold text-white">CliniqAI</h1>
            </div>
          </div>
          <button className="relative">
            <Bell className="w-5 h-5 text-slate-400" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-cyan-500 rounded-full" />
          </button>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
