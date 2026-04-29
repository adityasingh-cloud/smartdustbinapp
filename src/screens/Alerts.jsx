import { useState } from 'react'

const ALERTS = [
  {
    id: 1,
    type: 'urgent',
    icon: '🗑',
    title: 'Bin #SB-042 Almost Full',
    msg: 'Metal compartment at 95% capacity. Schedule pickup immediately.',
    time: '09:41 AM',
    fill: 95,
    fillColor: '#E85454',
  },
  {
    id: 2,
    type: 'warning',
    icon: '⚠',
    title: 'Wrong Disposal Detected',
    msg: 'Plastic bottle placed in Wet bin. Buzzer triggered.',
    time: '09:15 AM',
    photo: '🍾',
    buzzer: true,
  },
  {
    id: 3,
    type: 'urgent',
    icon: '📡',
    title: 'Bin Offline',
    msg: 'Bin #SB-019 lost connectivity. Last seen 2 hours ago.',
    time: '08:52 AM',
  },
  {
    id: 4,
    type: 'warning',
    icon: '📍',
    title: 'Bin Moved Outside Zone',
    msg: 'Bin #SB-007 is 48m outside designated area.',
    time: '08:30 AM',
    mapSnippet: true,
  },
  {
    id: 5,
    type: 'info',
    icon: '✅',
    title: 'Pickup Scheduled',
    msg: 'Municipal truck assigned. ETA: 45 minutes.',
    time: '08:10 AM',
  },
  {
    id: 6,
    type: 'info',
    icon: '🪙',
    title: 'EcoCoins Credited',
    msg: '+86 EcoCoins earned this week. Keep it up!',
    time: '07:45 AM',
  },
]

const TYPE_COLORS = {
  urgent:  '#E85454',
  warning: '#E8C547',
  info:    '#4A7C4E',
}

const TYPE_LABELS = {
  urgent:  'CRITICAL',
  warning: 'WARNING',
  info:    'INFO',
}

export default function Alerts({ onBack }) {
  const [dismissed, setDismissed] = useState([])

  const visible = ALERTS.filter(a => !dismissed.includes(a.id))
  const urgentCount = visible.filter(a => a.type === 'urgent').length

  return (
    <div className="screen screen-fade">
      {/* Header */}
      <div className="topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="icon-btn" onClick={onBack} title="Go Back">←</button>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, letterSpacing: 3, color: 'var(--yellow)', lineHeight: 1 }}>ALERTS</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 2, marginTop: 2 }}>
              {urgentCount > 0 ? `${urgentCount} critical · Action needed` : 'All systems normal'}
            </div>
          </div>
        </div>
        <div style={{
          background: urgentCount ? 'rgba(232,84,84,0.15)' : 'rgba(74,124,78,0.15)',
          border: `1px solid ${urgentCount ? '#E85454' : '#4A7C4E'}55`,
          borderRadius: 'var(--r-md)', padding: '6px 10px', textAlign: 'center',
        }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: urgentCount ? '#E85454' : '#6BBF6F', lineHeight: 1 }}>
            {visible.length}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>
            Active
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, padding: '8px 20px 16px' }}>
        {['All', 'Critical', 'Warning', 'Info'].map(f => (
          <button key={f} style={{
            fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase',
            letterSpacing: 1, padding: '5px 10px',
            background: f === 'All' ? 'var(--yellow)' : 'var(--card-dark)',
            color: f === 'All' ? 'var(--text-dark)' : 'var(--text-muted)',
            border: '1px solid rgba(255,255,255,0.06)', borderRadius: 'var(--r-sm)',
            cursor: 'pointer',
          }}>
            {f}
          </button>
        ))}
      </div>

      {/* Alert cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '0 20px' }}>
        {visible.map((a, i) => (
          <div
            key={a.id}
            className="alert-card card-enter"
            style={{
              borderLeftColor: TYPE_COLORS[a.type],
              animationDelay: `${i * 0.07}s`,
              position: 'relative',
            }}
          >
            {/* Top row */}
            <div style={{ fontSize: 22, flexShrink: 0, marginTop: 2 }}>{a.icon}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 6 }}>
                <div style={{ fontWeight: 600, fontSize: 13, lineHeight: 1.3 }}>{a.title}</div>
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: 8, padding: '2px 6px',
                  background: `${TYPE_COLORS[a.type]}20`,
                  color: TYPE_COLORS[a.type],
                  border: `1px solid ${TYPE_COLORS[a.type]}44`,
                  borderRadius: 3, textTransform: 'uppercase', letterSpacing: 1, flexShrink: 0,
                }}>
                  {TYPE_LABELS[a.type]}
                </div>
              </div>

              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', marginTop: 4, lineHeight: 1.5 }}>
                {a.msg}
              </div>

              {/* Fill level bar for bin full */}
              {a.fill !== undefined && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>
                      Capacity
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: a.fillColor, fontWeight: 600 }}>
                      {a.fill}%
                    </span>
                  </div>
                  <div className="fill-bar-wrap">
                    <div
                      className="fill-bar"
                      style={{ width: `${a.fill}%`, background: `linear-gradient(90deg, ${a.fillColor}88, ${a.fillColor})` }}
                    />
                  </div>
                </div>
              )}

              {/* Wrong disposal photo */}
              {a.photo && (
                <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: 44, height: 44, background: 'var(--card-darker)', borderRadius: 6,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
                    border: '1px solid rgba(232,84,84,0.3)',
                  }}>
                    {a.photo}
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-mono)', fontSize: 10,
                    color: '#E85454', textTransform: 'uppercase', letterSpacing: 1,
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    <span style={{ animation: 'blink 0.8s step-end infinite' }}>🔔</span>
                    Buzzer triggered
                  </div>
                </div>
              )}

              {/* GPS map snippet */}
              {a.mapSnippet && (
                <div style={{ marginTop: 8, height: 48, borderRadius: 6, background: 'var(--card-darker)', position: 'relative', overflow: 'hidden' }}>
                  <div style={{
                    position: 'absolute', inset: 0,
                    backgroundImage: 'linear-gradient(rgba(232,197,71,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(232,197,71,0.04) 1px, transparent 1px)',
                    backgroundSize: '14px 14px',
                  }} />
                  <div style={{ position: 'absolute', top: '50%', left: '55%', transform: 'translate(-50%,-50%)', fontSize: 16 }}>📍</div>
                  <div style={{
                    position: 'absolute', top: '50%', left: '55%',
                    transform: 'translate(-50%,-50%)',
                    width: 48, height: 48,
                    border: '1.5px dashed rgba(196,98,45,0.6)',
                    borderRadius: '50%',
                    animation: 'radarPulse 2s ease-out infinite',
                  }} />
                  <div style={{
                    position: 'absolute', bottom: 4, right: 6,
                    fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--orange)',
                    textTransform: 'uppercase', letterSpacing: 1,
                  }}>
                    48m outside zone
                  </div>
                </div>
              )}

              {/* Timestamp + dismiss */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)' }}>
                  ⏱ {a.time} · Today
                </div>
                <button
                  onClick={() => setDismissed(d => [...d, a.id])}
                  style={{
                    fontFamily: 'var(--font-mono)', fontSize: 9,
                    color: 'var(--text-muted)', background: 'none', border: 'none',
                    cursor: 'pointer', textDecoration: 'underline', textTransform: 'uppercase', letterSpacing: 1,
                  }}
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        ))}

        {visible.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 20px' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, color: 'var(--yellow)' }}>ALL CLEAR</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>No active alerts</div>
          </div>
        )}
      </div>

      <div style={{ height: 24 }} />
    </div>
  )
}
