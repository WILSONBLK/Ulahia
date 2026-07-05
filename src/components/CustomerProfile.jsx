import { useState } from 'react'
import { useStore } from '../store.jsx'
import { useModal } from '../modal.jsx'
import { money } from '../utils.js'
import { useLang } from '../useLang.js'
import ReceiptModal from './ReceiptModal.jsx'
import { PaymentModal } from './Customers.jsx'
import { IconChat, IconChevron } from './icons.jsx'

// Customer Profile (approved mockup): avatar header with total debt,
// Overview / Sales History / Payments tabs, Record Payment + WhatsApp message.
export default function CustomerProfile() {
  const { state, dispatch } = useStore()
  const { openModal } = useModal()
  const t = useLang()
  const [tab, setTab] = useState('overview')

  const customer = state.customers.find(c => c.id === state.selectedCustomerId)

  // Deleted / missing customer: fall back to the list rather than a dead end
  if (!customer) {
    dispatch({ type: 'SET_VIEW', payload: 'customers' })
    return null
  }

  const sales = state.transactions
    .filter(txn => txn.customerId === customer.id)
    .sort((a, b) => new Date(b.time) - new Date(a.time))
  const totalSpent = sales.reduce((s, txn) => s + txn.total, 0)
  const lastPurchase = sales[0] ? new Date(sales[0].time).toLocaleDateString() : '—'
  const payments = customer.payments || []

  function messageOnWhatsApp() {
    const raw = customer.phone.replace(/\D/g, '')
    const num = raw.startsWith('0') ? '234' + raw.slice(1) : raw
    const msg = t('whatsappReminderMsg', { name: customer.name, amount: money(customer.totalBalance) })
    window.open(`https://wa.me/${num}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  const TABS = [
    { id: 'overview', label: t('cprOverview') },
    { id: 'sales', label: t('cprSales') },
    { id: 'payments', label: t('cprPayments') },
  ]

  return (
    <div className="screen-content cpr-screen">

      {/* Header card */}
      <section className="panel cpr-head">
        <span className="cpr-avatar">{customer.name.charAt(0).toUpperCase()}</span>
        <div className="cpr-head-info">
          <strong>{customer.name}</strong>
          <span>{customer.phone || t('noPhone')}</span>
        </div>
        {customer.totalBalance > 0 && (
          <div className="cpr-debt">
            <span>{t('cprTotalDebt')}</span>
            <strong>{money(customer.totalBalance)}</strong>
          </div>
        )}
      </section>

      {/* Tabs */}
      <div className="seg-tabs">
        {TABS.map(x => (
          <button key={x.id} className={`seg-tab${tab === x.id ? ' is-active' : ''}`} onClick={() => setTab(x.id)}>
            {x.label}
          </button>
        ))}
      </div>

      {/* ── Overview ── */}
      {tab === 'overview' && (
        <>
          <div className="cpr-stats">
            <div className="cpr-stat">
              <span>{t('cprTotalSpent')}</span>
              <strong>{money(totalSpent)}</strong>
            </div>
            <div className="cpr-stat">
              <span>{t('cprTotalSales')}</span>
              <strong>{sales.length}</strong>
            </div>
            <div className="cpr-stat">
              <span>{t('cprLastPurchase')}</span>
              <strong className="cpr-stat-date">{lastPurchase}</strong>
            </div>
          </div>

          <section className="section">
            <div className="list">
              {sales.slice(0, 5).map(txn => (
                <button key={txn.id} className="txn-row txn-row-button" onClick={() => openModal(<ReceiptModal transaction={txn} />)}>
                  <div className="txn-info">
                    <span className="txn-items">{txn.items.map(i => i.type === 'flexible' ? i.name : `${i.name} × ${i.qty}`).join(', ')}</span>
                    <span className="txn-meta">{new Date(txn.time).toLocaleDateString()}</span>
                  </div>
                  <div className="txn-right">
                    <strong>{money(txn.total)}</strong>
                    {txn.balance > 0 && <span className="pill warn">{money(txn.balance)} {t('owedSuffix')}</span>}
                  </div>
                </button>
              ))}
              {!sales.length && <div className="empty">{t('cprNoSales')}</div>}
            </div>
            {sales.length > 5 && (
              <button className="home-link cpr-viewall" onClick={() => setTab('sales')}>
                {t('cprViewAll')} <IconChevron size={14} />
              </button>
            )}
          </section>
        </>
      )}

      {/* ── Sales history ── */}
      {tab === 'sales' && (
        <section className="section">
          <div className="list">
            {sales.map(txn => (
              <button key={txn.id} className="txn-row txn-row-button" onClick={() => openModal(<ReceiptModal transaction={txn} />)}>
                <div className="txn-info">
                  <span className="txn-items">{txn.items.map(i => i.type === 'flexible' ? i.name : `${i.name} × ${i.qty}`).join(', ')}</span>
                  <span className="txn-meta">{new Date(txn.time).toLocaleString()}</span>
                </div>
                <div className="txn-right">
                  <strong>{money(txn.total)}</strong>
                  {txn.balance > 0 && <span className="pill warn">{money(txn.balance)} {t('owedSuffix')}</span>}
                </div>
              </button>
            ))}
            {!sales.length && <div className="empty">{t('cprNoSales')}</div>}
          </div>
        </section>
      )}

      {/* ── Payments ── */}
      {tab === 'payments' && (
        <section className="section">
          <div className="list">
            {payments.map(p => (
              <div key={p.id} className="txn-row">
                <div className="txn-info">
                  <span className="txn-items">{p.note || t('recordPayment')}</span>
                  <span className="txn-meta">{new Date(p.time).toLocaleString()}</span>
                </div>
                <strong className="amount good">{money(p.amount)}</strong>
              </div>
            ))}
            {!payments.length && <div className="empty">{t('cprNoPayments')}</div>}
          </div>
        </section>
      )}

      {/* Actions */}
      <div className="cpr-actions">
        {customer.totalBalance > 0 && (
          <button className="button cpr-action" onClick={() => openModal(<PaymentModal customer={customer} />)}>
            {t('recordPayment')}
          </button>
        )}
        {customer.phone && (
          <button className="button light cpr-action" onClick={messageOnWhatsApp}>
            <IconChat size={18} /> {t('cprMessage')}
          </button>
        )}
      </div>
    </div>
  )
}
