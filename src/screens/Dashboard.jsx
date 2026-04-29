import { useApp } from '../context/AppContext'
import { LANGUAGES } from '../utils/translations'

const NumAnim = ({ val }) => {
  return <>{val.toLocaleString()}</>
}

export default function Dashboard({ onBell, onSettings }) {
  const { user, binData, ecoCoins, totalScans, recentScans, leaderboard, t, language, changeLanguage } = useApp()

  const BINS = [
    { label: t('dry'),   pct: binData?.dry || 0,   color: '#E8C547', icon: '🟡' },
    { label: t('wet'),   pct: binData?.wet || 0,   color: '#4A7C4E', icon: '🟢' },
    { label: t('metal'), pct: binData?.metal || 0, color: '#3A5A8C', icon: '🔵' },
  ]

  const formatTime = (ts) => {
    if (!ts) return ''
    const d = new Date(ts)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="screen screen-fade">
      {/* Top Bar */}
      <div className="topbar">
        <div className="topbar-logo">SMART<span>BIN</span></div>
        <div className="topbar-right">
          <select 
            value={language} 
            onChange={(e) => changeLanguage(e.target.value)}
            style={{ 
              background: 'var(--card-dark)', color: 'var(--yellow)', 
              border: '1px solid var(--border)', borderRadius: 'var(--r-sm)',
              fontSize: 10, padding: '2px 4px', outline: 'none'
            }}
          >
            {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.code.toUpperCase()}</option>)}
          </select>
          <button className="icon-btn notif-dot" title={t('notifications')} onClick={onBell}>🔔</button>
          <button className="icon-btn" title={t('settings')} onClick={onSettings}>⚙</button>
        </div>
      </div>

      {/* Hero Stats */}
      <div className="px card-enter" style={{ marginTop: 8 }}>
        <div className="ecocoins-card">
          <div className="ecocoins-num"><NumAnim val={ecoCoins} /></div>
          <div className="ecocoins-sub">{t('yourCoins')}</div>
          <div className="ecocoins-cta">
            {t('ecoWarrior')} · LVL {user?.level || 1} 
            <span style={{ marginLeft: 'auto' }}>→</span>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="px card-enter" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
        <div className="card" style={{ padding: '12px 16px' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, lineHeight: 1 }}>{totalScans}</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: 4 }}>{t('totalScans')}</div>
        </div>
        <div className="card" style={{ padding: '12px 16px' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, lineHeight: 1, color: '#6BBF6F' }}>{(user?.co2_saved || 0).toFixed(1)}<span style={{ fontSize: 14 }}>KG</span></div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: 4 }}>{t('co2Saved')}</div>
        </div>
      </div>

      {/* Bin Status */}
      <div className="section-label px" style={{ marginTop: 24 }}>{t('binStatus')}</div>
      <div className="px card-enter">
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {BINS.map(bin => (
            <div key={bin.label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 14 }}>{bin.icon}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>{bin.label}</span>
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: bin.pct > 80 ? '#E85454' : bin.color, fontWeight: 600 }}>{bin.pct}%</span>
              </div>
              <div className="fill-bar-wrap">
                <div 
                  className="fill-bar" 
                  style={{ width: `${bin.pct}%`, background: bin.color, boxShadow: `0 0 10px ${bin.color}44` }} 
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Community Leaderboard */}
      <div className="section-label px" style={{ marginTop: 24 }}>COMMUNITY LEADERBOARD</div>
      <div className="px card-enter">
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {leaderboard.length > 0 ? leaderboard.map((u, i) => (
            <div key={i} style={{ 
              display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
              borderBottom: i < leaderboard.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
              background: u.uid === user?.uid ? 'rgba(232,197,71,0.05)' : 'transparent'
            }}>
              <div style={{ 
                fontFamily: 'var(--font-display)', fontSize: 18, width: 24, 
                color: i === 0 ? 'var(--yellow)' : 'var(--text-muted)' 
              }}>
                #{i + 1}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{u.name}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase' }}>LVL {u.level}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--yellow)' }}>{u.eco_coins}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--text-muted)' }}>COINS</div>
              </div>
            </div>
          )) : (
            <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>Loading leaderboard...</div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="section-label px" style={{ marginTop: 24 }}>{t('recentActivity')}</div>
      <div className="px card-enter" style={{ paddingBottom: 20 }}>
        {recentScans.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {recentScans.map((s, i) => (
              <div key={i} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px' }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <div style={{ 
                    width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.05)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16
                  }}>
                    {s.category === 'dry' ? '♻️' : s.category === 'wet' ? '🌿' : '🔩'}
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>{s.item_name}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)' }}>{formatTime(s.created_at)}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--yellow)', fontWeight: 600 }}>+{s.eco_coins_earned}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card" style={{ textAlign: 'center', padding: '32px 16px' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>✨</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>{t('noActivity')}</div>
          </div>
        )}
      </div>
    </div>
  )
}
