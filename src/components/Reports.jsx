import { useState } from 'react'
import { useStore } from '../store.jsx'
import { useModal } from '../modal.jsx'
import { money } from '../utils.js'
import { useLang } from '../useLang.js'
import ReceiptModal from './ReceiptModal.jsx'

function filterByPeriod(txns, period) {
  const now = new Date()
  if (period === 'today') {
    const today = now.toDateString()
    return txns.filter(t => new Date(t.time).toDateString() === today)
  }
  if (period === 'week') {
    const cutoff = new Date(now - 7 * 24 * 60 * 60 * 1000)
    return txns.filter(t => new Date(t.time) >= cutoff)
  }
  if (period === 'month') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1)
    return txns.filter(t => new Date(t.time) >= start)
  }
  return txns
}

export default function Reports() {
  const { state } = useStore()
  const { openModal } = useModal()
  const t = useLang()
  const [period, setPeriod] = useState('today')

  const txns = filterByPeriod(state.transactions, period)

  // Summary numbers
  const totalSales = txns.reduce((s, t) => s + t.total, 0)
  const totalProfit = txns.reduce((s, t) => s + t.profit, 0)
  const flexRevenue = txns.flatMap(t => t.items).filter(i => i.type === 'flexible').reduce((s, i) => s + i.price * i.qty, 0)
  const cashTotal = txns.filter(t => t.mode === 'cash').reduce((s, t) => s + t.total, 0)
  const transferTotal = txns.filter(t => t.mode === 'transfer').reduce((s, t) => s + t.total, 0)
  const debtTotal = state.customers.reduce((s, c) => s + c.totalBalance, 0)

  // Flexible product recovery (always all-time — invested is a cumulative figure)
  const flexProducts = state.products.filter(p => p.type === 'flexible' && p.invested > 0)
  const flexStats = flexProducts.map(p => {
    const sold = state.transactions
      .flatMap(t => t.items)
      .filter(i => i.productId === p.id && i.type === 'flexible')
      .reduce((s, i) => s + i.price * i.qty, 0)
    const net = sold - p.invested
    const pct = Math.round((sold / p.invested) * 100)
    return { ...p, sold, net, pct, recovered: pct >= 100 }
  })

  function openReceipt(txn) {
    openModal(<ReceiptModal transaction={txn} />)
  }

  const PERIODS = [
    { key: 'today', label: t('today') },
    { key: 'week', label: t('thisWeek') },
    { key: 'month', label: t('thisMonth') },
    { key: 'all', label: t('allTime') },
  ]

  return (
    <div className="screen-content">

      {/* Period filter */}
      <div className="report-periods">
        {PERIODS.map(p => (
          <button
            key={p.key}
            className={`period-tab${period === p.key ? ' is-active' : ''}`}
            onClick={() => setPeriod(p.key)}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* ── Summary cards ── */}
      <div className="report-grid">
        <div className="report-card report-card--sales">
          <span>{t('sales')}</span>
          <strong>{money(totalSales)}</strong>
          {flexRevenue > 0 && <small style={{ color: 'var(--muted)' }}>incl. {money(flexRevenue)} flexible</small>}
        </div>
        <div className="report-card report-card--profit">
          <span>{t('profit')}</span>
          <strong>{money(totalProfit)}</strong>
          <small>{t('countedProducts')} only</small>
        </div>
        <div className="report-card report-card--cash">
          <span>💵 {t('cash')}</span>
          <strong>{money(cashTotal)}</strong>
        </div>
        <div className="report-card report-card--transfer">
          <span>📱 {t('transfer')}</span>
          <strong>{money(transferTotal)}</strong>
        </div>
        <div className="report-card report-card--debt">
          <span>{t('debtsOwed')}</span>
          <strong>{money(debtTotal)}</strong>
          <small>{t('allCustomers')}</small>
        </div>
      </div>

      {/* ── Flexible product recovery (all-time) ── */}
      {flexStats.length > 0 && (
        <section className="section">
          <h3 className="section-title">⚖️ {t('flexibleProducts')}</h3>
          <div className="flex-report-list">
            {flexStats.map(p => (
              <div key={p.id} className="flex-report-card">
                <div className="flex-report-head">
                  <strong>{p.name}</strong>
                  {p.recovered
                    ? <span className="pill good">✓ Recovered</span>
                    : <span className="pill">{p.pct}%</span>
                  }
                </div>
                <div className="flex-report-numbers">
                  <span>{t('invested')} <strong>{money(p.invested)}</strong></span>
                  <span>{t('sold')} <strong>{money(p.sold)}</strong></span>
                  <span>Net <strong className={p.net >= 0 ? 'amount good' : 'amount bad'}>{p.net >= 0 ? '+' : ''}{money(p.net)}</strong></span>
                </div>
                <div className="recovery-bar-wrap">
                  <div
                    className="recovery-bar-fill"
                    style={{
                      width: `${Math.min(100, p.pct)}%`,
                      background: p.recovered ? 'var(--green)' : p.pct >= 70 ? 'var(--yellow)' : 'var(--blue)',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Transaction history ── */}
      <section className="section">
        <h3 className="section-title">{t('transactions')} <span className="section-count">{txns.length}</span></h3>
        {txns.length === 0 ? (
          <div className="empty">{t('noTransactions')}</div>
        ) : (
          <div className="list">
            {txns.map(txn => (
              <div
                key={txn.id}
                className="txn-row txn-row--tap"
                onClick={() => openReceipt(txn)}
              >
                <div className="txn-info">
                  <strong className="txn-items">
                    {txn.items.map(i =>
                      i.type === 'flexible' ? `${i.name} ₦${i.price.toLocaleString()}` : `${i.name} ×${i.qty}`
                    ).join(', ')}
                  </strong>
                  <span className="txn-meta">
                    {new Date(txn.time).toLocaleString('en-NG', {
                      hour: '2-digit', minute: '2-digit',
                      day: period === 'today' ? undefined : 'numeric',
                      month: period === 'today' ? undefined : 'short',
                    })}
                    {txn.customerName && ` · ${txn.customerName}`}
                  </span>
                </div>
                <div className="txn-right">
                  <strong>{money(txn.total)}</strong>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    <span className={`pill ${txn.mode === 'debt' ? 'warn' : txn.mode === 'transfer' ? 'blue-pill' : ''}`}>
                      {txn.mode === 'cash' ? t('cash') : txn.mode === 'transfer' ? t('transfer') : t('debt')}
                    </span>
                    {txn.profit > 0 && (
                      <span className="pill good">+{money(txn.profit)}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  )
}
