import { useState } from 'react'
import { useStore } from '../store.jsx'
import { useLang } from '../useLang.js'
import { useModal } from '../modal.jsx'
import { useToast } from '../toast.jsx'
import { money } from '../utils.js'
import { IconChat, IconSearch, IconUserPlus } from './icons.jsx'

function AddCustomerModal() {
  const { dispatch } = useStore()
  const { closeModal } = useModal()
  const showToast = useToast()
  const t = useLang()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')

  function submit(e) {
    e?.preventDefault()
    if (!name.trim()) return
    dispatch({ type: 'ADD_CUSTOMER', payload: { name, phone } })
    showToast(t('customerAddedToast', { name: name.trim() }))
    closeModal()
  }

  return (
    <form onSubmit={submit}>
      <h3 style={{ margin: '0 0 14px' }}>{t('rsAddCustomer')}</h3>
      <div style={{ display: 'grid', gap: 12 }}>
        <label className="label">
          {t('customerName')}
          <input className="field" value={name} onChange={e => setName(e.target.value)} placeholder={t('laFullNamePlaceholder')} autoFocus required />
        </label>
        <label className="label">
          {t('phone')} <span style={{ fontWeight: 400, color: 'var(--muted)' }}>({t('optional')})</span>
          <input className="field" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder={t('phonePlaceholder')} />
        </label>
        <div className="row">
          <button className="button" type="submit" disabled={!name.trim()} style={{ opacity: name.trim() ? 1 : 0.5 }}>{t('rsAddCustomer')}</button>
          <button className="button light" type="button" onClick={closeModal}>{t('cancel')}</button>
        </div>
      </div>
    </form>
  )
}

export function PaymentModal({ customer }) {
  const { dispatch } = useStore()
  const { closeModal } = useModal()
  const showToast = useToast()
  const t = useLang()
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')

  function submit(overrideAmount) {
    const amt = Number(overrideAmount ?? amount)
    if (!amt || amt <= 0) { showToast(t('enterValidAmount')); return }
    dispatch({ type: 'ADD_PAYMENT', payload: { customerId: customer.id, amount: amt, note } })
    showToast(t('paymentRecordedToast', { amount: money(amt), name: customer.name }))
    closeModal()
  }

  return (
    <>
      <h3 style={{ margin: '0 0 4px' }}>{t('recordPayment')}</h3>
      <p style={{ margin: '0 0 20px', color: 'var(--muted)' }}>
        {t('customerOwesPrefix', { name: customer.name })} <strong className="amount bad">{money(customer.totalBalance)}</strong>
      </p>
      <div style={{ display: 'grid', gap: 12 }}>
        <label className="label">
          {t('amountPaid')}
          <input
            className="field"
            type="number"
            min="1"
            max={customer.totalBalance}
            placeholder={String(customer.totalBalance)}
            value={amount}
            onChange={e => setAmount(e.target.value)}
            autoFocus
          />
        </label>
        <label className="label">
          {t('note')} <span style={{ fontWeight: 400, color: 'var(--muted)' }}>({t('optional')})</span>
          <input
            className="field"
            placeholder={t('notePlaceholderPayment')}
            value={note}
            onChange={e => setNote(e.target.value)}
          />
        </label>
        <div className="row">
          <button className="button" onClick={() => submit()}>{t('confirmPayment')}</button>
          <button
            className="button secondary"
            onClick={() => submit(customer.totalBalance)}
            title={t('payFullTitle')}
          >
            {t('payFullBtn', { amt: money(customer.totalBalance) })}
          </button>
          <button className="button light" onClick={closeModal}>{t('cancel')}</button>
        </div>
      </div>
    </>
  )
}

export default function Customers() {
  const { state, dispatch } = useStore()
  const t = useLang()
  const { openModal } = useModal()
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('all')

  const totalDebt = state.customers.reduce((sum, c) => sum + c.totalBalance, 0)
  const owingCount = state.customers.filter(c => c.totalBalance > 0).length
  const clearCount = state.customers.length - owingCount

  const filtered = state.customers
    .filter(c =>
      tab === 'all' ? true :
      tab === 'owing' ? c.totalBalance > 0 :
      c.totalBalance === 0
    )
    .filter(c =>
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
    )

  return (
    <section className="section">
      <div className="section-head">
        <div>
          <span className="section-kicker">{t('customers')}</span>
          <h2>
            {money(totalDebt)}{' '}
            <span style={{ fontSize: '1rem', fontWeight: 400, color: 'var(--muted)' }}>{t('outstanding')}</span>
          </h2>
        </div>
      </div>

      <div className="prod-toolbar" style={{ marginBottom: 12 }}>
        <span className="pos-search-field">
          <span className="pos-search-icon"><IconSearch size={19} /></span>
          <input
            className="pos-search-input"
            placeholder={`${t('search')}...`}
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoComplete="off"
          />
        </span>
        <button
          className="prod-tool-btn prod-tool-btn--primary"
          aria-label={t('rsAddCustomer')}
          title={t('rsAddCustomer')}
          onClick={() => openModal(<AddCustomerModal />)}
        >
          <IconUserPlus size={20} />
        </button>
      </div>

      <div className="seg-tabs">
        <button className={`seg-tab${tab === 'all' ? ' is-active' : ''}`} onClick={() => setTab('all')}>
          {t('custAll')} ({state.customers.length})
        </button>
        <button className={`seg-tab${tab === 'owing' ? ' is-active' : ''}`} onClick={() => setTab('owing')}>
          {t('custWithDebt')} ({owingCount})
        </button>
        <button className={`seg-tab${tab === 'cleared' ? ' is-active' : ''}`} onClick={() => setTab('cleared')}>
          {t('custNoDebt')} ({clearCount})
        </button>
      </div>

      <div className="list">
        {!filtered.length ? (
          <div className="empty">
            {tab === 'all' ? t('cpNoCustomers') : tab === 'owing' ? t('noDebt') : t('noClearedYet')}
          </div>
        ) : (
          filtered.map(c => (
            <div key={c.id} className="cust-card">
              <button className="cust-open" onClick={() => dispatch({ type: 'OPEN_CUSTOMER', payload: c.id })}>
                <div className="cust-avatar">{c.name[0].toUpperCase()}</div>
                <div className="cust-info">
                  <strong>{c.name}</strong>
                  <span>{c.phone || t('noPhone')}</span>
                  {c.payments.length > 0 && (
                    <span className="cust-last-pay">
                      {t('lastPaid')} {money(c.payments[0].amount)} · {new Date(c.payments[0].time).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </button>
              <div className="cust-right">
                <strong className={c.totalBalance > 0 ? 'amount bad' : 'amount good'}>
                  {c.totalBalance > 0 ? money(c.totalBalance) : `✓ ${t('clearedBadge')}`}
                </strong>
                {c.totalBalance > 0 && (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      className="button secondary btn-sm"
                      onClick={() => openModal(<PaymentModal customer={c} />)}
                    >
                      {t('paid')}
                    </button>
                    {c.phone && (
                      <button
                        className="button btn-sm btn-whatsapp"
                        title={t('whatsappReminderTitle')}
                        aria-label={t('whatsappReminderTitle')}
                        onClick={() => {
                          const raw = c.phone.replace(/\D/g, '')
                          const num = raw.startsWith('0') ? '234' + raw.slice(1) : raw
                          const msg = t('whatsappReminderMsg', { name: c.name, amount: money(c.totalBalance) })
                          window.open(`https://wa.me/${num}?text=${encodeURIComponent(msg)}`, '_blank')
                        }}
                      >
                        <IconChat size={18} />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  )
}
