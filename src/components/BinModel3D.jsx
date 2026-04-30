import { useRef, useEffect, useState } from 'react'
import * as THREE from 'three'

// Functional points for annotations
const POINTS = [
  { id: 'lid',   pos: [0, 2.5, 0], label: '1. TOP LID', desc: 'Ultrasonic + Servo: Opens when user approaches' },
  { id: 'cam',   pos: [0, 1.8, 0], label: '2. DETECTION', desc: 'ESP32 Cam + Sensors (Moisture, IR): Analyzes waste' },
  { id: 'pipes', pos: [0, 1.1, 0], label: '3. SEGREGATOR', desc: 'Servo Trapdoor + Tubes: Routes waste to boxes' },
  { id: 'bins',  pos: [0, 0.4, 0], label: '4. STORAGE', desc: 'Separate Boxes: Metal, Dry, and Wet waste' },
]

export default function BinModel3D() {
  const mountRef = useRef(null)
  const [activePoint, setActivePoint] = useState(POINTS[0])

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const W = mount.clientWidth
    const H = 220

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(W, H)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    mount.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(40, W / H, 0.1, 100)
    camera.position.set(4, 3, 6)
    camera.lookAt(0, 1.2, 0)

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.4))
    const spotlight = new THREE.SpotLight(0xE8C547, 2.5)
    spotlight.position.set(5, 5, 5)
    scene.add(spotlight)

    const shellMat = new THREE.MeshStandardMaterial({ 
      color: 0x2A2A28, transparent: true, opacity: 0.3, metalness: 0.8, roughness: 0.2, side: THREE.DoubleSide 
    })
    const internalMat = new THREE.MeshStandardMaterial({ color: 0x444440, metalness: 0.9, roughness: 0.1 })
    const pipeMat = new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 1, roughness: 0 })

    const binGroup = new THREE.Group()

    // ─── 4 COMPARTMENTS ───

    // 1. Storage (Bottom)
    const storageBox = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.8, 1.6), shellMat)
    storageBox.position.y = 0.4
    binGroup.add(storageBox)
    
    // Internal Bin Boxes
    const colors = [0x3A5A8C, 0xE8C547, 0x4A7C4E] // Metal, Dry, Wet
    colors.forEach((col, i) => {
      const box = new THREE.Mesh(
        new THREE.BoxGeometry(0.45, 0.6, 1.4), 
        new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 0.4 })
      )
      box.position.set((i - 1) * 0.5, 0.4, 0)
      binGroup.add(box)
    })

    // 2. Segregator (Tubes)
    const segregatorBox = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.8, 1.6), shellMat)
    segregatorBox.position.y = 1.2
    binGroup.add(segregatorBox)

    // Tubes
    for(let i=-1; i<=1; i++) {
      const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.8, 16), pipeMat)
      tube.position.set(i * 0.5, 1.2, 0)
      tube.rotation.z = i * 0.3 // slant towards boxes
      binGroup.add(tube)
    }

    // 3. Detection Chamber
    const detectionBox = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.8, 1.6), shellMat)
    detectionBox.position.y = 2.0
    binGroup.add(detectionBox)

    // ESP32 Cam Model (Small Box)
    const cam = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.2), new THREE.MeshStandardMaterial({ color: 0x00ff00 }))
    cam.position.set(0, 2.3, 0.6)
    binGroup.add(cam)

    // Trapdoor Servo
    const trapdoor = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.05, 1.4), internalMat)
    trapdoor.position.y = 1.6
    binGroup.add(trapdoor)

    // 4. Top Lid
    const lidBase = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.2, 1.6), internalMat)
    lidBase.position.y = 2.4
    binGroup.add(lidBase)

    const mainLid = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.1, 1.6), new THREE.MeshStandardMaterial({ color: 0xE8C547 }))
    mainLid.position.set(0, 2.5, 0)
    binGroup.add(mainLid)

    // Ultrasonic sensor (Two eyes)
    const eyeGeom = new THREE.CylinderGeometry(0.08, 0.08, 0.15, 16)
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 1 })
    const eye1 = new THREE.Mesh(eyeGeom, eyeMat); eye1.position.set(-0.15, 2.6, 0.8); eye1.rotation.x = Math.PI/2; binGroup.add(eye1)
    const eye2 = new THREE.Mesh(eyeGeom, eyeMat); eye2.position.set(0.15, 2.6, 0.8); eye2.rotation.x = Math.PI/2; binGroup.add(eye2)

    scene.add(binGroup)

    // Animation Loop
    const clock = new THREE.Clock()
    let frame
    function animate() {
      frame = requestAnimationFrame(animate)
      const t = clock.getElapsedTime()
      
      binGroup.rotation.y = t * 0.2
      
      // Animate Lid opening
      mainLid.rotation.x = -Math.abs(Math.sin(t * 0.5)) * 1.2
      mainLid.position.y = 2.5 + Math.abs(Math.sin(t * 0.5)) * 0.5
      mainLid.position.z = -Math.abs(Math.sin(t * 0.5)) * 0.5

      // Animate Trapdoor
      trapdoor.rotation.z = Math.sin(t * 2) * 0.2
      
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(frame)
      renderer.dispose()
      mount.removeChild(renderer.domElement)
    }
  }, [])

  return (
    <div style={{ position: 'relative', width: '100%', height: 320, background: 'var(--card-dark)', borderRadius: 16, border: '1px solid var(--border)' }}>
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
      
      {/* Overlays for explanation */}
      <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', flexDirection: 'column', gap: 6, width: 140 }}>
        {POINTS.map(p => (
          <button 
            key={p.id}
            onClick={() => setActivePoint(p)}
            style={{ 
              background: activePoint.id === p.id ? 'var(--yellow)' : 'rgba(255,255,255,0.05)',
              color: activePoint.id === p.id ? 'var(--bg)' : 'var(--text-muted)',
              border: 'none', padding: '4px 8px', borderRadius: 4,
              fontSize: 9, fontFamily: 'var(--font-mono)', textAlign: 'left',
              transition: 'all 0.2s', cursor: 'pointer'
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div style={{ 
        position: 'absolute', bottom: 12, left: 12, right: 12, 
        background: 'rgba(0,0,0,0.8)', padding: '10px 14px', borderRadius: 8,
        border: '1px solid var(--yellow)', backdropFilter: 'blur(10px)',
        animation: 'fadeIn 0.3s ease'
      }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, color: 'var(--yellow)', letterSpacing: 1 }}>{activePoint.label}</div>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--text-light)', marginTop: 4, lineHeight: 1.4 }}>{activePoint.desc}</div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  )
}
