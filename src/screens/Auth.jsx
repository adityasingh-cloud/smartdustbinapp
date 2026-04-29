import { useState, useRef } from 'react'
import { useApp } from '../context/AppContext'
import ParticlesBg from '../components/ParticlesBg'
import FaceIDScreen from './FaceIDScreen'

export default function Auth() {
  const { login, register, loading, setUser } = useApp()
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [state, setState] = useState('')
  const [city, setCity] = useState('')
  const [pincode, setPincode] = useState('')
  const [dob, setDob] = useState('')
  const [error, setError] = useState('')
  
  const [showFaceScan, setShowFaceScan] = useState(false)
  const [faceMode, setFaceMode] = useState('setup') // 'setup' | 'login'
  const [pendingUser, setPendingUser] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      if (isLogin) {
        await login(email, password)
      } else {
        const newUser = await register(name, email, password, { phone, state, city, pincode, dob })
        setPendingUser(newUser)
        setFaceMode('setup')
        setShowFaceScan(true)
      }
    } catch (err) {
      setError(err.message)
    }
  }

  const handleFaceSuccess = (photoUrl) => {
    if (pendingUser) {
      const finalUser = { ...pendingUser, photo_url: photoUrl, face_id_enabled: true }
      localStorage.setItem('sb_user', JSON.stringify(finalUser))
      setUser(finalUser)
    }
    setShowFaceScan(false)
  }

  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', width: '100vw' }}>
      <div className="phone-shell" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        <ParticlesBg />
        <div className="texture" />

        <div style={{ textAlign: 'center', marginBottom: 20, marginTop: 40 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 40, letterSpacing: 6, color: 'var(--text-light)' }}>
            SMART<span style={{ background: 'var(--yellow)', color: 'var(--bg)', padding: '0 8px' }}>BIN</span> <span style={{ fontSize: 10, opacity: 0.5 }}>v2.8</span>
          </div>
        </div>

        <div className="card" style={{ padding: 20, background: 'rgba(37,37,35,0.8)', backdropFilter: 'blur(10px)', marginBottom: 40 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 16, color: 'var(--text-light)', letterSpacing: 2 }}>
            {isLogin ? 'SIGN IN' : 'CREATE ACCOUNT'}
          </h2>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {!isLogin && (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Full Name</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} style={{ background: '#2A2A28', border: '1px solid #444', borderRadius: 6, padding: 10, color: '#fff', fontSize: 13 }} placeholder="John Doe" required />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Phone Number</label>
                  <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} style={{ background: '#2A2A28', border: '1px solid #444', borderRadius: 6, padding: 10, color: '#fff', fontSize: 13 }} placeholder="+91..." required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <label style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase' }}>State</label>
                    <input type="text" value={state} onChange={(e) => setState(e.target.value)} style={{ background: '#2A2A28', border: '1px solid #444', borderRadius: 6, padding: 10, color: '#fff', fontSize: 13 }} placeholder="State" required />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <label style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase' }}>City</label>
                    <input type="text" value={city} onChange={(e) => setCity(e.target.value)} style={{ background: '#2A2A28', border: '1px solid #444', borderRadius: 6, padding: 10, color: '#fff', fontSize: 13 }} placeholder="City" required />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <label style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Pincode</label>
                    <input type="text" value={pincode} onChange={(e) => setPincode(e.target.value)} style={{ background: '#2A2A28', border: '1px solid #444', borderRadius: 6, padding: 10, color: '#fff', fontSize: 13 }} placeholder="110001" required />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <label style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase' }}>DOB</label>
                    <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} style={{ background: '#2A2A28', border: '1px solid #444', borderRadius: 6, padding: 10, color: '#fff', fontSize: 13 }} required />
                  </div>
                </div>
              </>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Email Address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ background: '#2A2A28', border: '1px solid #444', borderRadius: 6, padding: 10, color: '#fff', fontSize: 13 }} placeholder="eco@warrior.com" required />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ background: '#2A2A28', border: '1px solid #444', borderRadius: 6, padding: 10, color: '#fff', fontSize: 13 }} placeholder="        " required />
            </div>

            {error && <div style={{ color: '#E74C3C', fontSize: 11, fontFamily: 'var(--font-mono)', textAlign: 'center' }}>{error}</div>}

            <button type="submit" disabled={loading} className="scan-btn" style={{ marginTop: 8, height: 44, fontSize: 18 }}>
              {loading ? 'PROCESSING...' : isLogin ? 'SIGN IN' : 'SIGN UP'}
            </button>
          </form>

            <button
              onClick={() => {
                setFaceMode('login')
                setShowFaceScan(true)
              }}
              style={{ 
                width: '100%', marginTop: 12, padding: '10px', 
                background: 'transparent', border: '1px solid var(--yellow)', 
                color: 'var(--yellow)', borderRadius: 8, fontFamily: 'var(--font-mono)', fontSize: 10,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
              }}
            >
              SIGN IN WITH FACE ID
            </button>

          <div style={{ marginTop: 20, textAlign: 'center' }}>
            <button
              onClick={() => setIsLogin(!isLogin)}
              style={{ background: 'none', border: 'none', color: 'var(--yellow)', fontFamily: 'var(--font-mono)', fontSize: 11, cursor: 'pointer' }}
            >
              {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
            </button>
          </div>
        </div>

        {showFaceScan && (
          <FaceIDScreen 
            mode={faceMode}
            onClose={() => setShowFaceScan(false)} 
            onSuccess={handleFaceSuccess}
            targetUid={pendingUser?.uid}
          />
        )}
      </div>
    </div>
  )
}
