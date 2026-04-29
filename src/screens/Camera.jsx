import { useState, useEffect, useRef } from 'react'
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
  const videoRef = useRef(null)
  const fileInputRef = useRef(null)
  
  const [stream, setStream] = useState(null)
  const [detected, setDetected] = useState(null)
  const [scanning, setScanning] = useState(false)
  const [statusText, setStatusText] = useState('READY TO SCAN')

  // Start camera on mount
  useEffect(() => {
    startCamera()
    return () => stopCamera()
  }, [])

  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }, 
        audio: false 
      })
      setStream(s)
      if (videoRef.current) videoRef.current.srcObject = s
    } catch (err) {
      console.warn('Live camera failed, using file picker fallback:', err)
      setStatusText('TAP SCAN TO OPEN CAMERA')
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
    }
  }

  const handleScan = async () => {
    // If no live stream, trigger the mobile native camera picker
    if (!stream) {
      fileInputRef.current.click()
      return
    }

    setScanning(true)
    setDetected(null)
    setStatusText('ANALYZING IMAGE...')

    // Simulate AI delay
    setTimeout(async () => {
      const item = DEMO_ITEMS[Math.floor(Math.random() * DEMO_ITEMS.length)]
      setDetected(item.cat)
      setStatusText(`${item.cat.toUpperCase()} WASTE DETECTED`)
      setScanning(false)

      try {
        await saveScan({
          category: item.cat,
          item_name: item.name,
          description: `AI detected ${item.name}.`,
          confidence: 95,
          recyclable: item.cat !== 'wet',
          hazardous: false,
          disposal_tip: `Dispose in ${item.cat} bin.`,
          eco_coins_earned: item.pts,
        })
      } catch (err) { console.error(err) }
    }, 2000)
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    setScanning(true)
    setStatusText('PROCESSING PHOTO...')
    
    setTimeout(() => {
      handleScan() // Reuse the scan logic for the file
    }, 1000)
  }

  return (
    <div className="screen screen-fade" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 60 }}>
      {/* Hidden file input for native mobile camera redirect */}
      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        accept="image/*" 
        capture="environment" 
        onChange={handleFileUpload} 
      />

      {/* Header */}
      <div style={{ width: '100%', padding: '0 20px', marginBottom: 32 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, letterSpacing: 4, color: 'var(--yellow)' }}>
          SCAN & DISPOSE
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: 2, textTransform: 'uppercase', marginTop: 2 }}>
          AI VISION ACTIVE
        </div>
      </div>

      {/* Viewfinder */}
      <div style={{ position: 'relative', width: 260, height: 260, flexShrink: 0 }}>
        {/* Radar rings */}
        <div className="radar-ring" style={{ inset: -16 }} />
        <div className="radar-ring" style={{ inset: -16, animationDelay: '0.7s' }} />

        {/* Main circle */}
        <div style={{
          width: 260, height: 260,
          borderRadius: '50%',
          background: '#0D0D0C',
          border: '2px solid rgba(232,197,71,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative', overflow: 'hidden',
          boxShadow: scanning ? 'var(--shadow-yellow)' : 'none',
        }}>
          {/* Live Video Preview */}
          {stream ? (
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: scanning ? 0.5 : 1 }} 
            />
          ) : (
            <div style={{ fontSize: 48 }}>📷</div>
          )}

          {/* Corner brackets */}
          <div className="bracket bracket-tl" />
          <div className="bracket bracket-tr" />
          <div className="bracket bracket-bl" />
          <div className="bracket bracket-br" />

          {/* Scan sweep */}
          {scanning && <div className="scan-sweep" />}

          {/* Detection result overlay */}
          {detected && !scanning && (
            <div style={{ 
              position: 'absolute', inset: 0, 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(0,0,0,0.4)', fontSize: 80,
              animation: 'cardSlideUp 0.3s ease'
            }}>
              {CATEGORIES.find(c => c.id === detected)?.icon}
            </div>
          )}
        </div>
      </div>

      {/* Status text */}
      <div style={{
        marginTop: 28,
        fontFamily: 'var(--font-mono)', fontSize: 13, letterSpacing: 3,
        textTransform: 'uppercase',
        color: detected ? CATEGORIES.find(c => c.id === detected)?.color : 'var(--yellow)',
      }}>
        {statusText} {scanning && <span className="blink">_</span>}
      </div>

      {/* Info row */}
      {detected && !scanning && (
        <div style={{
          marginTop: 20, padding: '12px 20px',
          background: 'rgba(232,197,71,0.1)',
          border: '1px solid var(--yellow)',
          borderRadius: 'var(--r-md)', width: 'calc(100% - 40px)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          animation: 'cardSlideUp 0.4s cubic-bezier(0.34,1.56,0.64,1)',
        }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--yellow)' }}>
              {detected.toUpperCase()} DETECTED
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>
              MATCH CONFIDENCE: 98.2%
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: '#6BBF6F' }}>+8</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)' }}>ECOCOINS</div>
          </div>
        </div>
      )}

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Scan button */}
      <div style={{ width: '100%', padding: '0 20px', marginBottom: 20 }}>
        <button className="scan-btn" onClick={handleScan} disabled={scanning}>
          {scanning ? '⟳  ANALYZING...' : stream ? '⬡  SCAN NOW' : '📷  OPEN CAMERA'}
        </button>
      </div>
    </div>
  )
}
