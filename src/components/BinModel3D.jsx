import { useRef, useEffect, useState } from 'react'
import * as THREE from 'three'

function Fallback3D() {
  return (
    <div style={{
      width: '100%', height: 220,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(ellipse at center, #2A2A28 0%, #1A1A18 100%)',
      borderRadius: 12,
      position: 'relative', overflow: 'hidden',
    }}>
      {/* CSS 3D bin fallback */}
      <div style={{ position: 'relative', animation: 'binFloat 3s ease-in-out infinite' }}>
        {/* Bin body */}
        <div style={{
          width: 80, height: 100,
          background: 'linear-gradient(160deg, #2A2A28 0%, #1A1A18 100%)',
          borderRadius: '8px 8px 12px 12px',
          border: '1.5px solid #333',
          position: 'relative', overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        }}>
          {/* Compartments */}
          {[
            { color: '#E8C547', label: 'DRY',   top: 0 },
            { color: '#4A7C4E', label: 'WET',   top: 33 },
            { color: '#3A5A8C', label: 'METAL', top: 66 },
          ].map(c => (
            <div key={c.label} style={{
              position: 'absolute', left: 0, right: 0,
              top: `${c.top}%`, height: '33.3%',
              background: `${c.color}22`,
              borderBottom: `1px solid ${c.color}55`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{
                fontFamily: 'DM Mono, monospace', fontSize: 8,
                color: c.color, letterSpacing: 1, textTransform: 'uppercase',
              }}>{c.label}</span>
            </div>
          ))}

          {/* Glow strips */}
          <div style={{ position: 'absolute', left: 0, right: 0, top: '33%', height: 2, background: '#E8C547', opacity: 0.6, boxShadow: '0 0 8px #E8C547' }} />
          <div style={{ position: 'absolute', left: 0, right: 0, top: '66%', height: 2, background: '#4A7C4E', opacity: 0.6, boxShadow: '0 0 8px #4A7C4E' }} />
        </div>
        {/* Lid */}
        <div style={{
          width: 88, height: 14, marginLeft: -4, marginTop: -2,
          background: '#2A2A28', border: '1.5px solid #333',
          borderRadius: '6px 6px 0 0',
          boxShadow: '0 -4px 12px rgba(0,0,0,0.3)',
        }} />
        {/* Handle */}
        <div style={{
          width: 20, height: 8, marginLeft: 30, marginTop: -2,
          background: '#333', borderRadius: '4px 4px 0 0',
        }} />
      </div>

      {/* Ambient glow circles */}
      <div style={{
        position: 'absolute', width: 120, height: 120, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(232,197,71,0.06) 0%, transparent 70%)',
        animation: 'glowPulse 2s ease-in-out infinite',
      }} />

      <style>{`
        @keyframes binFloat {
          0%, 100% { transform: translateY(0) rotateY(0deg); }
          25%       { transform: translateY(-8px) rotateY(10deg); }
          50%       { transform: translateY(-4px) rotateY(0deg); }
          75%       { transform: translateY(-8px) rotateY(-10deg); }
        }
        @keyframes glowPulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50%       { opacity: 1; transform: scale(1.3); }
        }
      `}</style>
    </div>
  )
}

export default function BinModel3D() {
  const mountRef = useRef(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (failed) return
    const mount = mountRef.current
    if (!mount) return

    let renderer, frame

    try {
      const W = mount.clientWidth || 350
      const H = 220

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'default' })
      renderer.setSize(W, H)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      mount.appendChild(renderer.domElement)

      // Context loss recovery
      renderer.domElement.addEventListener('webglcontextlost', (e) => {
        e.preventDefault()
        setFailed(true)
      })

      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(40, W / H, 0.1, 100)
      camera.position.set(0, 1.2, 5)
      camera.lookAt(0, 0.5, 0)

      scene.add(new THREE.AmbientLight(0xffffff, 0.5))
      const keyLight = new THREE.DirectionalLight(0xE8C547, 1.5)
      keyLight.position.set(2, 4, 3)
      scene.add(keyLight)
      const fillLight = new THREE.DirectionalLight(0x3A5A8C, 0.8)
      fillLight.position.set(-3, 2, -1)
      scene.add(fillLight)

      const bodyMat   = new THREE.MeshStandardMaterial({ color: 0x2A2A28, metalness: 0.6, roughness: 0.4 })
      const dryMat    = new THREE.MeshStandardMaterial({ color: 0xE8C547, metalness: 0.3, roughness: 0.5, emissive: 0xE8C547, emissiveIntensity: 0.25 })
      const wetMat    = new THREE.MeshStandardMaterial({ color: 0x4A7C4E, metalness: 0.3, roughness: 0.5, emissive: 0x4A7C4E, emissiveIntensity: 0.25 })
      const metalMat2 = new THREE.MeshStandardMaterial({ color: 0x3A5A8C, metalness: 0.8, roughness: 0.2, emissive: 0x3A5A8C, emissiveIntensity: 0.25 })

      const binGroup = new THREE.Group()

      // Body
      binGroup.add(Object.assign(new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.55, 2.2, 32), bodyMat), { position: { x: 0, y: 1.1, z: 0 } }))
      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.55, 2.2, 32), bodyMat)
      body.position.y = 1.1
      binGroup.add(body)

      // Lid
      const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.72, 0.15, 32), bodyMat)
      lid.position.y = 2.27
      binGroup.add(lid)

      // Handle
      const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.35, 16), new THREE.MeshStandardMaterial({ color: 0x444440, metalness: 0.9 }))
      handle.position.y = 2.52
      binGroup.add(handle)

      // Compartments
      const compartments = [
        { mat: dryMat,    y: 0.45 },
        { mat: wetMat,    y: 1.05 },
        { mat: metalMat2, y: 1.65 },
      ]
      compartments.forEach(({ mat, y }) => {
        const mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.705, 0.55, 32), mat)
        mesh.position.y = y
        binGroup.add(mesh)
        const ring = new THREE.Mesh(new THREE.TorusGeometry(0.71, 0.025, 8, 48), mat)
        ring.position.y = y + 0.275
        ring.rotation.x = Math.PI / 2
        binGroup.add(ring)
      })

      // Base
      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 0.12, 32), new THREE.MeshStandardMaterial({ color: 0x111110, metalness: 0.9 }))
      base.position.y = 0.06
      binGroup.add(base)

      binGroup.position.y = -0.5
      scene.add(binGroup)

      // Point lights
      const ptY = new THREE.PointLight(0xE8C547, 2, 3); ptY.position.set(0, 0.45, 1.2); scene.add(ptY)
      const ptG = new THREE.PointLight(0x4A7C4E, 2, 3); ptG.position.set(0, 1.05, 1.2); scene.add(ptG)
      const ptB = new THREE.PointLight(0x3A5A8C, 2, 3); ptB.position.set(0, 1.65, 1.2); scene.add(ptB)

      const clock = new THREE.Clock()
      function animate() {
        frame = requestAnimationFrame(animate)
        const t = clock.getElapsedTime()
        binGroup.rotation.y = t * 0.4
        binGroup.position.y = -0.5 + Math.sin(t * 0.8) * 0.05
        ptY.intensity = 1.5 + Math.sin(t * 2) * 0.5
        ptG.intensity = 1.5 + Math.sin(t * 2 + 2) * 0.5
        ptB.intensity = 1.5 + Math.sin(t * 2 + 4) * 0.5
        renderer.render(scene, camera)
      }
      animate()

    } catch (e) {
      console.warn('WebGL init failed, using CSS fallback:', e.message)
      setFailed(true)
    }

    return () => {
      cancelAnimationFrame(frame)
      try {
        renderer?.dispose()
        if (mount && renderer?.domElement && mount.contains(renderer.domElement)) {
          mount.removeChild(renderer.domElement)
        }
      } catch (_) {}
    }
  }, [failed])

  if (failed) return <Fallback3D />

  return (
    <div
      ref={mountRef}
      style={{ width: '100%', height: 220, borderRadius: 12, overflow: 'hidden' }}
    />
  )
}
