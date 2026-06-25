import { useStore } from '../store.jsx'
import { useStats } from '../useStats.js'
import { useModal } from '../modal.jsx'
import { money } from '../utils.js'
import Logo from './Logo.jsx'
import { useLang } from '../useLang.js'

function CloseOfDayModal({ stats, todayCash, todayTransfer, todayDebt }) {
  const { closeModal } = useModal()
  return (
    <div className="cod-modal">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button className="icon-button" onClick={closeModal}>←</button>
        <h3 className="cod-title">Today's Summary</h3>
      </div>
      <div className="cod-grid">
        <div className="cod-card cod-card--sales">
          <span>Total Sales</span>
          <strong>{money(stats.todaySales)}</strong>
        </div>
        <div className="cod-card cod-card--profit">
          <span>Profit</span>
          <strong>{money(stats.todayProfit)}</strong>
        </div>
        <div className="cod-card">
          <span>Transactions</span>
          <strong>{stats.todayCount}</strong>
        </div>
        <div className="cod-card">
          <span>Cash Received</span>
          <strong>{money(todayCash)}</strong>
        </div>
        <div className="cod-card">
          <span>Transfers</span>
          <strong>{money(todayTransfer)}</strong>
        </div>
        {todayDebt > 0 && (
          <div className="cod-card" style={{ borderColor: '#ffc9c9', background: '#fff5f5' }}>
            <span style={{ color: 'var(--red)' }}>Credit Given</span>
            <strong style={{ color: 'var(--red)' }}>{money(todayDebt)}</strong>
          </div>
        )}
      </div>
      <button className="button" style={{ width: '100%' }} onClick={closeModal}>Done</button>
    </div>
  )
}

export default function Home() {
  const { state, dispatch } = useStore()
  const t = useLang()
  const { openModal } = useModal()
  const stats = useStats()
  const { todaySales, todayProfit, cartCount, totalDebt, todayCount, lowStockCount } = stats

  const hour = new Date().getHours()
  const greeting = hour < 12 ? t('greetMorning') : hour < 17 ? t('greetAfternoon') : t('greetEvening')

  const today = new Date().toDateString()
  const todayTxns = state.transactions.filter(t => new Date(t.time).toDateString() === today)
  const todayCash = todayTxns.filter(t => t.mode === 'cash').reduce((s, t) => s + t.amountPaid, 0)
  const todayTransfer = todayTxns.filter(t => t.mode === 'transfer').reduce((s, t) => s + t.amountPaid, 0)
  const todayDebt = todayTxns.filter(t => t.mode === 'debt').reduce((s, t) => s + t.balance, 0)

  function go(view) {
    dispatch({ type: 'SET_VIEW', payload: view })
  }

  function openCloseOfDay() {
    openModal(
      <CloseOfDayModal
        stats={stats}
        todayCash={todayCash}
        todayTransfer={todayTransfer}
        todayDebt={todayDebt}
      />
    )
  }

  return (
    <div className="home-screen">

      {/* Header row */}
      <div className="home-header">
        <div className="home-brand">
          <Logo size={34} />
          <div>
            <strong className="home-brand-name">Ulahia</strong>
            <span className="home-shop-name">{state.shop.name}</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="theme-toggles">
            <button
              className={`theme-btn${state.highContrast ? ' is-active' : ''}`}
              title="High contrast"
              onClick={() => dispatch({ type: 'TOGGLE_HIGH_CONTRAST' })}
            >
              {state.highContrast ? '👁' : '🔆'}
            </button>
            <button
              className={`theme-btn${state.darkMode ? ' is-active' : ''}`}
              title="Dark mode"
              onClick={() => dispatch({ type: 'TOGGLE_DARK_MODE' })}
            >
              {state.darkMode ? '☀️' : '🌙'}
            </button>
          </div>
          <select
            className="select home-lang"
            value={state.language}
            onChange={e => dispatch({ type: 'SET_LANGUAGE', payload: e.target.value })}
          >
            <option value="pidgin">Pidgin</option>
            <option value="en">English</option>
            <option value="yo">Yoruba</option>
            <option value="ig">Igbo</option>
            <option value="ha">Hausa</option>
          </select>
        </div>
      </div>

      {/* Greeting */}
      <div className="home-greeting">
        <p>{greeting}, <strong>{state.shop.owner || state.shop.name}</strong> 👋</p>
      </div>

      {/* Low stock warning */}
      {lowStockCount > 0 && (
        <button className="home-lowstock-banner" onClick={() => go('products')}>
          <span className="home-lowstock-icon">⚠️</span>
          <span className="home-lowstock-text">
            <strong>{lowStockCount} product{lowStockCount !== 1 ? 's' : ''} running low</strong>
            <span>Tap to see which ones need restocking</span>
          </span>
          <span className="home-lowstock-arrow">›</span>
        </button>
      )}

      {/* ── BIG SELL BUTTON ── */}
      <button className="home-sell-btn" onClick={() => go('sell')}>
        <span className="home-sell-icon">💰</span>
        <span className="home-sell-label">{t('newSale')}</span>
        {cartCount > 0 && (
          <span className="home-sell-sub">{cartCount} item{cartCount !== 1 ? 's' : ''} in cart — tap to continue</span>
        )}
      </button>

      {/* ── Navigation tiles ── */}
      <div className="home-grid">
        <button className="home-tile" onClick={() => go('customers')}>
          <span className="home-tile-icon">👥</span>
          <span className="home-tile-label">{t('navCustomers')}</span>
          <span className="home-tile-sub">{t('customersSub')}</span>
        </button>
        <button className="home-tile home-tile--debt" onClick={() => go('debts')}>
          <span className="home-tile-icon">📋</span>
          <span className="home-tile-label">{t('navDebts')}</span>
          {totalDebt > 0
            ? <span className="home-tile-sub home-tile-sub--bad">{money(totalDebt)} owed</span>
            : <span className="home-tile-sub">{t('debtsSub')}</span>
          }
        </button>
        <button className="home-tile" onClick={() => go('products')}>
          <span className="home-tile-icon">📦</span>
          <span className="home-tile-label">{t('navProducts')}</span>
          <span className="home-tile-sub">{t('productsSub')}</span>
        </button>
        <button className="home-tile" onClick={() => go('reports')}>
          <span className="home-tile-icon">📊</span>
          <span className="home-tile-label">{t('navReports')}</span>
          <span className="home-tile-sub">{t('reportsSub')}</span>
        </button>
      </div>

      {/* Settings row */}
      <button className="home-settings-row" onClick={() => go('settings')}>
        <span>⚙️</span>
        <span style={{ flex: 1 }}>{t('navSettings')}</span>
        <span className="home-settings-arrow">›</span>
      </button>

      {/* Today summary + Close of Day */}
      <div className="home-today" style={{ cursor: 'pointer' }} onClick={openCloseOfDay}>
        <div className="home-stat">
          <span>{t('todaySales')}</span>
          <strong>{money(todaySales)}</strong>
          {todayCount > 0 && <span style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: 2 }}>{todayCount} {todayCount === 1 ? 'sale' : 'sales'}</span>}
        </div>
        <div className="home-divider" />
        <div className="home-stat">
          <span>{t('todayProfit')}</span>
          <strong style={{ color: 'var(--green)' }}>{money(todayProfit)}</strong>
        </div>
        <div className="home-divider" />
        <div className="home-stat">
          <span style={{ fontSize: '0.72rem', color: 'var(--green)', fontWeight: 800 }}>📋 Day Summary</span>
          <strong style={{ fontSize: '0.85rem', color: 'var(--green)' }}>View →</strong>
        </div>
      </div>

    </div>
  )
}
