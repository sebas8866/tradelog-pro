'use client'

import './globals.css'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  email: string
  createdAt: string
}

export default function Home() {
  const router = useRouter()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [authError, setAuthError] = useState('')
  const [authSuccess, setAuthSuccess] = useState('')

  // Check for existing session on load
  useEffect(() => {
    const currentUser = localStorage.getItem('tradelog_current_user')
    if (currentUser) {
      const user = JSON.parse(currentUser)
      setIsLoggedIn(true)
      setUserEmail(user.email)
    }
  }, [])

  const handleGetStarted = () => {
    setAuthMode('signup')
    setAuthError('')
    setAuthSuccess('')
    setShowAuthModal(true)
  }

  const handleSignIn = () => {
    setAuthMode('signin')
    setAuthError('')
    setAuthSuccess('')
    setShowAuthModal(true)
  }

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError('')
    setAuthSuccess('')

    // Validation
    if (!validateEmail(email)) {
      setAuthError('Please enter a valid email address')
      return
    }

    if (password.length < 6) {
      setAuthError('Password must be at least 6 characters')
      return
    }

    if (authMode === 'signup') {
      // Check if user already exists
      const existingUsers = JSON.parse(localStorage.getItem('tradelog_users') || '[]')
      const userExists = existingUsers.find((u: User) => u.email === email)
      
      if (userExists) {
        setAuthError('An account with this email already exists. Please sign in.')
        return
      }

      if (password !== confirmPassword) {
        setAuthError('Passwords do not match')
        return
      }

      // Create new user
      const newUser: User = {
        email,
        createdAt: new Date().toISOString()
      }
      
      // Save user to users list
      existingUsers.push(newUser)
      localStorage.setItem('tradelog_users', JSON.stringify(existingUsers))
      
      // Save password (in real app, this would be hashed)
      localStorage.setItem(`tradelog_password_${email}`, password)
      
      // Set current session
      localStorage.setItem('tradelog_current_user', JSON.stringify(newUser))
      
      setIsLoggedIn(true)
      setUserEmail(email)
      setShowAuthModal(false)
      setEmail('')
      setPassword('')
      setConfirmPassword('')
      
      // Redirect to dashboard
      router.push('/dashboard')
    } else {
      // Sign in
      const existingUsers = JSON.parse(localStorage.getItem('tradelog_users') || '[]')
      const user = existingUsers.find((u: User) => u.email === email)
      
      if (!user) {
        setAuthError('No account found with this email. Please sign up.')
        return
      }

      const storedPassword = localStorage.getItem(`tradelog_password_${email}`)
      if (storedPassword !== password) {
        setAuthError('Incorrect password. Please try again.')
        return
      }

      // Set current session
      localStorage.setItem('tradelog_current_user', JSON.stringify(user))
      
      setIsLoggedIn(true)
      setUserEmail(email)
      setShowAuthModal(false)
      setEmail('')
      setPassword('')
      
      // Redirect to dashboard
      router.push('/dashboard')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('tradelog_current_user')
    setIsLoggedIn(false)
    setUserEmail('')
    router.push('/')
  }

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(120,119,198,0.3),rgba(0,0,0,0))] pointer-events-none" />
      
      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#111] border border-white/10 rounded-2xl p-8 max-w-md w-full relative">
            <h2 className="text-2xl font-bold mb-2">
              {authMode === 'signup' ? 'Create your account' : 'Welcome back'}
            </h2>
            
            <p className="text-gray-400 mb-6">
              {authMode === 'signup' 
                ? 'Start your free 14-day trial today' 
                : 'Sign in to access your dashboard'}
            </p>

            {authError && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                {authError}
              </div>
            )}

            {authSuccess && (
              <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-sm">
                {authSuccess}
              </div>
            )}
            
            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Email</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-indigo-500 transition-colors text-white"
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Password</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-indigo-500 transition-colors text-white"
                  placeholder="••••••••"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters</p>
              </div>

              {authMode === 'signup' && (
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Confirm Password</label>
                  <input 
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-indigo-500 transition-colors text-white"
                    placeholder="••••••••"
                    required
                  />
                </div>
              )}
              
              <button 
                type="submit"
                className="w-full bg-white text-black px-4 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
              >
                {authMode === 'signup' ? 'Start Free Trial' : 'Sign In'}
              </button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-gray-400 text-sm">
                {authMode === 'signup' ? 'Already have an account?' : "Don't have an account?"}
                <button 
                  onClick={() => {
                    setAuthMode(authMode === 'signup' ? 'signin' : 'signup')
                    setAuthError('')
                    setAuthSuccess('')
                  }}
                  className="text-indigo-400 ml-1 hover:underline"
                >
                  {authMode === 'signup' ? 'Sign in' : 'Sign up'}
                </button>
              </p>
            </div>
            
            <button 
              onClick={() => {
                setShowAuthModal(false)
                setAuthError('')
                setAuthSuccess('')
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
      
      {/* Navigation */}
      <nav className="relative z-50 border-b border-white/10 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div 
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => router.push('/')}
          >
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span className="font-semibold text-lg tracking-tight">TradeLog</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-400">
            <button onClick={() => scrollToSection('features')} className="hover:text-white transition-colors">Features</button>
            <button onClick={() => scrollToSection('pricing')} className="hover:text-white transition-colors">Pricing</button>
            <button onClick={() => scrollToSection('testimonials')} className="hover:text-white transition-colors">Testimonials</button>
          </div>
          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <>
                <span className="text-sm text-gray-400 hidden sm:block">{userEmail}</span>
                <button 
                  onClick={handleLogout}
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Logout
                </button>
                <button 
                  onClick={() => router.push('/dashboard')}
                  className="bg-white text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  Dashboard
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={handleSignIn}
                  className="hidden sm:block text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Sign in
                </button>
                <button 
                  onClick={handleGetStarted}
                  className="bg-white text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-6">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm mb-8">
            <span className="flex h-2 w-2 rounded-full bg-indigo-400 animate-pulse"></span>
            Now with AI-powered insights
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
            <span className="bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
              Turn your trading
            </span>
            <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              into a system
            </span>
          </h1>

          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            The journal that actually makes you money. Track every trade, analyze your edge, and discover 
            the patterns that separate profitable traders from the rest.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={handleGetStarted}
              className="w-full sm:w-auto bg-white text-black px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-200 transition-all hover:scale-105"
            >
              Start free trial
            </button>
            <button 
              onClick={() => scrollToSection('features')}
              className="w-full sm:w-auto px-8 py-4 rounded-xl text-lg font-medium border border-white/20 hover:bg-white/5 transition-all"
            >
              See how it works
            </button>
          </div>

          <p className="mt-6 text-sm text-gray-500">
            Free 14-day trial • No credit card required • Cancel anytime
          </p>
        </div>

        {/* Dashboard Preview - Now Clickable */}
        <div 
          className="max-w-6xl mx-auto mt-20 px-4 cursor-pointer hover:scale-[1.02] transition-transform"
          onClick={() => router.push('/dashboard')}
        >
          <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#111] shadow-2xl shadow-indigo-500/10">
            {/* Browser chrome */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-[#0a0a0a]">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <div className="flex-1 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/5 text-xs text-gray-500">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  app.tradelog.pro/dashboard
                </div>
              </div>
            </div>

            {/* Dashboard content */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Stats cards */}
              <div className="col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-sm text-gray-500 mb-1">Total P&L</p>
                  <p className="text-2xl font-bold text-emerald-400">+$12,450</p>
                  <p className="text-xs text-emerald-400/70 mt-1">+24.5% this month</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-sm text-gray-500 mb-1">Win Rate</p>
                  <p className="text-2xl font-bold text-white">68.4%</p>
                  <p className="text-xs text-gray-500 mt-1">41 winning trades</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-sm text-gray-500 mb-1">Profit Factor</p>
                  <p className="text-2xl font-bold text-white">2.4</p>
                  <p className="text-xs text-gray-500 mt-1">Risk adjusted</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-sm text-gray-500 mb-1">Best Setup</p>
                  <p className="text-2xl font-bold text-indigo-400">Breakout</p>
                  <p className="text-xs text-indigo-400/70 mt-1">78% win rate</p>
                </div>
              </div>

              {/* Chart area */}
              <div className="col-span-2 p-5 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium">Equity Curve</h3>
                  <div className="flex gap-2">
                    <span className="px-2 py-1 rounded text-xs bg-white/10">7D</span>
                    <span className="px-2 py-1 rounded text-xs bg-indigo-500/20 text-indigo-300">30D</span>
                    <span className="px-2 py-1 rounded text-xs bg-white/10">90D</span>
                  </div>
                </div>
                <div className="h-40 flex items-end gap-1">
                  {[40, 45, 42, 48, 55, 52, 58, 65, 62, 68, 75, 72, 78, 85, 82, 88, 95, 92, 98, 105].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-gradient-to-t from-indigo-500/20 to-indigo-400/40 rounded-t"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
              </div>

              {/* Setup performance */}
              <div className="p-5 rounded-xl bg-white/5 border border-white/10">
                <h3 className="font-medium mb-4">Setup Performance</h3>
                <div className="space-y-3">
                  {[
                    { name: 'Breakout', winRate: 78, profit: '+$8,240' },
                    { name: 'Pullback', winRate: 62, profit: '+$3,120' },
                    { name: 'Reversal', winRate: 45, profit: '-$910' },
                  ].map((setup) => (
                    <div key={setup.name} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{setup.name}</p>
                        <div className="w-24 h-1.5 bg-white/10 rounded-full mt-1">
                          <div
                            className="h-full bg-indigo-400 rounded-full"
                            style={{ width: `${setup.winRate}%` }}
                          />
                        </div>
                      </div>
                      <span className={`text-sm font-medium ${setup.profit.startsWith('+') ? 'text-emerald-400' : 'text-red-400'}`}>
                        {setup.profit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Logo cloud */}
      <section className="border-y border-white/10 bg-white/5">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <p className="text-center text-sm text-gray-500 mb-8">
            Trusted by traders at
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50">
            {['Jane Street', 'Citadel', 'Two Sigma', 'Jump Trading', 'DRW'].map((company) => (
              <span key={company} className="text-lg font-semibold text-gray-400">
                {company}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-32 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Everything you need to
              <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent"> trade better</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              No more guessing. No more spreadsheets. Just clear insights into what works.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: 'Pattern Recognition',
                desc: 'Our AI analyzes thousands of your trades to find hidden patterns in your winners and losers.',
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                ),
              },
              {
                title: 'Psychology Tracking',
                desc: 'Log your emotional state and discover how mindset correlates with your trading performance.',
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                ),
              },
              {
                title: 'Setup Analytics',
                desc: 'Know exactly which setups are profitable for you. Double down on winners, eliminate losers.',
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                  </svg>
                ),
              },
              {
                title: 'Risk Management',
                desc: "Track your R-multiples and ensure you're risking the right amount on every trade.",
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                ),
              },
              {
                title: 'Tax Reporting',
                desc: 'One-click exports for your accountant. P&L statements, trade history, and more.',
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                ),
              },
              {
                title: 'Real-time Alerts',
                desc: "Get notified when you break your rules or when your edge starts to deteriorate.",
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                ),
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group p-6 rounded-2xl bg-white/[0.02] border border-white/10 hover:bg-white/[0.04] hover:border-white/20 transition-all duration-300 cursor-pointer"
                onClick={handleGetStarted}
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-32 px-6 border-y border-white/10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Loved by profitable traders
            </h2>
            <p className="text-gray-400">
              Join thousands who've transformed their trading with data-driven insights.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                quote: "I discovered I was overtrading on Mondays. Cut those out and my monthly P&L jumped 40%.",
                author: "Marcus Chen",
                role: "Day Trader, $2M+ profit",
                avatar: "MC",
              },
              {
                quote: "The pattern recognition found that my breakout setups work 3x better after 10 AM. Game changer.",
                author: "Sarah Williams",
                role: "Swing Trader, 5 years",
                avatar: "SW",
              },
              {
                quote: "Finally understand my edge. TradeLog showed me exactly which strategies to scale and which to drop.",
                author: "David Park",
                role: "Options Trader",
                avatar: "DP",
              },
            ].map((testimonial, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 hover:bg-white/[0.04] transition-colors cursor-pointer"
                onClick={handleGetStarted}
              >
                <p className="text-gray-300 mb-6 leading-relaxed">&ldquo;{testimonial.quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-medium">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-medium">{testimonial.author}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-gray-400 text-lg">
              Start free. Upgrade when you're ready.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free */}
            <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/10 hover:bg-white/[0.04] transition-colors">
              <h3 className="text-xl font-semibold mb-2">Starter</h3>
              <p className="text-gray-400 mb-6">Perfect for getting started</p>
              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-5xl font-bold">$0</span>
                <span className="text-gray-500">/month</span>
              </div>
              <ul className="space-y-4 mb-8">
                {[
                  '100 trades/month',
                  'Basic analytics',
                  'Manual trade entry',
                  'Email support',
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-gray-300">
                    <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <button 
                onClick={handleGetStarted}
                className="w-full py-3 rounded-xl border border-white/20 font-medium hover:bg-white/5 transition-colors"
              >
                Get started free
              </button>
            </div>

            {/* Pro */}
            <div className="relative p-8 rounded-2xl bg-gradient-to-b from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 hover:from-indigo-500/20 hover:to-purple-500/20 transition-all">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="px-3 py-1 rounded-full bg-indigo-500 text-sm font-medium">
                  Most Popular
                </span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Professional</h3>
              <p className="text-gray-400 mb-6">For serious traders</p>
              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-5xl font-bold">$29</span>
                <span className="text-gray-500">/month</span>
              </div>
              <ul className="space-y-4 mb-8">
                {[
                  'Unlimited trades',
                  'AI pattern recognition',
                  'Psychology tracking',
                  'Advanced analytics',
                  'API access',
                  'Priority support',
                  'Tax reporting',
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-gray-300">
                    <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <button 
                onClick={handleGetStarted}
                className="w-full py-3 rounded-xl bg-white text-black font-medium hover:bg-gray-200 transition-colors"
              >
                Start 14-day trial
              </button>
            </div>
          </div>

          <p className="text-center text-gray-500 mt-8">
            Or get lifetime access for a one-time payment of $199.{" "}
            <button 
              onClick={handleGetStarted}
              className="text-indigo-400 hover:underline"
            >
              Learn more
            </button>
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 via-purple-500/5 to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Stop trading blind.
            <br />
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Start trading smart.
            </span>
          </h2>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            Join 10,000+ traders who've discovered their edge with TradeLog. 
            Your first 100 trades are free.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={handleGetStarted}
              className="w-full sm:w-auto bg-white text-black px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-200 transition-all hover:scale-105"
            >
              Create free account
            </button>
            <button 
              onClick={() => scrollToSection('features')}
              className="w-full sm:w-auto px-8 py-4 rounded-xl text-lg font-medium border border-white/20 hover:bg-white/5 transition-all"
            >
              See live demo
            </button>
          </div>
          <p className="mt-6 text-sm text-gray-500">
            No credit card required • Set up in 2 minutes • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div 
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => router.push('/')}
            >
              <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <span className="font-semibold text-lg">TradeLog</span>
            </div>
            <div className="flex gap-8 text-sm text-gray-400">
              <button onClick={() => scrollToSection('features')} className="hover:text-white transition-colors">Features</button>
              <button onClick={() => scrollToSection('pricing')} className="hover:text-white transition-colors">Pricing</button>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Twitter</a>
            </div>
          </div>
          <p className="mt-8 text-sm text-gray-600">
            © 2026 TradeLog. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  )
}