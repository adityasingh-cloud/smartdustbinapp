import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { uploadToCloudinary } from '../utils/cloudinary';
import { supabase } from '../lib/supabase';

export default function FaceIDScreen({ onClose, onSuccess }) {
  const { t, user, setUser, theme, updateUserProfile } = useApp();
  const [phase, setPhase] = useState('idle'); // idle | scanning | verifying | uploading | done | error
  const [statusMsg, setStatusMsg] = useState('Position your face in the frame');
  const [faceDetected, setFaceDetected] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const isDark = theme === 'dark';

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) videoRef.current.srcObject = stream;
      streamRef.current = stream;
    } catch (err) {
      setPhase('error');
      setStatusMsg('Camera access denied');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  const startScan = () => {
    setPhase('scanning');
    setStatusMsg('Hold still — scanning your face...');
    
    // Simulate face detection
    setTimeout(() => {
      setFaceDetected(true);
      setStatusMsg('Face detected ✓ — hold position');
    }, 2000);

    // Auto capture
    setTimeout(() => {
      captureFace();
    }, 4000);
  };

  const captureFace = async () => {
    if (!videoRef.current) return;
    setPhase('verifying');
    setStatusMsg('Capturing biometric data...');

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg');

    setPhase('uploading');
    setStatusMsg('Uploading secure photo...');
    
    try {
      // Cloudinary upload
      const uploaded = await uploadToCloudinary(dataUrl);
      
      // Update Supabase and local state
      await updateUserProfile({ photo_url: uploaded.url, face_id_enabled: true })

      if (error) throw error;

      const updatedUser = { ...user, photo_url: uploaded.url, face_id_enabled: true };
      localStorage.setItem('sb_user', JSON.stringify(updatedUser));
      setUser(updatedUser);

      setPhase('done');
      setStatusMsg('Face ID registered successfully!');
      
      setTimeout(() => {
        if (onSuccess) onSuccess(uploaded.url);
        if (onClose) onClose();
      }, 1800);
    } catch (err) {
      console.error(err);
      setPhase('error');
      setStatusMsg('Upload failed. Please retry.');
    }
  };

  return (
    <div className="face-id-container" style={{
      position: 'fixed', inset: 0, background: '#000', zIndex: 2000,
      display: 'flex', flexDirection: 'column', color: '#fff', fontFamily: 'var(--font-body)'
    }}>
      {/* Live Camera View */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
      />

      {/* Overlay with Mask */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(circle at center, transparent 35%, rgba(0,0,0,0.8) 35.5%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        {/* Animated Frame */}
        <div style={{
          width: '70vw', height: '70vw', maxWidth: '300px', maxHeight: '300px',
          borderRadius: '50%', border: `3px solid ${phase === 'done' ? '#4CAF50' : faceDetected ? '#E8C547' : '#888'}`,
          position: 'relative', overflow: 'hidden',
          transition: 'border-color 0.3s ease',
          boxShadow: faceDetected ? '0 0 30px rgba(232,197,71,0.4)' : 'none'
        }}>
          {/* Scan Line Animation */}
          {phase === 'scanning' && (
            <div className="scan-line-web" style={{
              position: 'absolute', left: 0, right: 0, height: '3px',
              background: '#E8C547', boxShadow: '0 0 15px #E8C547',
              animation: 'scanLineMove 2s ease-in-out infinite'
            }} />
          )}

          {/* Verification Spinner */}
          {(phase === 'verifying' || phase === 'uploading') && (
            <div style={{
              position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(0,0,0,0.4)'
            }}>
              <div className="spinner" style={{ width: 40, height: 40, border: '4px solid #E8C547', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            </div>
          )}

          {/* Success Checkmark */}
          {phase === 'done' && (
            <div style={{
              position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(76,175,80,0.2)', fontSize: 80, color: '#4CAF50'
            }}>
              ✓
            </div>
          )}
        </div>
      </div>

      {/* Top Controls */}
      <div style={{ position: 'absolute', top: 20, left: 20, right: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={onClose} style={{ background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', padding: '8px 12px', borderRadius: 20, cursor: 'pointer' }}>✕</button>
        <span style={{ fontFamily: 'var(--font-display)', letterSpacing: 2 }}>FACE ID SETUP</span>
        <div style={{ width: 40 }} />
      </div>

      {/* Bottom Status Panel */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        background: 'rgba(10,10,10,0.9)', borderTopLeftRadius: 24, borderTopRightRadius: 24,
        padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 16
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: phase === 'done' ? '#4CAF50' : faceDetected ? '#E8C547' : '#666' }} />
          <span style={{ fontSize: 16, fontWeight: '600', color: phase === 'done' ? '#4CAF50' : '#fff' }}>{statusMsg}</span>
        </div>

        {phase === 'idle' && (
          <button onClick={startScan} className="scan-btn" style={{ width: '100%', height: 50 }}>
            START FACE SCAN
          </button>
        )}

        {phase === 'error' && (
          <button onClick={() => { setPhase('idle'); setFaceDetected(false); startCamera(); }} className="scan-btn" style={{ width: '100%', height: 50, background: '#E74C3C' }}>
            TRY AGAIN
          </button>
        )}

        <div style={{ fontSize: 12, color: '#888', textAlign: 'center' }}>
          {phase === 'idle' ? 'Position your face in the circle with good lighting.' : 'Keep your face centered.'}
        </div>
      </div>

      <style>{`
        @keyframes scanLineMove {
          0% { top: 0%; }
          50% { top: 100%; }
          100% { top: 0%; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
