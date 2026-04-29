import { useState } from 'react'
import { useApp } from '../context/AppContext'
import ParticlesBg from '../components/ParticlesBg'

export default function Auth() {
  const { login, register, loading } = useApp()
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      if (isLogin) {
        await login(email, password)
      } else {
        await register(name, email, password)
      }
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', width: '100vw' }}>
      <div className="phone-shell" style={{ padding: '40px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <ParticlesBg />
        <div className="texture" />

        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 48, letterSpacing: 8, color: 'var(--white)' }}>
            SMART<span style={{ background: 'var(--yellow)', color: 'var(--bg)', padding: '0 8px' }}>BIN</span>
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: 4, marginTop: 8, textTransform: 'uppercase' }}>
            AI Waste Management
          </div>
        </div>

        <div className="card" style={{ padding: 24, background: 'rgba(37,37,35,0.8)', backdropFilter: 'blur(10px)' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, marginBottom: 20, color: 'var(--white)', letterSpacing: 2 }}>
            {isLogin ? 'SIGN IN' : 'CREATE ACCOUNT'}
          </h2>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {!isLogin && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ background: '#2A2A28', border: '1px solid #444', borderRadius: 8, padding: 12, color: 'var(--white)', fontFamily: 'var(--font-mono)' }}
                  placeholder="John Doe"
                  required
                />
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ background: '#2A2A28', border: '1px solid #444', borderRadius: 8, padding: 12, color: 'var(--white)', fontFamily: 'var(--font-mono)' }}
                placeholder="eco@warrior.com"
                required
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ background: '#2A2A28', border: '1px solid #444', borderRadius: 8, padding: 12, color: 'var(--white)', fontFamily: 'var(--font-mono)' }}
                placeholder="••••••••"
                required
              />
            </div>

            {error && <div style={{ color: '#E74C3C', fontSize: 12, fontFamily: 'var(--font-mono)', textAlign: 'center' }}>{error}</div>}

            <button
              type="submit"
              disabled={loading}
              className="scan-btn"
              style={{ marginTop: 8 }}
            >
              {loading ? 'PROCESSING...' : isLogin ? 'SIGN IN' : 'SIGN UP'}
            </button>
          </form>

          <div style={{ marginTop: 20, textAlign: 'center' }}>
            <button
              onClick={() => setIsLogin(!isLogin)}
              style={{ background: 'none', border: 'none', color: 'var(--yellow)', fontFamily: 'var(--font-mono)', fontSize: 12, cursor: 'pointer' }}
            >
              {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
