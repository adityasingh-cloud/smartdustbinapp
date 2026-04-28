import { useEffect, useRef, useState } from 'react'
import BinModel3D from '../components/BinModel3D'
import ErrorBoundary from '../components/ErrorBoundary'

const BINS = [
  { label: 'Dry',   pct: 72, color: '#E8C547', cls: 'dry',   icon: '🟡' },
  { label: 'Wet',   pct: 45, color: '#4A7C4E', cls: 'wet',   icon: '🟢' },
  { label: 'Metal', pct: 88, color: '#3A5A8C', cls: 'metal', icon: '🔵' },
]

const ACTIVITY = [
  { type: 'Dry',   label: 'Plastic Bottle',    time: '09:41 AM', pts: '+5',  badge: 'badge-dry'   },
  { type: 'Wet',   label: 'Banana Peel',        time: '09:15 AM', pts: '+3',  badge: 'badge-wet'   },
  { type: 'Metal', label: 'Aluminium Can',      time: '08:52 AM', pts: '+8',  badge: 'badge-metal' },
]

function AnimatedNumber({ target, duration = 1800 }) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    const start = Date.now()
    const tick = () => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      const ease = 1 - Math.pow(1 - progress, 3)
      setVal(Math.round(ease * target))
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [target, duration])
  return <>{val.toLocaleString()}</>
}

export default function Dashboard({ onBell }) {
  return (
    <div className="screen screen-fade">
      {/* Top Bar */}
      <div className="topbar">
        <div className="topbar-logo">SMART<span>BIN</span></div>
        <div className="topbar-right">
          <button className="icon-btn notif-dot" title="Notifications" onClick={onBell}>🔔</button>
          <button className="icon-btn" title="Settings">⚙</button>
        </div>
      </div>

      {/* Hero 3D Bin */}
      <div className="px card-enter" style={{ marginBottom: 8 }}>
        <div style={{ position: 'relative' }}>
          <BinModel3D />
          <div style={{
            position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)',
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'rgba(26,26,24,0.8)', backdropFilter: 'blur(10px)',
            padding: '6px 14px', borderRadius: '99px',
            border: '1px solid rgba(74,124,78,0.4)',
          }}>
            <span className="pulse-dot" />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: 2, color: '#6BBF6F' }}>
              AI Segregation Active
            </span>
          </div>
        </div>
      </div>

      {/* Bin fill stats */}
      <div className="section-label px mt-3">Fill Levels</div>
      <div className="px" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 16 }}>
        {BINS.map((b, i) => (
          <div key={b.label} className="card card-enter" style={{ padding: '12px 10px', animationDelay: `${0.1 + i * 0.08}s` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 16 }}>{b.icon}</span>
              <span className={`badge badge-${b.cls}`}>{b.pct}%</span>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginTop: 6, color: 'var(--text-light)' }}>
              {b.label}
            </div>
            <div className="fill-bar-wrap">
              <div
                className="fill-bar"
                style={{ width: `${b.pct}%`, background: `linear-gradient(90deg, ${b.color}88, ${b.color})` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* EcoCoins */}
      <div className="px card-enter" style={{ animationDelay: '0.25s', marginBottom: 16 }}>
        <div className="ecocoins-card">
          <div className="texture" />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: 3, opacity: 0.6, marginBottom: 4 }}>
                EcoCoins Balance
              </div>
              <div className="ecocoins-num">
                <AnimatedNumber target={1240} />
              </div>
              <div className="ecocoins-sub">+86 this week • Level 4</div>
              <div className="ecocoins-cta">
                Redeem for rewards <span>→</span>
              </div>
            </div>
            <div style={{ fontSize: 48, opacity: 0.7, lineHeight: 1 }}>🪙</div>
          </div>

          {/* Coin burst particles */}
          <div style={{ position: 'absolute', top: 20, right: 60, pointerEvents: 'none' }}>
            {[...Array(5)].map((_, i) => (
              <div key={i} style={{
                position: 'absolute',
                fontSize: 12,
                animation: `coinBurst 1.5s ease-out ${0.8 + i * 0.15}s both`,
                left: Math.cos((i / 5) * Math.PI * 2) * 30,
                top: Math.sin((i / 5) * Math.PI * 2) * 30,
              }}>🪙</div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="section-label px">Recent Disposals</div>
      <div className="px" style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
        {ACTIVITY.map((a, i) => (
          <div key={i} className="card card-enter flex items-center justify-between" style={{ animationDelay: `${0.3 + i * 0.07}s`, padding: '12px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: `rgba(${a.type === 'Dry' ? '232,197,71' : a.type === 'Wet' ? '74,124,78' : '58,90,140'},0.15)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
              }}>
                {a.type === 'Dry' ? '♻' : a.type === 'Wet' ? '🌿' : '🔩'}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{a.label}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{a.time}</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
              <span className={`badge ${a.badge}`}>{a.type}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#6BBF6F' }}>{a.pts} coins</span>
            </div>
          </div>
        ))}
      </div>

      {/* GPS Map */}
      <div className="section-label px">Bin Location</div>
      <div className="px card-enter" style={{ animationDelay: '0.45s', marginBottom: 24 }}>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="map-preview">
            <div className="map-grid" />
            <div className="map-pin">📍</div>
            <div style={{
              position: 'absolute', bottom: 8, left: 8,
              background: 'rgba(26,26,24,0.85)', backdropFilter: 'blur(8px)',
              padding: '4px 10px', borderRadius: 4,
              fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--yellow)',
            }}>
              BIN #SB-042 · 12m away
            </div>
            <div style={{
              position: 'absolute', top: 8, right: 8,
              background: 'rgba(74,124,78,0.2)', border: '1px solid rgba(74,124,78,0.5)',
              padding: '2px 8px', borderRadius: 4,
              fontFamily: 'var(--font-mono)', fontSize: 9, color: '#6BBF6F', textTransform: 'uppercase',
            }}>
              ● Online
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes coinBurst {
          0%   { transform: scale(0) translate(0,0); opacity: 1; }
          60%  { opacity: 1; }
          100% { transform: scale(1.2) translate(var(--tx, 20px), var(--ty, -30px)); opacity: 0; }
        }
      `}</style>
    </div>
  )
}
