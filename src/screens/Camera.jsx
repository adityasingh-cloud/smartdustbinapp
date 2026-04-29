import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'

const CATEGORIES = [
  { id: 'dry',   label: 'Dry',   icon: '♻', color: '#E8C547', glow: 'rgba(232,197,71,0.3)' },
  { id: 'wet',   label: 'Wet',   icon: '🌿', color: '#4A7C4E', glow: 'rgba(74,124,78,0.3)'  },
  { id: 'metal', label: 'Metal', icon: '🔩', color: '#3A5A8C', glow: 'rgba(58,90,140,0.3)'  },
]

const DEMO_ITEMS = [
  { name: 'Plastic Bottle', cat: 'dry', pts: 5 },
  { name: 'Banana Peel', cat: 'wet', pts: 3 },
  { name: 'Aluminium Can', cat: 'metal', pts: 8 },
  { name: 'Paper Box', cat: 'dry', pts: 4 },
  { name: 'Food Waste', cat: 'wet', pts: 2 },
  { name: 'Steel Spoon', cat: 'metal', pts: 10 },
]

export default function CameraScreen() {
  const { saveScan } = useApp()
  const [detected, setDetected] = useState(null)
  const [scanning, setScanning] = useState(false)
  const [statusText, setStatusText] = useState('READY TO SCAN')

  const handleScan = async () => {
    setScanning(true)
    setDetected(null)
    setStatusText('SCANNING WASTE...')

    // Simulate AI analysis delay
    setTimeout(async () => {
      const item = DEMO_ITEMS[Math.floor(Math.random() * DEMO_ITEMS.length)]
      setDetected(item.cat)
      setStatusText(`${item.cat.toUpperCase()} WASTE DETECTED`)
      setScanning(false)

      // Save to Supabase via Context
      try {
        await saveScan({
          category: item.cat,
          item_name: item.name,
          description: `Automatically detected ${item.name} using AI Vision.`,
          confidence: Math.floor(Math.random() * 10) + 90,
          recyclable: item.cat === 'dry' || item.cat === 'metal',
          hazardous: false,
          disposal_tip: `Place this in the ${item.cat} section of the bin.`,
          eco_coins_earned: item.pts,
          image_url: '' // Placeholder for web demo
        })
      } catch (err) {
        console.error('Save scan failed:', err)
      }
    }, 2200)
  }

  return (
    <div className="screen screen-fade" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 60 }}>

      {/* Header */}
      <div style={{ width: '100%', padding: '0 20px', marginBottom: 32 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, letterSpacing: 4, color: 'var(--yellow)' }}>
          SCAN & DISPOSE
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: 2, textTransform: 'uppercase', marginTop: 2 }}>
          Point camera at waste item
        </div>
      </div>

      {/* Viewfinder */}
      <div style={{ position: 'relative', width: 240, height: 240, flexShrink: 0 }}>
        {/* Radar rings */}
        <div className="radar-ring" style={{ inset: -16 }} />
        <div className="radar-ring" style={{ inset: -16, animationDelay: '0.7s' }} />
        <div className="radar-ring" style={{ inset: -16, animationDelay: '1.4s' }} />

        {/* Outer glow ring */}
        <div style={{
          position: 'absolute', inset: -4,
          borderRadius: '50%',
          border: scanning ? '2px solid var(--yellow)' : '1.5px solid rgba(232,197,71,0.3)',
          transition: 'border-color 0.3s',
          boxShadow: scanning ? 'var(--shadow-yellow)' : 'none',
        }} />

        {/* Main circle */}
        <div style={{
          width: 240, height: 240,
          borderRadius: '50%',
          background: 'radial-gradient(circle at center, #0D0D0C 60%, #1A1A18)',
          border: '2px solid rgba(232,197,71,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Corner brackets */}
          <div className="bracket bracket-tl" />
          <div className="bracket bracket-tr" />
          <div className="bracket bracket-bl" />
          <div className="bracket bracket-br" />

          {/* Scan sweep */}
          {scanning && <div className="scan-sweep" />}

          {/* Center icon */}
          <div style={{ fontSize: detected ? 56 : 48, zIndex: 2, transition: 'transform 0.3s', transform: detected ? 'scale(1.1)' : 'scale(1)' }}>
            {detected
              ? CATEGORIES.find(c => c.id === detected)?.icon
              : '📷'}
          </div>
        </div>
      </div>

      {/* Status text */}
      <div style={{
        marginTop: 28,
        fontFamily: 'var(--font-mono)',
        fontSize: 13,
        letterSpacing: 3,
        textTransform: 'uppercase',
        color: detected ? CATEGORIES.find(c => c.id === detected)?.color : 'var(--yellow)',
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
        {statusText}
        {scanning && <span className="blink" style={{ color: 'var(--yellow)' }}>_</span>}
      </div>

      {/* Category pills */}
      <div style={{ display: 'flex', gap: 10, marginTop: 24, padding: '0 20px' }}>
        {CATEGORIES.map(cat => (
          <div
            key={cat.id}
            className={`pill ${detected === cat.id ? `active-${cat.id}` : ''}`}
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
          </div>
        ))}
      </div>

      {/* Info row */}
      {detected && (
        <div style={{
          marginTop: 16, padding: '10px 20px',
          background: `rgba(${CATEGORIES.find(c=>c.id===detected)?.glow.match(/\d+/g).slice(0,3).join(',')},0.12)`,
          border: `1px solid ${CATEGORIES.find(c=>c.id===detected)?.color}44`,
          borderRadius: 'var(--r-md)', width: 'calc(100% - 40px)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          animation: 'cardSlideUp 0.4s cubic-bezier(0.34,1.56,0.64,1)',
        }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: CATEGORIES.find(c=>c.id===detected)?.color }}>
              {CATEGORIES.find(c=>c.id===detected)?.label} Waste
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', marginTop: 2, textTransform: 'uppercase', letterSpacing: 1 }}>
              Confidence: 94.7%
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: '#6BBF6F' }}>+8</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase' }}>EcoCoins</div>
          </div>
        </div>
      )}

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Scan button */}
      <div style={{ width: '100%', padding: '0 20px', marginBottom: 16 }}>
        <button className="scan-btn" onClick={handleScan} disabled={scanning}>
          {scanning ? '⟳  ANALYZING...' : '⬡  SCAN'}
        </button>
        <div style={{
          textAlign: 'center', marginTop: 10,
          fontFamily: 'var(--font-mono)', fontSize: 10,
          color: 'var(--text-muted)', letterSpacing: 1,
        }}>
          AI Vision Active • EcoCoins will be credited
        </div>
      </div>

      <style>{`
        @keyframes cardSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
