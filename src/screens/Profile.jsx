import { useEffect, useRef, useState } from 'react'
import { useApp } from '../context/AppContext'

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
  const { user, ecoCoins, totalScans, logout, redeemCoins } = useApp()
  const avatarRef = useRef(null)
  const [toggles, setToggles] = useState(SETTINGS.map(s => s.val))

  // 3D parallax tilt on mouse/touch
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
        <button className="icon-btn">✏</button>
      </div>

      {/* Avatar */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 20px', gap: 12 }}>
        <div className="avatar-wrap" ref={avatarRef} style={{ perspective: 400 }}>
          <div className="avatar-ring" />
          <div className="avatar-img">{user?.name?.charAt(0).toUpperCase() || '👤'}</div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 34, letterSpacing: 2, lineHeight: 1 }}>
            {user?.name?.toUpperCase() || 'GUEST USER'}
          </div>
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
