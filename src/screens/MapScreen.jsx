import { useState } from 'react'
import { useApp } from '../context/AppContext'

const BINS = [
  { id: 1, name: 'Main Street Bin', lat: 28.6139, lng: 77.2090, fill: 45, status: 'Active' },
  { id: 2, name: 'City Park Bin', lat: 28.6129, lng: 77.2110, fill: 82, status: 'Full' },
  { id: 3, name: 'Market Plaza Bin', lat: 28.6150, lng: 77.2070, fill: 12, status: 'Empty' },
]

export default function MapScreen() {
  const { t } = useApp()
  const [selected, setSelected] = useState(BINS[0])

  // Public search embed works without key
  const publicMapUrl = `https://www.google.com/maps?q=${selected.lat},${selected.lng}&output=embed&z=16`

  return (
    <div className="screen screen-fade" style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Top Bar */}
      <div className="topbar">
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, letterSpacing: 2 }}>{t('binLocations')}</div>
      </div>

      {/* Map Container */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', background: '#111' }}>
        <iframe
          title="Bin Map"
          width="100%"
          height="100%"
          frameBorder="0"
          style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) brightness(0.8) contrast(1.2)' }}
          src={publicMapUrl}
          allowFullScreen
        />
        
        {/* Radar Overlay Effect */}
        <div style={{ 
          position: 'absolute', inset: 0, pointerEvents: 'none', 
          background: 'radial-gradient(circle at center, transparent 30%, rgba(0,0,0,0.4) 100%)',
          border: '1px solid rgba(232,197,71,0.2)' 
        }} />
      </div>

      {/* Bin List */}
      <div className="px" style={{ 
        padding: '20px', background: 'var(--bg)', 
        borderTop: '2px solid var(--yellow)', 
        maxHeight: '40%', overflowY: 'auto' 
      }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 12, letterSpacing: 2 }}>
          {t('nearbyBins')} ({BINS.length})
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {BINS.map(bin => (
            <div 
              key={bin.id}
              onClick={() => setSelected(bin)}
              style={{ 
                padding: '14px', borderRadius: 'var(--r-md)',
                background: selected.id === bin.id ? 'rgba(232,197,71,0.1)' : 'var(--card-dark)',
                border: `1px solid ${selected.id === bin.id ? 'var(--yellow)' : 'rgba(255,255,255,0.05)'}`,
                cursor: 'pointer', transition: 'all 0.2s',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}
            >
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: selected.id === bin.id ? 'var(--yellow)' : 'var(--white)' }}>{bin.name}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', marginTop: 2 }}>
                  {bin.lat.toFixed(4)}, {bin.lng.toFixed(4)} · 0.4km
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ 
                  fontFamily: 'var(--font-mono)', fontSize: 10, 
                  color: bin.fill > 80 ? '#E85454' : '#6BBF6F', 
                  fontWeight: 700 
                }}>
                  {bin.fill}% {t('full').toUpperCase()}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--text-muted)' }}>{t('lastUpdated')}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Directions CTA */}
        <button 
          className="scan-btn" 
          style={{ marginTop: 20, height: 44, fontSize: 16 }}
          onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${selected.lat},${selected.lng}`, '_blank')}
        >
          📍 {t('getDirections').toUpperCase()}
        </button>
      </div>
    </div>
  )
}
