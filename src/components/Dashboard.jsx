import { useStore } from '../store.jsx'
import { useLang } from '../useLang.js'
import { useStats } from '../useStats.js'
import { money } from '../utils.js'
import StatCards from './StatCards.jsx'

export default function Dashboard() {
  const { state, dispatch } = useStore()
  const t = useLang()
  const { todaySales, todayProfit } = useStats()

  const hour = new Date().getHours()
  const greeting = hour < 12 ? t('greetMorning') : hour < 17 ? t('greetAfternoon') : t('greetEvening')

  const recent = state.transactions.slice(0, 6)

  function goSell() {
    dispatch({ type: 'SET_VIEW', payload: 'sell' })
  }

  return (
    <>
      {/* Greeting */}
      <div className="dash-header">
        <div>
          <h1 className="dash-greeting">{greeting}, {state.shop.owner || state.shop.name}</h1>
          <p className="dash-sub">{state.shop.name}</p>
        </div>
      </div>

      {/* PRIMARY CTA */}
      <button type="button" className="sell-cta" onClick={goSell}>
        <span className="sell-cta-icon">💰</span>
        <span>{t('dashStartNewSale')}</span>
        <span className="sell-cta-arrow">→</span>
      </button>

      {/* Today summary */}
      <div className="dash-today">
        <div className="dash-today-card">
          <span>{t('todaySales')}</span>
          <strong>{money(todaySales)}</strong>
        </div>
        <div className="dash-today-card">
          <span>{t('todayProfit')}</span>
          <strong className="amount good">{money(todayProfit)}</strong>
        </div>
      </div>

      <StatCards />

      {/* Recent transactions */}
      <section className="section">
        <div className="section-head">
          <h2>{t('dashRecentSales')}</h2>
          {recent.length > 0 && (
            <button type="button" className="button light" onClick={() => dispatch({ type: 'SET_VIEW', payload: 'reports' })}>
              {t('dashSeeAll')}
            </button>
          )}
        </div>

        {recent.length === 0 ? (
          <div className="empty">{t('dashNoSalesYet')}</div>
        ) : (
          <div className="list">
            {recent.map(txn => (
              <div key={txn.id} className="txn-row">
                <div className="txn-info">
                  <strong className="txn-items">
                    {txn.items.map(i => `${i.name} ×${i.qty}`).join(', ')}
                  </strong>
                  <span className="txn-meta">
                    {new Date(txn.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {txn.customerName && ` · ${txn.customerName}`}
                  </span>
                </div>
                <div className="txn-right">
                  <strong>{money(txn.total)}</strong>
                     <span className={`pill${txn.mode === 'debt' ? ' warn' : txn.mode === 'transfer' ? ' blue-pill' : ''}`}>
                       {txn.mode === 'cash' ? t('cash') : txn.mode === 'transfer' ? 'Transfer' : t('debt')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  )
}
