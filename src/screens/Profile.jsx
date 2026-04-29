import { useEffect, useRef, useState } from 'react'
import { useApp } from '../context/AppContext'
import { supabase } from '../lib/supabase'

const CHART_DATA = [28, 45, 32, 67, 55, 80, 42]
const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

const SETTINGS = [
  { icon: '🔔', label: 'notifications',     val: true  },
  { icon: '🔒', label: 'Face ID Login',      val: true  },
  { icon: '🌙', label: 'darkMode',          val: true  },
  { icon: '📍', label: 'Location Services', val: false },
]

export default function Profile() {
  const { user, ecoCoins, totalScans, logout, redeemCoins, setUser, t } = useApp()
  const avatarRef = useRef(null)
  const fileInputRef = useRef(null)
  const [toggles, setToggles] = useState(SETTINGS.map(s => s.val))
  
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    state: user?.state || '',
    city: user?.city || '',
    pincode: user?.pincode || '',
    dob: user?.dob || ''
  })
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    setFormData({
      name: user?.name || '',
      phone: user?.phone || '',
      email: user?.email || '',
      state: user?.state || '',
      city: user?.city || '',
      pincode: user?.pincode || '',
      dob: user?.dob || ''
    })
  }, [user])

  // 3D parallax tilt
  useEffect(() => {
    const el = avatarRef.current
    if (!el) return
    const handleMove = (e) => {
      const rect = el.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const x = ((e.clientX ?? e.touches?.[0]?.clientX ?? cx) - cx) / (rect.width / 2)
      const y = ((e.clientY ?? e.touches?.[0]?.clientY ?? cy) - cy) / (rect.height / 2)
      const img = el.querySelector('.avatar-img')
      if (img) img.style.transform = `rotateY(${x * 15}deg) rotateX(${-y * 15}deg)`
    }
    const handleLeave = () => {
      const img = el.querySelector('.avatar-img')
      if (img) img.style.transform = 'rotateY(0deg) rotateX(0deg)'
    }
    el.addEventListener('mousemove', handleMove)
    el.addEventListener('touchmove', handleMove)
    el.addEventListener('mouseleave', handleLeave)
    return () => {
      el.removeEventListener('mousemove', handleMove)
      el.removeEventListener('touchmove', handleMove)
      el.removeEventListener('mouseleave', handleLeave)
    }
  }, [])

  const handleSaveProfile = async () => {
    try {
      const { error } = await supabase.from('users').update(formData).eq('uid', user.uid)
      if (error) throw error
      const updated = { ...user, ...formData }
      localStorage.setItem('sb_user', JSON.stringify(updated))
      setUser(updated)
      setIsEditing(false)
      alert(t('profileUpdated'))
    } catch (err) {
      alert(t('updateFailed') + ': ' + err.message)
    }
  }

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', 'Smartbin')
      
      const res = await fetch('https://api.cloudinary.com/v1_1/dc8suuh6h/image/upload', {
        method: 'POST',
        body: formData
      })
      const data = await res.json()
      
      if (data.secure_url) {
        const { error } = await supabase.from('users').update({ phone: data.secure_url }).eq('uid', user.uid) 
        if (error) throw error
        const updated = { ...user, phone: data.secure_url }
        localStorage.setItem('sb_user', JSON.stringify(updated))
        setUser(updated)
      }
    } catch (err) {
      alert('Photo upload failed: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="screen screen-fade">
      {/* Header */}
      <div className="topbar">
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, letterSpacing: 3, color: 'var(--yellow)' }}>{t('me')}</div>
        <button 
          className="icon-btn" 
          onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
          style={{ color: isEditing ? 'var(--green)' : 'inherit' }}
        >
          {isEditing ? '✅' : '✏'}
        </button>
      </div>

      {/* Avatar */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 20px', gap: 12 }}>
        <div 
          className="avatar-wrap" 
          ref={avatarRef} 
          style={{ perspective: 400, cursor: 'pointer' }}
          onClick={() => fileInputRef.current.click()}
        >
          <div className="avatar-ring" />
          <div className="avatar-img" style={{ overflow: 'hidden' }}>
            {uploading ? '⏳' : user?.phone?.startsWith('http') ? <img src={user.phone} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (user?.name?.charAt(0).toUpperCase() || '👤')}
          </div>
          <div style={{ 
            position: 'absolute', bottom: 0, right: 0, 
            background: 'var(--yellow)', borderRadius: '50%', width: 28, height: 28,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
            border: '2px solid var(--bg)', color: 'var(--bg)'
          }}>📷</div>
        </div>
        
        <input 
          type="file" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          accept="image/*" 
          onChange={handlePhotoUpload} 
        />

        <div style={{ textAlign: 'center', width: '100%' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 34, letterSpacing: 2, lineHeight: 1 }}>
            {user?.name?.toUpperCase() || 'GUEST USER'}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--orange)', textTransform: 'uppercase', letterSpacing: 2, marginTop: 4 }}>
            {t('ecoWarrior')} · {t('level')} {user?.level || 1}
          </div>
        </div>
      </div>

      {/* Edit Form / Stats */}
      {isEditing ? (
        <div className="px card-enter" style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t('name')}</label>
              <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 6, color: '#fff', padding: '8px 12px', outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t('phone')}</label>
              <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 6, color: '#fff', padding: '8px 12px', outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t('email')}</label>
              <input type="text" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 6, color: '#fff', padding: '8px 12px', outline: 'none' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t('state')}</label>
                <input type="text" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 6, color: '#fff', padding: '8px 12px', outline: 'none' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t('city')}</label>
                <input type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 6, color: '#fff', padding: '8px 12px', outline: 'none' }} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t('pincode')}</label>
                <input type="text" value={formData.pincode} onChange={e => setFormData({...formData, pincode: e.target.value})} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 6, color: '#fff', padding: '8px 12px', outline: 'none' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase' }}>DOB</label>
                <input type="date" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 6, color: '#fff', padding: '8px 12px', outline: 'none' }} />
              </div>
            </div>
          </div>
          <button onClick={handleSaveProfile} className="scan-btn" style={{ height: 44, fontSize: 18 }}>{t('save')}</button>
          <button onClick={() => setIsEditing(false)} style={{ background: 'transparent', color: 'var(--text-muted)', fontSize: 12, textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>{t('cancel')}</button>
        </div>
      ) : (
        <>
          {/* Stats Row */}
          <div className="px card-enter" style={{ marginBottom: 16 }}>
            <div className="stats-row">
              <div className="stat-cell">
                <div className="stat-num">{totalScans}</div>
                <div className="stat-lbl">{t('totalScans')}</div>
              </div>
              <div className="stat-cell">
                <div className="stat-num">{ecoCoins}</div>
                <div className="stat-lbl">{t('ecoCoins')}</div>
              </div>
              <div className="stat-cell">
                <div className="stat-num">{(user?.co2_saved || 0).toFixed(1)}kg</div>
                <div className="stat-lbl">{t('co2Saved')}</div>
              </div>
            </div>
          </div>

          {/* Activity Chart */}
          <div className="section-label px">{t('recentActivity')}</div>
          <div className="px card-enter" style={{ marginBottom: 16 }}>
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 70 }}>
                {CHART_DATA.map((v, i) => (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' }}>
                    <div
                      className="bar-col"
                      style={{
                        width: '100%',
                        height: `${(v / 80) * 60}px`,
                        background: i === 5 ? 'var(--orange)' : 'var(--yellow)',
                        animationDelay: `${0.4 + i * 0.06}s`,
                      }}
                    />
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)' }}>{DAY_LABELS[i]}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Settings */}
      <div className="section-label px">{t('settings')}</div>
      <div className="px card-enter" style={{ marginBottom: 24 }}>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {SETTINGS.map((s, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '14px 16px',
              borderBottom: i < SETTINGS.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 18 }}>{s.icon}</span>
                <span style={{ fontSize: 13, fontWeight: 500 }}>{t(s.label) || s.label}</span>
              </div>
              <div
                className={`toggle ${toggles[i] ? 'on' : ''}`}
                onClick={() => setToggles(t => t.map((v, idx) => idx === i ? !v : v))}
              >
                <div className="toggle-thumb" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Logout */}
      <div className="px" style={{ marginBottom: 32 }}>
        <button 
          onClick={logout}
          style={{
            width: '100%', padding: '14px',
            background: 'transparent',
            border: '1.5px solid rgba(196,98,45,0.4)',
            borderRadius: 'var(--r-md)',
            color: 'var(--orange)',
            fontFamily: 'var(--font-mono)',
            fontSize: 12, letterSpacing: 2, textTransform: 'uppercase',
            cursor: 'pointer', transition: 'all 0.2s',
          }}
        >
          ↩ {t('logout')}
        </button>
      </div>
    </div>
  )
}
