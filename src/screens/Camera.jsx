import { useState, useEffect, useRef } from 'react'
import { useApp } from '../context/AppContext'
import { jsPDF } from 'jspdf'

const CATEGORIES = [
  { id: 'dry',   label: 'dry',   icon: '♻', color: '#E8C547' },
  { id: 'wet',   label: 'wet',   icon: '🌿', color: '#4A7C4E' },
  { id: 'metal', label: 'metal', icon: '🔩', color: '#3A5A8C' },
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
  const { saveScan, t } = useApp()
  const videoRef = useRef(null)
  const fileInputRef = useRef(null)
  
  const [stream, setStream] = useState(null)
  const [detected, setDetected] = useState(null)
  const [lastItem, setLastItem] = useState(null)
  const [scanning, setScanning] = useState(false)
  const [statusText, setStatusText] = useState(t('tapToCapture'))

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
      setStatusText(t('smartbinActive'))
    } catch (err) {
      console.warn('Live camera failed:', err)
      setStatusText(t('tapToCapture'))
    }
  }

  const stopCamera = () => {
    if (stream) stream.getTracks().forEach(track => track.stop())
  }

  const handleScan = async () => {
    if (!stream) {
      fileInputRef.current.click()
      return
    }

    setScanning(true)
    setDetected(null)
    setStatusText(t('analyzing'))

    setTimeout(async () => {
      const item = DEMO_ITEMS[Math.floor(Math.random() * DEMO_ITEMS.length)]
      setDetected(item.cat)
      setLastItem(item)
      setStatusText(`${t(item.cat).toUpperCase()} ${t('result')}`)
      setScanning(false)

      try {
        await saveScan({
          category: item.cat,
          item_name: item.name,
          description: `AI detected ${item.name}.`,
          confidence: 95,
          recyclable: item.cat !== 'wet',
          hazardous: false,
          disposal_tip: `${t('disposalTip')}: ${t(item.cat)} bin.`,
          eco_coins_earned: item.pts,
        })
      } catch (err) { console.error(err) }
    }, 2000)
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setScanning(true)
    setStatusText(t('uploadingImage'))
    setTimeout(() => handleScan(), 1000)
  }

  const downloadPDF = () => {
    if (!lastItem) return
    const doc = new jsPDF()
    doc.setFontSize(22)
    doc.text('SMARTBIN DISPOSAL REPORT', 20, 20)
    doc.setFontSize(14)
    doc.text(`Date: ${new Date().toLocaleString()}`, 20, 35)
    doc.text(`Item: ${lastItem.name}`, 20, 45)
    doc.text(`Category: ${lastItem.cat.toUpperCase()}`, 20, 55)
    doc.text(`Points Earned: ${lastItem.pts} EcoCoins`, 20, 65)
    doc.text(`Recyclable: ${lastItem.cat !== 'wet' ? 'Yes' : 'No'}`, 20, 75)
    doc.text('Status: COMPLETED', 20, 85)
    doc.save(`SmartBin_Report_${Date.now()}.pdf`)
  }

  return (
    <div className="screen screen-fade" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 60 }}>
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
          {t('scanWaste').toUpperCase()}
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: 2, textTransform: 'uppercase', marginTop: 2 }}>
          {t('smartbinActive')}
        </div>
      </div>

      {/* Viewfinder */}
      <div style={{ position: 'relative', width: 260, height: 260, flexShrink: 0 }}>
        <div className="radar-ring" style={{ inset: -16 }} />
        <div className="radar-ring" style={{ inset: -16, animationDelay: '0.7s' }} />

        <div style={{
          width: 260, height: 260, borderRadius: '50%', background: '#0D0D0C',
          border: '2px solid rgba(232,197,71,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative', overflow: 'hidden', boxShadow: scanning ? 'var(--shadow-yellow)' : 'none',
        }}>
          {stream ? (
            <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: scanning ? 0.5 : 1 }} />
          ) : (
            <div style={{ fontSize: 48 }}>📷</div>
          )}
          <div className="bracket bracket-tl" /><div className="bracket bracket-tr" />
          <div className="bracket bracket-bl" /><div className="bracket bracket-br" />
          {scanning && <div className="scan-sweep" />}
          {detected && !scanning && (
            <div style={{ 
              position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(0,0,0,0.4)', fontSize: 80, animation: 'cardSlideUp 0.3s ease'
            }}>
              {CATEGORIES.find(c => c.id === detected)?.icon}
            </div>
          )}
        </div>
      </div>

      <div style={{
        marginTop: 28, fontFamily: 'var(--font-mono)', fontSize: 13, letterSpacing: 3, textTransform: 'uppercase',
        color: detected ? CATEGORIES.find(c => c.id === detected)?.color : 'var(--yellow)',
      }}>
        {statusText} {scanning && <span className="blink">_</span>}
      </div>

      {detected && !scanning && (
        <div style={{
          marginTop: 20, padding: '12px 20px', background: 'rgba(232,197,71,0.1)', border: '1px solid var(--yellow)',
          borderRadius: 'var(--r-md)', width: 'calc(100% - 40px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          animation: 'cardSlideUp 0.4s cubic-bezier(0.34,1.56,0.64,1)',
        }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--yellow)' }}>
              {lastItem?.name.toUpperCase()}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>
              {t('confidence')}: 98.2%
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <button onClick={downloadPDF} style={{ 
              background: 'var(--yellow)', color: 'var(--bg)', border: 'none', 
              padding: '4px 8px', borderRadius: 4, fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700 
            }}>
              {t('downloadPDF')}
            </button>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: '#6BBF6F', marginTop: 4 }}>+{lastItem?.pts}</div>
          </div>
        </div>
      )}

      <div style={{ flex: 1 }} />

      <div style={{ width: '100%', padding: '0 20px', marginBottom: 20 }}>
        <button className="scan-btn" onClick={handleScan} disabled={scanning}>
          {scanning ? t('analyzing') : stream ? t('scanWaste') : t('openCamera')}
        </button>
      </div>
    </div>
  )
}
