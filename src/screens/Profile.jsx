import { useEffect, useRef, useState } from 'react'
import { useApp } from '../context/AppContext'
import { supabase } from '../lib/supabase'

const REWARDS = [
  { brand: 'Starbucks',  disc: '20% OFF', expiry: 'Expires May 30', coins: 300, color: '#00704A' },
  { brand: 'Amazon',     disc: '₹150 OFF', expiry: 'Expires Jun 10', coins: 500, color: '#FF9900' },
  { brand: 'Swiggy',    disc: '30% OFF', expiry: 'Expires May 25', coins: 400, color: '#FC8019' },
  { brand: 'BookMyShow',disc: '1 FREE',   expiry: 'Expires Jun 5',  coins: 800, color: '#E03A3A' },
]

const CHART_DATA = [28, 45, 32, 67, 55, 80, 42]
const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

const SETTINGS = [
  { icon: '🔔', label: 'Notifications',     val: true  },
  { icon: '🔒', label: 'Face ID Login',      val: true  },
  { icon: '📡', label: 'Linked Bin SB-042', val: true  },
  { icon: '🌙', label: 'Dark Mode',          val: true  },
  { icon: '📍', label: 'Location Services', val: false },
]

export default function Profile() {
  const { user, ecoCoins, totalScans, logout, redeemCoins, setUser } = useApp()
  const avatarRef = useRef(null)
  const fileInputRef = useRef(null)
  const [toggles, setToggles] = useState(SETTINGS.map(s => s.val))
  
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(user?.name || '')
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    setEditName(user?.name || '')
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
      const { error } = await supabase.from('users').update({ name: editName }).eq('uid', user.uid)
      if (error) throw error
      const updated = { ...user, name: editName }
      localStorage.setItem('sb_user', JSON.stringify(updated))
      setUser(updated)
      setIsEditing(false)
    } catch (err) {
      alert('Failed to update profile: ' + err.message)
    }
  }

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)

    try {
      // For demo purposes, we'll use Cloudinary upload or just convert to base64 for display
      // Since user provided Cloudinary creds, let's use them
      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', 'Smartbin')
      
      const res = await fetch('https://api.cloudinary.com/v1_1/dc8suuh6h/image/upload', {
        method: 'POST',
        body: formData
      })
      const data = await res.json()
      
      if (data.secure_url) {
        const { error } = await supabase.from('users').update({ phone: data.secure_url }).eq('uid', user.uid) // Using phone field as placeholder for avatar_url for now or you can add a field
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

  const handleRedeem = async (r) => {
    if (ecoCoins < r.coins) {
      alert(`You need ${r.coins - ecoCoins} more EcoCoins!`)
      return
    }
    if (confirm(`Redeem ${r.brand} ${r.disc} for ${r.coins} coins?`)) {
      try {
        await redeemCoins(r.coins, `${r.brand} ${r.disc}`)
        alert('Reward redeemed! Check your email for the voucher.')
      } catch (err) {
        alert(err.message)
      }
    }
  }

  const maxVal = Math.max(...CHART_DATA)

  return (
    <div className="screen screen-fade">
      {/* Header */}
      <div className="topbar">
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, letterSpacing: 3, color: 'var(--yellow)' }}>PROFILE</div>
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
            {uploading ? '⏳' : user?.phone ? <img src={user.phone} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (user?.name?.charAt(0).toUpperCase() || '👤')}
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
          {isEditing ? (
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              style={{
                fontFamily: 'var(--font-display)', fontSize: 30, letterSpacing: 2,
                background: 'rgba(255,255,255,0.05)', border: '1px solid var(--yellow)',
                color: 'var(--white)', textAlign: 'center', width: '80%', padding: '4px 8px',
                borderRadius: 8
              }}
              autoFocus
            />
          ) : (
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 34, letterSpacing: 2, lineHeight: 1 }}>
              {user?.name?.toUpperCase() || 'GUEST USER'}
            </div>
          )}
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--orange)', textTransform: 'uppercase', letterSpacing: 2, marginTop: 4 }}>
            ECO WARRIOR · LEVEL {user?.level || 1}
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="px card-enter" style={{ marginBottom: 16 }}>
        <div className="stats-row">
          <div className="stat-cell">
            <div className="stat-num">{totalScans}</div>
            <div className="stat-lbl">Disposals</div>
          </div>
          <div className="stat-cell">
            <div className="stat-num">{ecoCoins}</div>
            <div className="stat-lbl">EcoCoins</div>
          </div>
          <div className="stat-cell">
            <div className="stat-num">{(user?.co2_saved || 0).toFixed(1)}kg</div>
            <div className="stat-lbl">CO₂ Saved</div>
          </div>
        </div>
      </div>

      {/* Rewards */}
      <div className="section-label px">Available Rewards</div>
      <div className="px card-enter" style={{ marginBottom: 16 }}>
        <div className="reward-scroll">
          {REWARDS.map((r, i) => (
            <div key={i} className="reward-card" style={{ '--accent': r.color }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: r.color, borderRadius: 'var(--r-lg) var(--r-lg) 0 0' }} />
              <div className="reward-brand" style={{ color: r.color }}>{r.brand}</div>
              <div className="reward-disc">{r.disc}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>
                {r.expiry}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--yellow)', marginTop: 4 }}>
                🪙 {r.coins} coins
              </div>
              <button className="reward-btn" onClick={() => handleRedeem(r)}>Redeem →</button>
            </div>
          ))}
        </div>
      </div>

      {/* Activity Chart */}
      <div className="section-label px">Weekly Activity</div>
      <div className="px card-enter" style={{ marginBottom: 16 }}>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 70 }}>
            {CHART_DATA.map((v, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' }}>
                <div
                  className="bar-col"
                  style={{
                    width: '100%',
                    height: `${(v / maxVal) * 60}px`,
                    background: i === 5 ? 'var(--orange)' : 'var(--yellow)',
                    animationDelay: `${0.4 + i * 0.06}s`,
                  }}
                />
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)' }}>{DAY_LABELS[i]}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>
              This Week
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--yellow)' }}>
              ↑ 23% vs last week
            </div>
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="section-label px">Settings</div>
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
                <span style={{ fontSize: 13, fontWeight: 500 }}>{s.label}</span>
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
          onMouseEnter={e => { e.target.style.background = 'rgba(196,98,45,0.1)' }}
          onMouseLeave={e => { e.target.style.background = 'transparent' }}
        >
          ↩ Sign Out
        </button>
      </div>
    </div>
  )
}
