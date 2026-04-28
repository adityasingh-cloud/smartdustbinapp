export default function MapScreen() {
  const bins = [
    { id: 'SB-042', x: 50, y: 45, fill: 88, status: 'critical', active: true },
    { id: 'SB-019', x: 28, y: 62, fill: 45, status: 'ok',       active: false },
    { id: 'SB-007', x: 72, y: 30, fill: 72, status: 'warning',  active: true },
    { id: 'SB-031', x: 60, y: 70, fill: 20, status: 'ok',       active: true },
    { id: 'SB-015', x: 18, y: 35, fill: 55, status: 'ok',       active: true },
  ]

  const statusColor = { critical: '#E85454', warning: '#E8C547', ok: '#4A7C4E' }

  return (
    <div className="screen screen-fade">
      <div className="topbar">
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, letterSpacing: 3, color: 'var(--yellow)' }}>BIN MAP</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>
          5 bins nearby
        </div>
      </div>

      {/* Map area */}
      <div className="px card-enter" style={{ marginBottom: 16 }}>
        <div style={{
          height: 280, borderRadius: 'var(--r-lg)', position: 'relative', overflow: 'hidden',
          background: 'linear-gradient(135deg, #0f1a0f 0%, #0f0f1a 50%, #1a0f0f 100%)',
          border: '1px solid rgba(232,197,71,0.1)',
        }}>
          {/* Grid */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'linear-gradient(rgba(232,197,71,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(232,197,71,0.05) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }} />

          {/* Roads */}
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} xmlns="http://www.w3.org/2000/svg">
            <line x1="0" y1="50%" x2="100%" y2="50%" stroke="rgba(232,197,71,0.07)" strokeWidth="12" />
            <line x1="40%" y1="0" x2="40%" y2="100%" stroke="rgba(232,197,71,0.07)" strokeWidth="8" />
            <line x1="70%" y1="0" x2="70%" y2="100%" stroke="rgba(232,197,71,0.05)" strokeWidth="6" />
            <line x1="0" y1="30%" x2="100%" y2="30%" stroke="rgba(232,197,71,0.05)" strokeWidth="6" />
          </svg>

          {/* Bins */}
          {bins.map(b => (
            <div key={b.id} style={{
              position: 'absolute',
              left: `${b.x}%`, top: `${b.y}%`,
              transform: 'translate(-50%, -50%)',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              cursor: 'pointer',
            }}>
              {/* Pulse ring for active */}
              {b.active && (
                <div style={{
                  position: 'absolute', width: 32, height: 32, borderRadius: '50%',
                  border: `2px solid ${statusColor[b.status]}`,
                  animation: 'radarPulse 2s ease-out infinite',
                  opacity: 0.6,
                }} />
              )}
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: `${statusColor[b.status]}22`,
                border: `2px solid ${statusColor[b.status]}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14,
                boxShadow: `0 0 12px ${statusColor[b.status]}66`,
              }}>
                🗑
              </div>
              <div style={{
                marginTop: 4,
                fontFamily: 'var(--font-mono)', fontSize: 8,
                color: statusColor[b.status],
                background: 'rgba(15,15,12,0.8)',
                padding: '1px 4px', borderRadius: 2,
                textTransform: 'uppercase', letterSpacing: 0.5,
                whiteSpace: 'nowrap',
              }}>
                {b.id}
              </div>
            </div>
          ))}

          {/* My location */}
          <div style={{
            position: 'absolute', left: '50%', top: '55%',
            transform: 'translate(-50%, -50%)',
            width: 16, height: 16, borderRadius: '50%',
            background: '#3A5A8C', border: '3px solid white',
            boxShadow: '0 0 0 6px rgba(58,90,140,0.25)',
          }} />

          {/* Legend */}
          <div style={{
            position: 'absolute', bottom: 12, left: 12,
            background: 'rgba(15,15,12,0.85)', backdropFilter: 'blur(8px)',
            borderRadius: 6, padding: '8px 10px',
            display: 'flex', flexDirection: 'column', gap: 4,
          }}>
            {[['critical', 'Critical'], ['warning', 'Warning'], ['ok', 'Online']].map(([k, l]) => (
              <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: statusColor[k] }} />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>
                  {l}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Nearby bin list */}
      <div className="section-label px">Nearby Bins</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '0 20px' }}>
        {bins.map((b, i) => (
          <div key={b.id} className="card card-enter" style={{ padding: '12px 14px', animationDelay: `${i * 0.07}s` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 8,
                  background: `${statusColor[b.status]}15`,
                  border: `1px solid ${statusColor[b.status]}44`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18,
                }}>🗑</div>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, letterSpacing: 1 }}>BIN #{b.id}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginTop: 2 }}>
                    {b.active ? '● Online' : '○ Offline'} · ~{Math.round(b.x * 2)}m away
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: statusColor[b.status] }}>{b.fill}%</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Full</div>
              </div>
            </div>
            <div className="fill-bar-wrap" style={{ marginTop: 8 }}>
              <div className="fill-bar" style={{
                width: `${b.fill}%`,
                background: `linear-gradient(90deg, ${statusColor[b.status]}88, ${statusColor[b.status]})`,
              }} />
            </div>
          </div>
        ))}
      </div>
      <div style={{ height: 16 }} />
    </div>
  )
}
