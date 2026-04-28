import { useState } from 'react'

const tabs = [
  { id: 'dashboard', icon: '⬡', label: 'Home' },
  { id: 'map',       icon: '◎', label: 'Map'  },
  { id: 'camera',    icon: '◉', label: 'Scan', isFab: true },
  { id: 'rewards',   icon: '◆', label: 'Coins' },
  { id: 'profile',   icon: '◈', label: 'Me'   },
]

export default function BottomNav({ active, onChange }) {
  return (
    <nav className="bottom-nav">
      {tabs.map(tab => {
        if (tab.isFab) {
          return (
            <button
              key={tab.id}
              className={`nav-fab ${active === tab.id ? 'active' : ''}`}
              onClick={() => onChange(tab.id)}
              title="Scan"
            >
              📷
            </button>
          )
        }
        return (
          <button
            key={tab.id}
            className={`nav-item ${active === tab.id ? 'active' : ''}`}
            onClick={() => onChange(tab.id)}
          >
            <span className="nav-icon">{tab.icon}</span>
            <span className="nav-label">{tab.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
