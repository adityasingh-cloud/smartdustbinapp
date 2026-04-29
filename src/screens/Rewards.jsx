import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { supabase } from '../lib/supabase'

export default function Rewards() {
  const { ecoCoins, redeemCoins, t } = useApp()
  const [rewards, setRewards] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRewards()
  }, [])

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
      <div className="px card-enter" style={{ paddingBottom: 24 }}>
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

      {/* How to earn */}
      <div className="px">
        <div className="card" style={{ borderStyle: 'dashed', borderColor: 'var(--yellow)', background: 'transparent' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--yellow)', marginBottom: 4 }}>{t('howToEarn')}</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>{t('scanAndEarn')}</div>
        </div>
      </div>
    </div>
  )
}
