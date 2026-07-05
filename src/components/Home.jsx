import { useState, useEffect, useRef } from 'react'
import { useStore } from '../store.jsx'
import { useStats } from '../useStats.js'
import { useNotifications } from '../useNotifications.js'
import { useModal } from '../modal.jsx'
import { money } from '../utils.js'
import { LogoLockup } from './Logo.jsx'
import { useLang } from '../useLang.js'
import {
  IconMenu, IconBell, IconStore, IconChevronDown, IconChevron,
  IconCart, IconCheck, IconPlus,
} from './icons.jsx'

// Close-of-day summary — end-of-day reconciliation (cash / transfer / credit)
function CloseOfDayModal({ stats, todayCash, todayTransfer, todayDebt }) {
  const { closeModal } = useModal()
  const t = useLang()
  return (
    <div className="cod-modal">
      <div className="cod-head">
        <button type="button" className="icon-button" onClick={closeModal}>←</button>
        <h3 className="cod-title">{t('todaysSummary')}</h3>
      </div>
      <div className="cod-grid">
        <div className="cod-card cod-card--sales"><span>{t('totalSalesLabel')}</span><strong>{money(stats.todaySales)}</strong></div>
        <div className="cod-card cod-card--profit"><span>{t('profit')}</span><strong>{money(stats.todayProfit)}</strong></div>
        <div className="cod-card"><span>{t('transactions')}</span><strong>{stats.todayCount}</strong></div>
        <div className="cod-card"><span>{t('cashReceivedLabel')}</span><strong>{money(todayCash)}</strong></div>
        <div className="cod-card"><span>{t('transfersLabel')}</span><strong>{money(todayTransfer)}</strong></div>
        {todayDebt > 0 && (
          <div className="cod-card cod-card--debt">
            <span>{t('creditGiven')}</span>
            <strong>{money(todayDebt)}</strong>
          </div>
        )}
      </div>
      <button type="button" className="button cod-done-btn" onClick={closeModal}>{t('doneBtn')}</button>
    </div>
  )
}

// Add-store modal — creates a new store partition and switches to it
function AddStoreModal() {
  const { addStore } = useStore()
  const { closeModal } = useModal()
  const t = useLang()
  const [name, setName] = useState('')
  const ref = useRef(null)
  useEffect(() => { ref.current?.focus() }, [])
  return (
    <div className="store-modal">
      <h3>{t('dashAddStore')}</h3>
      <label className="label">
        {t('dashNewStoreTitle')}
        <input ref={ref} className="field" value={name} maxLength={50}
          placeholder={t('dashNewStorePlaceholder')}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && name.trim()) { addStore(name); closeModal() } }} />
      </label>
      <div className="row store-modal-actions">
        <button className="button" disabled={!name.trim()}
          style={{ opacity: name.trim() ? 1 : 0.5 }}
          onClick={() => { addStore(name); closeModal() }}>
          {t('dashCreateStore')}
        </button>
        <button className="button light" onClick={closeModal}>{t('cancel')}</button>
      </div>
    </div>
  )
}

// Store selector chip + dropdown
function StoreSelector() {
  const { state, stores, activeStoreId, switchStore, activeProfile } = useStore()
  const { openModal } = useModal()
  const t = useLang()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const onDoc = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  const isDemo = activeProfile === 'demo'
  const label = isDemo ? t('demoAccountBadge') : (state.shop.name || t('dashStores'))

  return (
    <div className="store-select" ref={ref}>
      <button className="store-chip" onClick={() => !isDemo && setOpen(o => !o)} disabled={isDemo}>
        <span className="store-chip-icon"><IconStore size={18} /></span>
        <span className="store-chip-name">{label}</span>
        {!isDemo && <IconChevronDown size={16} />}
      </button>

      {open && (
        <div className="store-menu">
          <span className="store-menu-head">{t('dashStores')}</span>
          {stores.map(s => (
            <button key={s.id} className={`store-menu-item${s.id === activeStoreId ? ' is-active' : ''}`}
              onClick={() => { switchStore(s.id); setOpen(false) }}>
              <span className="store-menu-item-icon"><IconStore size={16} /></span>
              <span className="store-menu-item-name">{s.name}</span>
              {s.id === activeStoreId && <IconCheck size={16} />}
            </button>
          ))}
          <button className="store-menu-add" onClick={() => { setOpen(false); openModal(<AddStoreModal />) }}>
            <IconPlus size={16} /> {t('dashAddStore')}
          </button>
        </div>
      )}
    </div>
  )
}

export default function Home() {
  const { state, dispatch } = useStore()
  const t = useLang()
  const { openModal } = useModal()
  const stats = useStats()
  const { count: notifCount } = useNotifications()
  const { todaySales, todayProfit, todayCount } = stats

  const hour = new Date().getHours()
  const greeting = hour < 12 ? t('greetMorning') : hour < 17 ? t('greetAfternoon') : t('greetEvening')

  // Unique customers served today (named customers only)
  const today = new Date().toDateString()
  const todayTxns = state.transactions.filter(x => new Date(x.time).toDateString() === today)
  const todayCustomers = new Set(todayTxns.map(x => x.customerId).filter(Boolean)).size
  const todayCash = todayTxns.filter(x => x.mode === 'cash').reduce((s, x) => s + x.amountPaid, 0)
  const todayTransfer = todayTxns.filter(x => x.mode === 'transfer').reduce((s, x) => s + x.amountPaid, 0)
  const todayDebt = todayTxns.filter(x => x.mode === 'debt').reduce((s, x) => s + x.balance, 0)

  function openCloseOfDay() {
    openModal(<CloseOfDayModal stats={stats} todayCash={todayCash} todayTransfer={todayTransfer} todayDebt={todayDebt} />)
  }

  // Open sales = carts with items; active one is "In Progress", the rest "On Hold"
  const openOrders = state.orders.filter(o => o.items.length > 0)

  function go(view) { dispatch({ type: 'SET_VIEW', payload: view }) }

  function resumeOrder(order) {
    dispatch({ type: 'SWITCH_ORDER', payload: order.id })
    go('sell')
  }

  function orderLabel(o) { return o.customLabel || t('orderCustomerLabel', { n: o.number }) }
  function initials(str) {
    return String(str).split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
  }

  return (
    <div className="home-screen home-v2">
      {/* Header: menu · brand · notifications */}
      <header className="home-topbar">
        <button className="home-iconbtn" aria-label={t('navMore')} onClick={() => go('more')}>
          <IconMenu size={24} />
        </button>
        <LogoLockup size={30} tagline={false} />
        <button className="home-iconbtn home-bell" aria-label={t('navNotifications')} onClick={() => go('notifications')}>
          <IconBell size={23} />
          {notifCount > 0 && <span className="home-bell-badge">{notifCount}</span>}
        </button>
      </header>

      {/* Greeting + store selector */}
      <div className="home-greet-row">
        <div className="home-greet">
          <span className="home-greet-hello">{greeting},</span>
          <strong className="home-greet-name">{state.shop.owner || state.shop.name} 👋</strong>
          <span className="home-greet-sub">{t('dashSubtitle')}</span>
        </div>
        <StoreSelector />
      </div>

      {/* Big circular SELL */}
      <div className="home-sell-wrap">
        <button className="home-sell-circle" onClick={() => go('sell')}>
          <IconCart size={40} />
          <span className="home-sell-circle-title">{t('dashSellNow')}</span>
          <span className="home-sell-circle-sub">{t('dashStartNewSale')}</span>
        </button>
      </div>

      {/* Open Sales */}
      {openOrders.length > 0 && (
        <section className="home-open">
          <div className="home-section-head">
            <strong>{t('dashOpenSales')} ({openOrders.length})</strong>
            <button className="home-link" onClick={() => go('sell')}>{t('dashViewAll')}</button>
          </div>
          <div className="home-open-list">
            {openOrders.map(o => {
              const label = orderLabel(o)
              const qty = o.items.reduce((s, i) => s + i.qty, 0)
              const total = o.items.reduce((s, i) => s + i.price * i.qty, 0)
              const active = o.id === state.activeOrderId
              return (
                <button key={o.id} className="home-open-row" onClick={() => resumeOrder(o)}>
                  <span className="home-open-avatar">{initials(label)}</span>
                  <span className="home-open-info">
                    <strong>{label}</strong>
                    <span>{qty === 1 ? t('cartHintOne') : t('cartHintMany', { n: qty })}</span>
                  </span>
                  <span className="home-open-amount">{money(total)}</span>
                  <span className={`home-open-status home-open-status--${active ? 'progress' : 'hold'}`}>
                    {active ? t('dashInProgress') : t('dashOnHold')}
                  </span>
                  <span className="home-open-chevron"><IconChevron size={18} /></span>
                </button>
              )
            })}
          </div>
        </section>
      )}

      {/* Today's Summary — 4 stats */}
      <section className="home-summary">
        <div className="home-section-head">
          <strong className="home-section-title">{t('dashTodaySummary')}</strong>
          <button className="home-link" onClick={openCloseOfDay}>📋 {t('daySummary')}</button>
        </div>
        <div className="home-summary-grid">
          <button className="home-stat-card" onClick={() => go('reports')}>
            <span className="home-stat-icon home-stat-icon--sales">💰</span>
            <span className="home-stat-label">{t('totalSalesLabel')}</span>
            <strong>{money(todaySales)}</strong>
          </button>
          <button className="home-stat-card" onClick={() => go('reports')}>
            <span className="home-stat-icon home-stat-icon--profit">📈</span>
            <span className="home-stat-label">{t('profit')}</span>
            <strong>{money(todayProfit)}</strong>
          </button>
          <button className="home-stat-card" onClick={() => go('reports')}>
            <span className="home-stat-icon home-stat-icon--orders">🧾</span>
            <span className="home-stat-label">{t('dashOrders')}</span>
            <strong>{todayCount}</strong>
          </button>
          <button className="home-stat-card" onClick={() => go('customers')}>
            <span className="home-stat-icon home-stat-icon--cust">👥</span>
            <span className="home-stat-label">{t('navCustomers')}</span>
            <strong>{todayCustomers}</strong>
          </button>
        </div>
      </section>
    </div>
  )
}
