import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { uploadToCloudinary } from '../utils/cloudinary';
import { supabase } from '../lib/supabase';

export default function FaceIDScreen({ onClose, onSuccess, targetUid, mode = 'setup' }) {
  const { t, user, setUser, theme } = useApp();
  const [phase, setPhase] = useState('loading'); // loading | idle | scanning | verifying | done | error
  const [statusMsg, setStatusMsg] = useState('Initializing Face AI...');
  const [faceDetected, setFaceDetected] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const detectionInterval = useRef(null);

  useEffect(() => {
    loadModels();
    return () => {
      stopCamera();
      if (detectionInterval.current) clearInterval(detectionInterval.current);
    };
  }, []);

  const loadModels = async () => {
    try {
      if (!window.faceapi) {
        throw new Error('Face API not loaded. Check index.html');
      }
      const MODEL_URL = '/models';
      await Promise.all([
        window.faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        window.faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        window.faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        window.faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
      ]);
      setModelsLoaded(true);
      setPhase('idle');
      setStatusMsg('Position your face in the frame');
      startCamera();
    } catch (err) {
      console.error('Model load error:', err);
      setPhase('error');
      setStatusMsg('Failed to load Face AI models');
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onplay = () => startDetection();
      }
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

  const startDetection = () => {
    if (detectionInterval.current) clearInterval(detectionInterval.current);
    
    detectionInterval.current = setInterval(async () => {
      if (!videoRef.current || phase === 'done' || phase === 'verifying') return;

      const detection = await window.faceapi.detectSingleFace(
        videoRef.current, 
        new window.faceapi.TinyFaceDetectorOptions()
      ).withFaceLandmarks();

      if (detection) {
        if (!faceDetected) setFaceDetected(true);
      } else {
        if (faceDetected) setFaceDetected(false);
      }
    }, 500);
  };

  const startScan = async () => {
    if (!faceDetected) {
      setStatusMsg('No face detected. Please center your face.');
      return;
    }

    setPhase('scanning');
    setStatusMsg(mode === 'setup' ? 'Capturing biometrics...' : 'Verifying identity...');
    
    // Give it a second to "scan"
    setTimeout(() => {
      captureAndVerify();
    }, 2000);
  };

  const captureAndVerify = async () => {
    if (!videoRef.current) return;
    setPhase('verifying');

    try {
      const detection = await window.faceapi.detectSingleFace(
        videoRef.current, 
        new window.faceapi.SsdMobilenetv1Options()
      ).withFaceLandmarks().withFaceDescriptor();

      if (!detection) {
        throw new Error('Lost face tracking. Try again.');
      }

      if (mode === 'setup') {
        await handleSetup(detection.descriptor);
      } else {
        await handleLogin(detection.descriptor);
      }
    } catch (err) {
      console.error(err);
      setPhase('error');
      setStatusMsg(err.message || 'Verification failed');
    }
  };

  const handleSetup = async (descriptor) => {
    setStatusMsg('Saving secure profile...');
    
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg');

    const uploaded = await uploadToCloudinary(dataUrl);
    const uid = targetUid || user?.uid;
    
    // Store descriptor as array for Supabase
    const { error } = await supabase.from('users').update({ 
      photo_url: uploaded.url, 
      face_id_enabled: true,
      face_descriptor: Array.from(descriptor) 
    }).eq('uid', uid);
    
    if (error) throw error;

    if (user && user.uid === uid) {
      const updatedUser = { ...user, photo_url: uploaded.url, face_id_enabled: true };
      localStorage.setItem('sb_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    }

    setPhase('done');
    setStatusMsg('Face ID Registered!');
    setTimeout(() => {
      if (onSuccess) onSuccess(uploaded.url);
      if (onClose) onClose();
    }, 1500);
  };

  const handleLogin = async (currentDescriptor) => {
    setStatusMsg('Matching biometrics...');
    
    // In a real app, we might fetch the user based on some other identifier first, 
    // or if it's "Sign in with Face ID" from the login screen, we might need a way to find the user.
    // For this demo, we'll assume we're verifying the current user or a pending user.
    
    const uid = targetUid || user?.uid;
    if (!uid) {
      // If no UID, we might need to search all users? 
      // That's expensive. Let's assume we have an email or something.
      // For now, let's just use the current user if available.
      throw new Error('Identify yourself first (Email/Phone)');
    }

    const { data, error } = await supabase.from('users').select('face_descriptor, email, name, photo_url').eq('uid', uid).single();
    if (error || !data.face_descriptor) throw new Error('Face ID not set up for this user');

    const savedDescriptor = new Float32Array(data.face_descriptor);
    const distance = window.faceapi.euclideanDistance(currentDescriptor, savedDescriptor);

    console.log('Face distance:', distance);
    
    if (distance < 0.6) { // 0.6 is a common threshold for face-api.js
      setPhase('done');
      setStatusMsg(`Welcome back, ${data.name}!`);
      
      // Update local state to log in
      const finalUser = { ...data, uid };
      localStorage.setItem('sb_user', JSON.stringify(finalUser));
      setUser(finalUser);

      setTimeout(() => {
        if (onSuccess) onSuccess(finalUser);
        if (onClose) onClose();
      }, 1500);
    } else {
      throw new Error('Face does not match record');
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
               
            </div>
          )}
        </div>
      </div>

      {/* Top Controls */}
      <div style={{ position: 'absolute', top: 20, left: 20, right: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={onClose} style={{ background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', padding: '8px 12px', borderRadius: 20, cursor: 'pointer' }}> </button>
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
