import { useState } from 'react'
import ParticlesBg from './components/ParticlesBg'
import BottomNav from './components/BottomNav'
import ErrorBoundary from './components/ErrorBoundary'
import Dashboard from './screens/Dashboard'
import CameraScreen from './screens/Camera'
import Profile from './screens/Profile'
import Alerts from './screens/Alerts'
import MapScreen from './screens/MapScreen'
import Rewards from './screens/Rewards'
import AuthScreen from './screens/Auth'
import { AppProvider, useApp } from './context/AppContext'

function AppContent() {
  const { user } = useApp()
  const [activeTab, setActiveTab] = useState('dashboard')

  if (!user) {
    return <AuthScreen />
  }

  const renderScreen = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard key="dashboard" onBell={() => setActiveTab('alerts')} />
      case 'camera':    return <CameraScreen key="camera" />
      case 'profile':   return <Profile key="profile" />
      case 'alerts':    return <Alerts key="alerts" />
      case 'map':       return <MapScreen key="map" />
      case 'rewards':   return <Rewards key="rewards" />
      default:          return <Dashboard key="dashboard" onBell={() => setActiveTab('alerts')} />
    }
  }

  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', width: '100vw' }}>
      {/* Ambient desktop background */}
      <div style={{
        position: 'fixed', inset: 0,
        background: 'radial-gradient(ellipse at 30% 50%, rgba(232,197,71,0.05) 0%, transparent 60%), radial-gradient(ellipse at 70% 50%, rgba(196,98,45,0.05) 0%, transparent 60%)',
        pointerEvents: 'none',
      }} />

      {/* Team credit */}
      <div style={{
        position: 'fixed', bottom: 16, left: '50%', transform: 'translateX(-50%)',
        fontFamily: 'DM Mono, monospace', fontSize: 9, color: 'rgba(255,255,255,0.12)',
        textTransform: 'uppercase', letterSpacing: 4, whiteSpace: 'nowrap',
        pointerEvents: 'none',
      }}>
        SmartBin · AI Waste Management · Team Leavron
      </div>

      {/* Phone shell */}
      <div className="phone-shell">
        <ParticlesBg />
        <div className="texture" style={{ zIndex: 0 }} />

        <ErrorBoundary fallback={<div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E8C547' }}>⚠ Reload to continue</div>}>
          {renderScreen()}
        </ErrorBoundary>

        <BottomNav active={activeTab} onChange={setActiveTab} />
      </div>
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}
