import { useEffect, useRef, useState } from 'react'
import { useApp } from '../context/AppContext'
import { supabase } from '../lib/supabase'
import FaceIDScreen from './FaceIDScreen'

const CHART_DATA = [28, 45, 32, 67, 55, 80, 42]
const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

export default function Profile() {
  const { 
    user, ecoCoins, totalScans, recentScans, logout, setUser, t, 
    theme, toggleTheme, faceVerified, setFaceVerified,
    notificationsEnabled, setNotificationsEnabled
  } = useApp()
  const avatarRef = useRef(null)
  const fileInputRef = useRef(null)
  const [isEditing, setIsEditing] = useState(false)
  const [showFaceScan, setShowFaceScan] = useState(false)
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

  // Calculate real-time weekly activity
  const getWeeklyActivity = () => {
    const days = [0, 0, 0, 0, 0, 0, 0]; // Mon to Sun
    const now = new Date();
    
    recentScans.forEach(scan => {
      const scanDate = new Date(scan.created_at);
      // Only count scans from the last 7 days
      if (now - scanDate < 7 * 24 * 60 * 60 * 1000) {
        let dayIndex = scanDate.getDay() - 1; // getDay() is 0 for Sun
        if (dayIndex < 0) dayIndex = 6; // Sunday
        days[dayIndex]++;
      }
    });
    return days;
  };

  const weeklyData = getWeeklyActivity();
  const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  const SETTINGS = [
    { icon: '🔔', label: 'notifications',     val: notificationsEnabled, action: () => setNotificationsEnabled(!notificationsEnabled) },
    { icon: '👤', label: 'Face ID Login',      val: faceVerified, action: () => setShowFaceScan(true) },
    { icon: '🛠️', label: 'Face Recognition Debug', val: false, action: () => { 
      window.dispatchEvent(new CustomEvent('changeTab', { detail: 'face-debug' }));
    }},
    { icon: theme === 'dark' ? '🌙' : '☀️', label: 'darkMode', val: theme === 'dark', action: toggleTheme },
    { icon: '📍', label: 'Location Services', val: true, action: null },
  ]

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

  const getUserInitials = () => {
    if (!user?.name) return '?'
    const parts = user.name.split(' ')
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
    return user.name.substring(0, 2).toUpperCase()
  }

  const handleSaveProfile = async () => {
    if (!user?.uid) return
    setUploading(true)
    try {
      const { error } = await supabase.from('users').update(formData).eq('uid', user.uid)
      if (error) throw error
      
      const updated = { ...user, ...formData }
      localStorage.setItem('sb_user', JSON.stringify(updated))
      setUser(updated)
      setIsEditing(false)
      alert('✓ ' + t('profileUpdated'))
    } catch (err) {
      console.error('Update failed:', err)
      alert('❌ ' + t('updateFailed') + ': ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)

    try {
      // Use the centralized utility
      const { uploadToCloudinary } = await import('../utils/cloudinary')
      const uploaded = await uploadToCloudinary(file)
      
      if (uploaded.url) {
        const { error } = await supabase.from('users').update({ photo_url: uploaded.url }).eq('uid', user.uid) 
        if (error) throw error
        
        const updated = { ...user, photo_url: uploaded.url }
        localStorage.setItem('sb_user', JSON.stringify(updated))
        setUser(updated)
        alert('✓ Photo Updated!')
      }
    } catch (err) {
      console.error('Photo upload failed:', err)
      alert('❌ Photo upload failed: ' + err.message)
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
          style={{ color: isEditing ? 'var(--green)' : 'inherit', border: isEditing ? '1px solid var(--green)' : '1px solid var(--border)' }}
        >
          {isEditing ? '✓' : '✎'}
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
          <div className="avatar-img" style={{ overflow: 'hidden', background: 'var(--card-dark)', border: '2px solid var(--yellow)' }}>
            {uploading ? '...' : user?.photo_url?.startsWith('http') ? 
              <img src={user.photo_url} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : 
              <span style={{ fontSize: 32, fontFamily: 'var(--font-display)', color: 'var(--yellow)' }}>{getUserInitials()}</span>
            }
          </div>
          <div style={{ 
            position: 'absolute', bottom: 4, right: 4, 
            background: 'var(--yellow)', borderRadius: '50%', width: 24, height: 24,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12,
            border: '2px solid var(--bg)', color: 'var(--bg)', boxShadow: '0 2px 8px rgba(0,0,0,0.4)'
          }}>📸</div>
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
            {user?.name?.toUpperCase() || t('guestUser')}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--orange)', textTransform: 'uppercase', letterSpacing: 2, marginTop: 4 }}>
            {t('ecoWarrior')}   {t('level')} {user?.level || 1}
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
                <label style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t('dob')}</label>
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
                <div className="stat-num">{(user?.co2_saved || (totalScans * 0.4)).toFixed(1)}kg</div>
                <div className="stat-lbl">{t('co2Saved')}</div>
              </div>
            </div>
          </div>

          {/* Activity Chart */}
          <div className="section-label px">{t('weeklyActivity')}</div>
          <div className="px card-enter" style={{ marginBottom: 16 }}>
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 70 }}>
                {weeklyData.map((v, i) => {
                  const maxVal = Math.max(...weeklyData, 5);
                  return (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' }}>
                      <div
                        className="bar-col"
                        style={{
                          width: '100%',
                          height: `${(v / maxVal) * 60}px`,
                          background: v > 0 ? 'var(--yellow)' : 'rgba(255,255,255,0.05)',
                          animationDelay: `${0.4 + i * 0.06}s`,
                          minHeight: v > 0 ? 4 : 0
                        }}
                      />
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)' }}>{DAY_LABELS[i]}</div>
                    </div>
                  )
                })}
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
                className={`toggle ${s.val ? 'on' : ''}`}
                onClick={() => s.action?.()}
              >
                <div className="toggle-thumb" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Face Scan Screen Overlay */}
      {showFaceScan && (
        <FaceIDScreen 
          onClose={() => setShowFaceScan(false)} 
          onSuccess={(url) => {
            setFaceVerified(true);
            setShowFaceScan(false);
          }}
        />
      )}

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
            {t('logout')}
        </button>
      </div>
    </div>
  )
}
