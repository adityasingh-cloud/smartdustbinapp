import React, { useState, useEffect, useRef } from 'react';
import FaceIDScreen from './FaceIDScreen';
import { useApp } from '../context/AppContext';

export default function FaceRecognitionPage() {
  const { user } = useApp();
  const [showScanner, setShowScanner] = useState(false);
  const [mode, setMode] = useState('setup'); // 'setup' or 'login'
  const [logs, setLogs] = useState([]);

  const addLog = (msg) => {
    setLogs(prev => [msg, ...prev.slice(0, 9)]);
  };

  const handleSuccess = (data) => {
    addLog(`Success: ${typeof data === 'string' ? 'Photo uploaded' : 'Face verified'}`);
    setShowScanner(false);
  };

  return (
    <div style={{ padding: 20, minHeight: '100vh', background: '#121212', color: '#fff' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, marginBottom: 20 }}>FACE RECOGNITION DEBUG</h1>
      
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <button 
          onClick={() => { setMode('setup'); setShowScanner(true); }}
          className="scan-btn" style={{ flex: 1 }}
        >
          TEST SETUP MODE
        </button>
        <button 
          onClick={() => { setMode('login'); setShowScanner(true); }}
          className="scan-btn" style={{ flex: 1, background: '#4CAF50' }}
        >
          TEST LOGIN MODE
        </button>
      </div>

      <div className="card" style={{ padding: 20 }}>
        <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--yellow)' }}>STATUS LOGS</h3>
        <div style={{ marginTop: 10, background: '#000', padding: 10, borderRadius: 8, height: 200, overflowY: 'auto' }}>
          {logs.map((log, i) => (
            <div key={i} style={{ fontFamily: 'var(--font-mono)', fontSize: 12, marginBottom: 4, color: '#0f0' }}>
              &gt; {log}
            </div>
          ))}
          {logs.length === 0 && <div style={{ opacity: 0.5 }}>No logs yet...</div>}
        </div>
      </div>

      <div style={{ marginTop: 20 }}>
        <p>User State: {user ? `LoggedIn as ${user.email}` : 'Not Logged In'}</p>
        <p>Face ID Enabled: {user?.face_id_enabled ? 'YES' : 'NO'}</p>
      </div>

      {showScanner && (
        <FaceIDScreen 
          mode={mode}
          onClose={() => setShowScanner(false)}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}
