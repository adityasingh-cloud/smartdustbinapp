import { useRef, useEffect, useState, useMemo } from 'react'
import * as THREE from 'three'

const POINTS = [
  { id: 'lid',   cam: [0, 3, 4], target: [0, 2.5, 0], label: '1. TOP LID', desc: 'Ultrasonic + Dual Servo: Opens on proximity detection.' },
  { id: 'det',   cam: [0, 2, 4], target: [0, 1.8, 0], label: '2. DETECTION', desc: 'ESP32 Cam + 2x ESP32 + IR/Moisture/Prox Sensors + Servo Trapdoor.' },
  { id: 'seg',   cam: [0, 1, 4], target: [0, 1.1, 0], label: '3. SEGREGATOR', desc: 'Gravity Distribution Pipes: Routes waste to targets.' },
  { id: 'bin',   cam: [0, 0, 4], target: [0, 0.4, 0], label: '4. STORAGE', desc: 'Vertical partitioned boxes for Metal, Dry, and Wet waste.' },
]

export default function BinModel3D() {
  const mountRef = useRef(null)
  const [activePoint, setActivePoint] = useState(POINTS[0])
  const [demoState, setDemoState] = useState('idle') // idle | scanning | segregating | error
  const alarmAudio = useMemo(() => new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3'), [])

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const W = mount.clientWidth, H = 320
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(W, H)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    mount.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(40, W / H, 0.1, 100)
    camera.position.set(0, 3, 6)

    scene.add(new THREE.AmbientLight(0xffffff, 0.5))
    const spotlight = new THREE.PointLight(0xE8C547, 5, 10)
    spotlight.position.set(2, 4, 3)
    scene.add(spotlight)

    const binGroup = new THREE.Group()
    const shellMat = new THREE.MeshStandardMaterial({ color: 0x2A2A28, transparent: true, opacity: 0.2, side: THREE.DoubleSide })
    const compMat  = new THREE.MeshStandardMaterial({ color: 0x444440 })

    // ─── MODELING ───

    // 1. STORAGE (BOTTOM)
    const storage = new THREE.Group(); storage.position.y = 0.4
    const colors = [0x3A5A8C, 0xE8C547, 0x4A7C4E]
    colors.forEach((col, i) => {
      const b = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.6, 1.2), new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 0.3 }))
      b.position.x = (i - 1) * 0.5
      storage.add(b)
    })
    binGroup.add(storage)

    // 2. SEGREGATOR (PIPES)
    const pipes = new THREE.Group(); pipes.position.y = 1.1
    for(let i=-1; i<=1; i++) {
      const p = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.8), new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 1 }))
      p.position.x = i * 0.45; p.rotation.z = i * 0.3; pipes.add(p)
    }
    binGroup.add(pipes)

    // 3. DETECTION CHAMBER (COMPLEX)
    const det = new THREE.Group(); det.position.y = 1.8
    const base = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.1, 1.5), compMat); det.add(base)
    
    // Detailed Internal Hardware
    const hwGroup = new THREE.Group()
    // Microcontrollers (2x ESP32)
    const espGeom = new THREE.BoxGeometry(0.2, 0.05, 0.3)
    const espMat = new THREE.MeshStandardMaterial({ color: 0x111111 })
    const esp1 = new THREE.Mesh(espGeom, espMat); esp1.position.set(-0.5, 0.1, -0.4); hwGroup.add(esp1)
    const esp2 = new THREE.Mesh(espGeom, espMat); esp2.position.set(-0.5, 0.1, 0); hwGroup.add(esp2)
    
    // ESP32 CAM
    const cam = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.15, 0.15), new THREE.MeshStandardMaterial({ color: 0x00ff00 }))
    cam.position.set(0, 0.5, 0.5); hwGroup.add(cam)

    // Sensors (IR, Moisture, Prox)
    const sensGeom = new THREE.CylinderGeometry(0.05, 0.05, 0.1)
    const ir = new THREE.Mesh(sensGeom, new THREE.MeshStandardMaterial({ color: 0xff0000 })); ir.position.set(0.5, 0.1, -0.3); hwGroup.add(ir)
    const moist = new THREE.Mesh(sensGeom, new THREE.MeshStandardMaterial({ color: 0x0000ff })); moist.position.set(0.5, 0.1, 0); hwGroup.add(moist)
    const prox = new THREE.Mesh(sensGeom, new THREE.MeshStandardMaterial({ color: 0xffff00 })); prox.position.set(0.5, 0.1, 0.3); hwGroup.add(prox)

    // Servo
    const servo = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.15, 0.1), new THREE.MeshStandardMaterial({ color: 0x222222 }))
    servo.position.set(0, 0.1, -0.5); hwGroup.add(servo)

    det.add(hwGroup)
    
    // Trapdoor
    const trap = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.05, 1.2), compMat)
    trap.position.y = -0.1
    det.add(trap)
    binGroup.add(det)

    // 4. LID
    const lid = new THREE.Group(); lid.position.y = 2.5
    const lidTop = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.1, 1.6), new THREE.MeshStandardMaterial({ color: 0xE8C547 }))
    lid.add(lidTop)
    binGroup.add(lid)

    scene.add(binGroup)

    // ─── ANIMATION & INTERACTION ───
    const clock = new THREE.Clock()
    let frame
    const currentTarget = new THREE.Vector3(0, 1.2, 0)
    const desiredCam = new THREE.Vector3(0, 3, 6)

    function animate() {
      frame = requestAnimationFrame(animate)
      const t = clock.getElapsedTime()

      // Camera Smoothing
      desiredCam.set(...activePoint.cam)
      currentTarget.lerp(new THREE.Vector3(...activePoint.target), 0.05)
      camera.position.lerp(desiredCam, 0.05)
      camera.lookAt(currentTarget)

      // Idle Rotation (Slow)
      binGroup.rotation.y = t * 0.1

      // Lid Oscillation
      lidTop.rotation.x = -Math.abs(Math.sin(t * 0.5)) * 0.4
      
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(frame)
      renderer.dispose()
      mount.removeChild(renderer.domElement)
    }
  }, [activePoint])

  const runDemo = async (type = 'normal') => {
    setDemoState('scanning')
    setActivePoint(POINTS[1]) // Zoom to detection
    
    await new Promise(r => setTimeout(r, 2000))
    
    if (type === 'mixed') {
      setDemoState('error')
      alarmAudio.play()
      setTimeout(() => { setDemoState('idle'); alarmAudio.pause(); alarmAudio.currentTime = 0; }, 3000)
    } else {
      setDemoState('segregating')
      setActivePoint(POINTS[2]) // Zoom to segregator
      await new Promise(r => setTimeout(r, 2000))
      setDemoState('idle')
      setActivePoint(POINTS[0])
    }
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: 350, background: 'var(--card-dark)', borderRadius: 16, overflow: 'hidden', border: '1px solid var(--border)' }}>
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
      
      {/* Simulation Controls */}
      <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 8 }}>
        <button onClick={() => runDemo('normal')} className="scan-btn" style={{ height: 32, fontSize: 9, width: 'auto', padding: '0 12px' }}>
          DEMO: SEGREGATE ♻️
        </button>
        <button onClick={() => runDemo('mixed')} className="scan-btn" style={{ height: 32, fontSize: 9, width: 'auto', padding: '0 12px', background: '#E85454' }}>
          DEMO: MIXED WASTE 🚨
        </button>
      </div>

      {/* Compartment Selector */}
      <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', flexDirection: 'column', gap: 6, width: 140 }}>
        {POINTS.map(p => (
          <button 
            key={p.id}
            onClick={() => setActivePoint(p)}
            style={{ 
              background: activePoint.id === p.id ? 'var(--yellow)' : 'rgba(255,255,255,0.05)',
              color: activePoint.id === p.id ? 'var(--bg)' : 'var(--text-muted)',
              border: 'none', padding: '6px 10px', borderRadius: 4,
              fontSize: 9, fontFamily: 'var(--font-mono)', textAlign: 'left',
              transition: 'all 0.2s', cursor: 'pointer', borderLeft: activePoint.id === p.id ? '4px solid var(--bg)' : 'none'
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Info Panel */}
      <div style={{ 
        position: 'absolute', bottom: 12, left: 12, right: 12, 
        background: demoState === 'error' ? 'rgba(232, 84, 84, 0.9)' : 'rgba(0,0,0,0.85)', 
        padding: '12px 16px', borderRadius: 10,
        border: `1px solid ${demoState === 'error' ? '#fff' : 'var(--yellow)'}`, 
        backdropFilter: 'blur(10px)', transition: 'all 0.3s'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, color: demoState === 'error' ? '#fff' : 'var(--yellow)', letterSpacing: 1 }}>
            {demoState === 'scanning' ? '🔍 ANALYZING WASTE...' : 
             demoState === 'segregating' ? '🛤️ ROUTING TO BIN...' : 
             demoState === 'error' ? '⚠️ ALARM: UNKNOWN WASTE DETECTED!' :
             activePoint.label}
          </div>
          {demoState === 'idle' && <div style={{ fontSize: 10, opacity: 0.5, fontFamily: 'var(--font-mono)' }}>CLICK TO EXPLORE</div>}
        </div>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: '#fff', marginTop: 6, lineHeight: 1.5, opacity: 0.9 }}>
          {demoState === 'error' ? 'Multiple/Non-detectable items found. Please remove and scan separately.' : activePoint.desc}
        </div>
      </div>

      <style>{`
        @keyframes scanPulse { 0% { opacity: 0.4; } 50% { opacity: 1; } 100% { opacity: 0.4; } }
      `}</style>
    </div>
  )
}

