import { createContext, useContext, useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { t } from '../utils/translations'

const AppContext = createContext({})

export function AppProvider({ children }) {
  const [user, setUser] = useState(null)
  const [binData, setBinData] = useState({ dry: 45, wet: 30, metal: 20, fill_level: 45 })
  const [ecoCoins, setEcoCoins] = useState(0)
  const [totalScans, setTotalScans] = useState(0)
  const [recentScans, setRecentScans] = useState([])
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(false)
  const [language, setLanguage] = useState('en')
  const [theme, setTheme] = useState('dark')
  const [faceVerified, setFaceVerified] = useState(false)
  const subs = useRef([])

  // Load persisted user and theme from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('sb_user')
    const savedTheme = localStorage.getItem('sb_theme') || 'dark'
    
    setTheme(savedTheme)
    document.body.className = savedTheme

    if (saved) {
      const u = JSON.parse(saved)
      setUser(u)
      setEcoCoins(u.eco_coins || 0)
      setTotalScans(u.total_scans || 0)
      setLanguage(u.language || 'en')
      subscribeRealtime(u.uid)
    }
    loadBinData()
    fetchLeaderboard()
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    localStorage.setItem('sb_theme', newTheme)
    document.body.className = newTheme
  }

  const loadBinData = async () => {
    const { data } = await supabase.from('bins').select('*').eq('id', 'main_bin').single()
    if (data) setBinData(data)
  }

  const fetchLeaderboard = async () => {
    const { data } = await supabase.from('users').select('uid, name, eco_coins, level, phone').order('eco_coins', { ascending: false }).limit(5)
    if (data) setLeaderboard(data)
  }

  const subscribeRealtime = (uid) => {
    // Real-time bin updates
    const binSub = supabase.channel('web-bin')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bins', filter: 'id=eq.main_bin' },
        (p) => { if (p.new) setBinData(p.new) })
      .subscribe()

    // Real-time scans
    const scanSub = supabase.channel('web-scans-' + uid)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'scans', filter: `user_id=eq.${uid}` },
        () => {
          fetchScans(uid)
          fetchLeaderboard()
        })
      .subscribe()

    // Real-time leaderboard (all users)
    const boardSub = supabase.channel('web-leaderboard')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'users' },
        () => fetchLeaderboard())
      .subscribe()

    subs.current = [binSub, scanSub, boardSub]
    fetchScans(uid)
  }

  const fetchScans = async (uid) => {
    const { data } = await supabase.from('scans').select('*').eq('user_id', uid).order('created_at', { ascending: false }).limit(10)
    if (data) setRecentScans(data)
  }

  const login = async (email, password) => {
    setLoading(true)
    const emailKey = email.replace(/[.@]/g, '_')
    const { data: emailRow } = await supabase.from('user_emails').select('uid').eq('email_key', emailKey).single()
    if (!emailRow) { setLoading(false); throw new Error('No account found') }
    const { data: userData } = await supabase.from('users').select('*').eq('uid', emailRow.uid).single()
    if (!userData || userData.password !== password) { setLoading(false); throw new Error('Incorrect password') }
    localStorage.setItem('sb_user', JSON.stringify(userData))
    setUser(userData); setEcoCoins(userData.eco_coins || 0); setTotalScans(userData.total_scans || 0)
    setLanguage(userData.language || 'en')
    subscribeRealtime(userData.uid)
    setLoading(false)
    return userData
  }

  const register = async (name, email, password) => {
    setLoading(true)
    const uid = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    const profileData = { 
      uid, name, email, password, 
      phone: '', state: '', city: '', pincode: '', 
      dob: '', language: 'en',
      eco_coins: 0, total_scans: 0, total_eco_coins_earned: 0, 
      co2_saved: 0, level: 1 
    }
    const { error } = await supabase.from('users').insert(profileData)
    if (error) { setLoading(false); throw new Error(error.message) }
    await supabase.from('user_emails').insert({ email_key: email.replace(/[.@]/g, '_'), uid, email })
    localStorage.setItem('sb_user', JSON.stringify(profileData))
    setUser(profileData); setEcoCoins(0); setTotalScans(0); setLanguage('en')
    subscribeRealtime(uid)
    setLoading(false)
    return profileData
  }

  const logout = () => {
    subs.current.forEach(s => s?.unsubscribe?.())
    localStorage.removeItem('sb_user')
    setUser(null); setEcoCoins(0); setTotalScans(0); setRecentScans([]); setFaceVerified(false)
  }

  const addEcoCoins = async (amount, reason) => {
    if (!user?.uid) return
    const newCoins = ecoCoins + amount
    await supabase.from('users').update({ eco_coins: newCoins, total_eco_coins_earned: (user.total_eco_coins_earned || 0) + amount, total_scans: totalScans + 1 }).eq('uid', user.uid)
    await supabase.from('transactions').insert({ user_id: user.uid, type: 'earn', amount, reason })
    const updated = { ...user, eco_coins: newCoins, total_scans: totalScans + 1 }
    localStorage.setItem('sb_user', JSON.stringify(updated))
    setUser(updated); setEcoCoins(newCoins); setTotalScans(t => t + 1)
  }

  const saveScan = async (scanData) => {
    if (!user?.uid) return
    await supabase.from('scans').insert({ user_id: user.uid, ...scanData })
    await addEcoCoins(scanData.eco_coins_earned || 5, `Scanned: ${scanData.item_name}`)
  }

  const redeemCoins = async (amount, rewardName) => {
    if (ecoCoins < amount) throw new Error('Insufficient EcoCoins')
    const newCoins = ecoCoins - amount
    await supabase.from('users').update({ eco_coins: newCoins }).eq('uid', user.uid)
    await supabase.from('transactions').insert({ user_id: user.uid, type: 'redeem', amount, reason: rewardName })
    const updated = { ...user, eco_coins: newCoins }
    localStorage.setItem('sb_user', JSON.stringify(updated))
    setUser(updated); setEcoCoins(newCoins)
  }

  const changeLanguage = async (newLang) => {
    setLanguage(newLang)
    if (user?.uid) {
      await supabase.from('users').update({ language: newLang }).eq('uid', user.uid)
      const updated = { ...user, language: newLang }
      localStorage.setItem('sb_user', JSON.stringify(updated))
      setUser(updated)
    }
  }

  const translate = (key) => t(language, key)

  return (
    <AppContext.Provider value={{ 
      user, setUser, binData, ecoCoins, totalScans, recentScans, leaderboard, 
      loading, language, changeLanguage, t: translate,
      theme, toggleTheme, faceVerified, setFaceVerified,
      login, register, logout, addEcoCoins, saveScan, redeemCoins 
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
