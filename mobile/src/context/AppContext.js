import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../utils/firebase';
import { doc, updateDoc, onSnapshot, collection, query, where, orderBy, limit, setDoc } from 'firebase/firestore';
import { t } from '../utils/translations';

const AppContext = createContext({});

export const AppProvider = ({ children }) => {
  const [language, setLanguageState] = useState('en');
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [ecoCoins, setEcoCoins] = useState(0);
  const [totalScans, setTotalScans] = useState(0);
  const [recentScans, setRecentScans] = useState([]);
  const [binData, setBinData] = useState({ dry: 0, wet: 0, metal: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem('language').then((lang) => { if (lang) setLanguageState(lang); });
    AsyncStorage.getItem('userId').then((uid) => { if (uid) loadUserData(uid); else setLoading(false); });
  }, []);

  const setLanguage = async (lang) => { setLanguageState(lang); await AsyncStorage.setItem('language', lang); };
  const translate = (key) => t(language, key);

  const loadUserData = async (uid) => {
    try {
      const unsubUser = onSnapshot(doc(db, 'users', uid), (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setUserProfile(data); setUser({ uid, ...data });
          setEcoCoins(data.ecoCoins || 0); setTotalScans(data.totalScans || 0);
        }
        setLoading(false);
      });
      const unsubBin = onSnapshot(doc(db, 'bins', 'main_bin'), (snap) => { if (snap.exists()) setBinData(snap.data()); });
      const unsubScans = onSnapshot(query(collection(db, 'scans'), where('userId', '==', uid), orderBy('timestamp', 'desc'), limit(20)), (snap) => {
        setRecentScans(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      });
      return () => { unsubUser(); unsubBin(); unsubScans(); };
    } catch (error) { console.error('loadUserData:', error); setLoading(false); }
  };

  const loginUser = async (uid, profileData) => {
    await AsyncStorage.setItem('userId', uid);
    setUser({ uid, ...profileData }); setUserProfile(profileData);
    loadUserData(uid);
  };

  const logoutUser = async () => {
    await AsyncStorage.removeItem('userId');
    setUser(null); setUserProfile(null); setEcoCoins(0); setTotalScans(0); setRecentScans([]);
  };

  const updateUserProfile = async (updates) => {
    if (!user?.uid) throw new Error('Not logged in');
    await updateDoc(doc(db, 'users', user.uid), updates);
    setUserProfile((p) => ({ ...p, ...updates })); setUser((p) => ({ ...p, ...updates }));
  };

  const addEcoCoins = async (amount, reason) => {
    if (!user?.uid) return;
    const newCoins = ecoCoins + amount;
    await updateDoc(doc(db, 'users', user.uid), { ecoCoins: newCoins, totalEcoCoinsEarned: (userProfile?.totalEcoCoinsEarned || 0) + amount });
    await setDoc(doc(collection(db, 'transactions')), { userId: user.uid, type: 'earn', amount, reason, timestamp: new Date() });
    setEcoCoins(newCoins);
  };

  const redeemEcoCoins = async (amount, rewardName) => {
    if (ecoCoins < amount) throw new Error('Insufficient EcoCoins');
    const newCoins = ecoCoins - amount;
    await updateDoc(doc(db, 'users', user.uid), { ecoCoins: newCoins });
    await setDoc(doc(collection(db, 'transactions')), { userId: user.uid, type: 'redeem', amount, reason: rewardName, timestamp: new Date() });
    setEcoCoins(newCoins);
  };

  return (
    <AppContext.Provider value={{ language, setLanguage, t: translate, user, userProfile, ecoCoins, totalScans, recentScans, binData, loading, loginUser, logoutUser, updateUserProfile, addEcoCoins, redeemEcoCoins, loadUserData }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
