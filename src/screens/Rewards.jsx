const REWARDS_DATA = [
  { brand: 'Starbucks',  emoji: '☕', disc: '20% OFF', coins: 300, desc: 'On any beverage',     color: '#00704A', bg: 'rgba(0,112,74,0.12)'  },
  { brand: 'Amazon',     emoji: '📦', disc: '₹150 OFF', coins: 500, desc: 'Min order ₹499',     color: '#FF9900', bg: 'rgba(255,153,0,0.12)' },
  { brand: 'Swiggy',    emoji: '🛵', disc: '30% OFF', coins: 400, desc: 'On food orders',       color: '#FC8019', bg: 'rgba(252,128,25,0.12)'},
  { brand: 'BookMyShow',emoji: '🎬', disc: '1 FREE',  coins: 800, desc: 'Movie ticket',          color: '#E03A3A', bg: 'rgba(224,58,58,0.12)' },
  { brand: 'Myntra',     emoji: '👗', disc: '25% OFF', coins: 350, desc: 'On apparel orders',   color: '#FF3F6C', bg: 'rgba(255,63,108,0.12)'},
  { brand: 'Zomato',     emoji: '🍕', disc: '40% OFF', coins: 450, desc: 'Up to ₹80 discount',  color: '#E23744', bg: 'rgba(226,55,68,0.12)' },
]

const LEADERBOARD = [
  { rank: 1, name: 'Priya S.',   coins: 3420, badge: '🥇' },
  { rank: 2, name: 'Rahul M.',   coins: 2875, badge: '🥈' },
  { rank: 3, name: 'Arjun P.',   coins: 1240, badge: '🥉', you: true },
  { rank: 4, name: 'Neha K.',    coins: 980,  badge: '4th' },
  { rank: 5, name: 'Vikram R.',  coins: 750,  badge: '5th' },
]

export default function Rewards() {
  return (
    <div className="screen screen-fade">
      <div className="topbar">
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, letterSpacing: 3, color: 'var(--yellow)', lineHeight: 1 }}>REWARDS</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 2, marginTop: 2 }}>
            1,240 EcoCoins available
          </div>
        </div>
        <div style={{ fontSize: 32 }}>🪙</div>
      </div>

      {/* Balance hero */}
      <div className="px card-enter" style={{ marginBottom: 16 }}>
        <div style={{
          background: 'linear-gradient(135deg, var(--yellow) 0%, #C4622D 100%)',
          borderRadius: 'var(--r-xl)', padding: 20,
          position: 'relative', overflow: 'hidden',
          color: 'var(--text-dark)',
        }}>
          <div className="texture" />
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: 3, opacity: 0.6 }}>
            Total Balance
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 56, lineHeight: 1, letterSpacing: 2, marginTop: 4 }}>
            1,240
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, opacity: 0.7 }}>
            EcoCoins · Tier Gold
          </div>
          <div style={{
            marginTop: 14, display: 'flex', gap: 8,
          }}>
            <div style={{
              flex: 1, background: 'rgba(26,26,24,0.2)', borderRadius: 8, padding: '8px 12px', textAlign: 'center',
            }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 20 }}>86</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, textTransform: 'uppercase', letterSpacing: 1, opacity: 0.7 }}>This week</div>
            </div>
            <div style={{
              flex: 1, background: 'rgba(26,26,24,0.2)', borderRadius: 8, padding: '8px 12px', textAlign: 'center',
            }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 20 }}>760</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, textTransform: 'uppercase', letterSpacing: 1, opacity: 0.7 }}>This month</div>
            </div>
            <div style={{
              flex: 1, background: 'rgba(26,26,24,0.2)', borderRadius: 8, padding: '8px 12px', textAlign: 'center',
            }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 20 }}>6</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, textTransform: 'uppercase', letterSpacing: 1, opacity: 0.7 }}>Redeemed</div>
            </div>
          </div>
        </div>
      </div>

      {/* Available Rewards */}
      <div className="section-label px">Redeem Rewards</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '0 20px', marginBottom: 16 }}>
        {REWARDS_DATA.map((r, i) => (
          <div key={i} className="card card-enter" style={{
            padding: '14px 16px', animationDelay: `${i * 0.07}s`,
            background: r.bg, border: `1px solid ${r.color}33`,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 10,
                  background: `${r.color}22`, border: `1px solid ${r.color}44`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22,
                }}>
                  {r.emoji}
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: r.color, letterSpacing: 1 }}>
                    {r.brand}
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, lineHeight: 1 }}>
                    {r.disc}
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: 2, letterSpacing: 1 }}>
                    {r.desc}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--yellow)', fontWeight: 500 }}>
                  🪙 {r.coins}
                </div>
                <button style={{
                  padding: '6px 14px',
                  background: r.color, color: 'white',
                  border: 'none', borderRadius: 'var(--r-sm)',
                  fontFamily: 'var(--font-mono)', fontSize: 10,
                  textTransform: 'uppercase', letterSpacing: 1,
                  cursor: 'pointer',
                }}>
                  Redeem
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Leaderboard */}
      <div className="section-label px">Community Leaderboard</div>
      <div className="px card-enter" style={{ marginBottom: 24 }}>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {LEADERBOARD.map((l, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 16px',
              borderBottom: i < LEADERBOARD.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
              background: l.you ? 'rgba(232,197,71,0.07)' : 'transparent',
            }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, width: 28, textAlign: 'center' }}>
                {l.badge}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>
                  {l.name} {l.you && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--yellow)', textTransform: 'uppercase', letterSpacing: 1, marginLeft: 6 }}>YOU</span>}
                </div>
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: l.you ? 'var(--yellow)' : 'var(--text-light)' }}>
                {l.coins.toLocaleString()}
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', marginLeft: 4 }}>coins</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
