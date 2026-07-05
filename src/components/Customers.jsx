import { useState } from 'react'
import { useStore } from '../store.jsx'
import { useLang } from '../useLang.js'
import { useModal } from '../modal.jsx'
import { useToast } from '../toast.jsx'
import { money } from '../utils.js'

function PaymentModal({ customer }) {
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
  const { state } = useStore()
  const t = useLang()
  const { openModal } = useModal()
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('owing')

  const totalDebt = state.customers.reduce((sum, c) => sum + c.totalBalance, 0)

  const filtered = state.customers
    .filter(c => tab === 'owing' ? c.totalBalance > 0 : c.totalBalance === 0)
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

      <div className="segmented-tabs">
        <button className={`segmented-tab${tab === 'owing' ? ' is-active' : ''}`} onClick={() => setTab('owing')}>
          {t('allDebts')} ({state.customers.filter(c => c.totalBalance > 0).length})
        </button>
        <button className={`segmented-tab${tab === 'cleared' ? ' is-active' : ''}`} onClick={() => setTab('cleared')}>
          {t('clearedDebts')} ({state.customers.filter(c => c.totalBalance === 0).length})
        </button>
      </div>

      <input
        className="field"
        placeholder={`🔍  ${t('search')}...`}
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ marginBottom: 14 }}
      />

      <div className="list">
        {!filtered.length ? (
          <div className="empty">
            {tab === 'owing' ? t('noDebt') : t('noClearedYet')}
          </div>
        ) : (
          filtered.map(c => (
            <div key={c.id} className="cust-card">
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
                        onClick={() => {
                          const raw = c.phone.replace(/\D/g, '')
                          const num = raw.startsWith('0') ? '234' + raw.slice(1) : raw
                          const msg = t('whatsappReminderMsg', { name: c.name, amount: money(c.totalBalance) })
                          window.open(`https://wa.me/${num}?text=${encodeURIComponent(msg)}`, '_blank')
                        }}
                      >
                        💬
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
