import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { supabase } from '../lib/supabase'

export default function Rewards() {
  const { ecoCoins, redeemCoins, t } = useApp()
  const [rewards, setRewards] = useState([])
  const [loading, setLoading] = useState(true)

  const [history, setHistory] = useState([])

  useEffect(() => {
    fetchRewards()
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    if (!supabase.auth?.user && !localStorage.getItem('sb_user')) return
    const u = JSON.parse(localStorage.getItem('sb_user'))
    if (!u?.uid) return
    
    const { data } = await supabase.from('transactions').select('*').eq('user_id', u.uid).eq('type', 'redeem').order('created_at', { ascending: false }).limit(5)
    if (data) setHistory(data)
  }

  const fetchRewards = async () => {
    setLoading(true)
    const { data } = await supabase.from('rewards').select('*').order('coins', { ascending: true })
    if (data && data.length > 0) {
      setRewards(data)
    } else {
      // Fallback if table is empty
      setRewards([
        { id: 1, brand: 'Starbucks',  disc: '20% OFF', coins: 300, color: '#00704A' },
        { id: 2, brand: 'Amazon',     disc: '₹150 OFF', coins: 500, color: '#FF9900' },
        { id: 3, brand: 'Swiggy',     disc: '30% OFF', coins: 400, color: '#FC8019' },
        { id: 4, brand: 'Zomato',     disc: 'FLAT ₹100', coins: 350, color: '#E23744' },
      ])
    }
    setLoading(false)
  }

  const handleRedeem = async (r) => {
    if (ecoCoins < r.coins) {
      alert(`${t('insufficientCoins')}! ${t('scanAndEarn')}`)
      return
    }
    
    if (confirm(`${t('confirm')} ${t('redeemNow')} ${r.brand} ${r.disc} for ${r.coins} coins?`)) {
      try {
        await redeemCoins(r.coins, `${r.brand} ${r.disc}`)
        alert(t('redeemSuccess'))
        fetchHistory()
      } catch (err) {
        alert(err.message)
      }
    }
  }

  return (
    <div className="screen screen-fade">
      {/* Header */}
      <div className="topbar">
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, letterSpacing: 3, color: 'var(--yellow)' }}>REWARDS</div>
      </div>

      {/* Stats Card */}
      <div className="px card-enter" style={{ marginTop: 8 }}>
        <div className="card" style={{ 
          background: 'var(--yellow)', color: 'var(--bg)', 
          display: 'flex', justifyContent: 'space-between', alignItems: 'center' 
        }}>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', opacity: 0.8 }}>{t('available')}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, lineHeight: 1 }}>{ecoCoins}</div>
          </div>
          <div style={{ fontSize: 32 }}>🪙</div>
        </div>
      </div>

      {/* Rewards Grid */}
      <div className="section-label px" style={{ marginTop: 24 }}>{t('rewardStore')}</div>
      <div className="px card-enter">
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>{t('loading')}</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {rewards.map((r) => (
              <div 
                key={r.id} 
                className="card" 
                style={{ 
                  padding: '16px 12px', 
                  borderTop: `4px solid ${r.color || 'var(--yellow)'}`,
                  display: 'flex', flexDirection: 'column', gap: 8,
                  opacity: ecoCoins < r.coins ? 0.6 : 1
                }}
              >
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, color: r.color || 'var(--yellow)' }}>{r.brand}</div>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{r.disc}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>
                  🪙 {r.coins} {t('points')}
                </div>
                
                <button 
                  className="scan-btn" 
                  style={{ 
                    marginTop: 8, height: 32, fontSize: 12, 
                    background: ecoCoins < r.coins ? 'var(--gray)' : 'var(--yellow)',
                    color: ecoCoins < r.coins ? 'var(--text-muted)' : 'var(--bg)',
                    border: 'none'
                  }}
                  disabled={ecoCoins < r.coins}
                  onClick={() => handleRedeem(r)}
                >
                  {ecoCoins < r.coins ? t('insufficientCoins') : t('redeemNow')}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Referral Card */}
      <div className="px card-enter" style={{ marginTop: 24 }}>
        <div className="card" style={{ background: 'var(--card-darker)', border: '1px dashed var(--yellow)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--yellow)' }}>REFER A FRIEND</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>Get 50 EcoCoins for every referral</div>
            </div>
            <div style={{ fontSize: 24 }}>🎁</div>
          </div>
          <button className="scan-btn" style={{ marginTop: 12, height: 36, fontSize: 14, background: 'transparent', border: '1px solid var(--yellow)', color: 'var(--yellow)' }}>
            SHARE CODE: SMARTBIN50
          </button>
        </div>
      </div>

      {/* Redemption History */}
      {history.length > 0 && (
        <>
          <div className="section-label px" style={{ marginTop: 24 }}>MY VOUCHERS</div>
          <div className="px card-enter">
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              {history.map((h, i) => (
                <div key={i} style={{ 
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px',
                  borderBottom: i < history.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none'
                }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{h.reason}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)' }}>{new Date(h.created_at).toLocaleDateString()}</div>
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--yellow)' }}>- {h.amount}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* How to earn */}
      <div className="px" style={{ marginTop: 24, paddingBottom: 40 }}>
        <div className="card" style={{ borderStyle: 'dashed', borderColor: 'var(--yellow)', background: 'transparent' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--yellow)', marginBottom: 4 }}>{t('howToEarn')}</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>{t('scanAndEarn')}</div>
        </div>
      </div>
    </div>
  )
}
