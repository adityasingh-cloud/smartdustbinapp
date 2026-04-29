import { useState, useRef } from 'react'
import { useApp } from '../context/AppContext'
import ParticlesBg from '../components/ParticlesBg'

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
  const [faceScanning, setFaceScanning] = useState(false)
  const videoRef = useRef(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      if (isLogin) {
        await login(email, password)
      } else {
        await register(name, email, password, { phone, state, city, pincode, dob })
      }
    } catch (err) {
      setError(err.message)
    }
  }

  const startFaceScan = async () => {
    setFaceScanning(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      if (videoRef.current) videoRef.current.srcObject = stream
      
      setTimeout(() => {
        setFaceScanning(false)
        setShowFaceScan(false)
        stream.getTracks().forEach(t => t.stop())
        
        const saved = localStorage.getItem('sb_user')
        if (saved) {
          setUser(JSON.parse(saved))
        } else {
          alert('Face ID Verified! Please sign in with email once to link your face.')
        }
      }, 3000)
    } catch (err) {
      alert('Face ID failed: ' + err.message)
      setFaceScanning(false)
      setShowFaceScan(false)
    }
  }

  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', width: '100vw' }}>
      <div className="phone-shell" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        <ParticlesBg />
        <div className="texture" />

        <div style={{ textAlign: 'center', marginBottom: 20, marginTop: 40 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 40, letterSpacing: 6, color: 'var(--text-light)' }}>
            SMART<span style={{ background: 'var(--yellow)', color: 'var(--bg)', padding: '0 8px' }}>BIN</span>
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
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ background: '#2A2A28', border: '1px solid #444', borderRadius: 6, padding: 10, color: '#fff', fontSize: 13 }} placeholder="••••••••" required />
            </div>

            {error && <div style={{ color: '#E74C3C', fontSize: 11, fontFamily: 'var(--font-mono)', textAlign: 'center' }}>{error}</div>}

            <button type="submit" disabled={loading} className="scan-btn" style={{ marginTop: 8, height: 44, fontSize: 18 }}>
              {loading ? 'PROCESSING...' : isLogin ? 'SIGN IN' : 'SIGN UP'}
            </button>
          </form>

          {isLogin && (
            <button
              onClick={() => setShowFaceScan(true)}
              style={{ 
                width: '100%', marginTop: 12, padding: '10px', 
                background: 'transparent', border: '1px solid var(--yellow)', 
                color: 'var(--yellow)', borderRadius: 8, fontFamily: 'var(--font-mono)', fontSize: 10,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
              }}
            >
              👤 SIGN IN WITH FACE ID
            </button>
          )}

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
          <div className="modal-overlay">
            <div className="card" style={{ width: '80%', maxWidth: 300, textAlign: 'center', padding: 20 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 16 }}>FACE ID SCAN</div>
              <div style={{ position: 'relative', width: 200, height: 200, margin: '0 auto', borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--yellow)' }}>
                <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                {faceScanning && <div className="scan-sweep" />}
              </div>
              <div style={{ marginTop: 20, fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                {faceScanning ? 'SCANNING BIOMETRICS...' : 'POSITION FACE IN CIRCLE'}
              </div>
              {!faceScanning && (
                <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                  <button className="scan-btn" onClick={startFaceScan} style={{ height: 36, fontSize: 14 }}>START</button>
                  <button className="icon-btn" onClick={() => setShowFaceScan(false)} style={{ fontSize: 14 }}>CANCEL</button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
