import { useState } from 'react'
import { useStore } from '../store.jsx'
import { useModal } from '../modal.jsx'
import { useToast } from '../toast.jsx'
import { money } from '../utils.js'
import { useLang } from '../useLang.js'
import CustomerSearch from './CustomerSearch.jsx'

export default function CheckoutModal() {
  const { state, dispatch } = useStore()
  const { closeModal } = useModal()
  const showToast = useToast()
  const t = useLang()

  const [mode, setMode] = useState('cash')
  const [transferConfirmed, setTransferConfirmed] = useState(false)
  const [customer, setCustomer] = useState(null)
  const [amountReceived, setAmountReceived] = useState('')

  const items = state.cart.map(i => ({ ...i, subtotal: i.price * i.qty }))
  const total = items.reduce((sum, i) => sum + i.subtotal, 0)
  const profit = items
    .filter(i => i.type === 'fixed')
    .reduce((sum, i) => sum + (i.price - i.cost) * i.qty, 0)

  const cashReceived = amountReceived !== '' ? Number(amountReceived) : total
  const change = mode === 'cash' ? Math.max(0, cashReceived - total) : 0
  const debtPartPaid = amountReceived !== '' ? Number(amountReceived) : 0
  const balance = mode === 'debt' ? Math.max(0, total - debtPartPaid) : 0

  function switchMode(m) {
    setMode(m)
    setAmountReceived('')
    setTransferConfirmed(false)
    setCustomer(null)
  }

  function canComplete() {
    if (mode === 'transfer' && !transferConfirmed) return false
    if (mode === 'debt' && !customer?.name?.trim()) return false
    if (mode === 'debt' && !customer?.phone?.trim()) return false
    return true
  }

  function complete() {
    if (!canComplete()) return
    let amountPaid, finalBalance

    if (mode === 'cash') {
      amountPaid = cashReceived
      finalBalance = 0
    } else if (mode === 'transfer') {
      amountPaid = total
      finalBalance = 0
    } else {
      amountPaid = debtPartPaid
      finalBalance = balance
    }

    dispatch({
      type: 'COMPLETE_TRANSACTION',
      payload: { items, total, profit, mode, customer, amountPaid, balance: finalBalance },
    })
    closeModal()
    showToast(`Sale of ${money(total)} recorded!`)
  }

  function formatItem(item) {
    return item.type === 'flexible' ? item.name : `${item.name} × ${item.qty}`
  }

  return (
    <div className="co-wrap">

      {/* Sticky header */}
      <div className="co-header">
        <button className="icon-button co-back-btn" onClick={closeModal}>←</button>
        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{t('checkout')}</h3>
      </div>

      {/* Order summary */}
      <div className="co-section">
        <div className="co-label">{t('orderSummary')}</div>
        {items.map(item => (
          <div key={item.cartItemId || item.productId} className="co-line">
            <span>{formatItem(item)}</span>
            <span>{money(item.subtotal)}</span>
          </div>
        ))}
        <div className="co-total-line">
          <span>{t('total')}</span>
          <strong>{money(total)}</strong>
        </div>
      </div>

      {/* Payment mode — 3 options */}
      <div className="co-section">
        <div className="co-label">{t('paymentMethod')}</div>
        <div className="co-mode-toggle co-mode-toggle--3">
          <button className={`co-mode-btn${mode === 'cash' ? ' is-active' : ''}`} onClick={() => switchMode('cash')}>
            <span className="co-mode-icon">💵</span>{t('cash')}
          </button>
          <button className={`co-mode-btn${mode === 'transfer' ? ' is-active' : ''}`} onClick={() => switchMode('transfer')}>
            <span className="co-mode-icon">📱</span>{t('transfer')}
          </button>
          <button className={`co-mode-btn${mode === 'debt' ? ' is-active' : ''}`} onClick={() => switchMode('debt')}>
            <span className="co-mode-icon">📋</span>{t('debt')}
          </button>
        </div>
      </div>

      {/* ── CASH: amount received + change ── */}
      {mode === 'cash' && (
        <div className="co-section">
          <div className="co-label">{t('amountReceived')}</div>
          <input
            className="field"
            type="number"
            min="0"
            placeholder={String(total)}
            value={amountReceived}
            onChange={e => setAmountReceived(e.target.value)}
            autoFocus
          />
          <div className="co-cash-summary">
            <div className="co-cash-row">
              <span>{t('total')}</span>
              <strong>{money(total)}</strong>
            </div>
            <div className="co-cash-row">
              <span>{t('received')}</span>
              <strong>{money(cashReceived)}</strong>
            </div>
            {change > 0 && (
              <div className="co-cash-row co-cash-change">
                <span>{t('changeReturn')}</span>
                <strong>{money(change)}</strong>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TRANSFER: confirmation gate ── */}
      {mode === 'transfer' && (
        <div className="co-section">
          <div className="co-label">{t('transferReceived')}</div>
          <div className="co-transfer-confirm">
            <button
              className={`co-transfer-btn${!transferConfirmed ? ' is-selected co-transfer-btn--no' : ''}`}
              onClick={() => setTransferConfirmed(false)}
            >
              ✗ {t('notConfirmed')}
            </button>
            <button
              className={`co-transfer-btn${transferConfirmed ? ' is-selected co-transfer-btn--yes' : ''}`}
              onClick={() => setTransferConfirmed(true)}
            >
              ✓ {t('confirmed')}
            </button>
          </div>
          {!transferConfirmed && (
            <p className="co-transfer-note">{t('transferNote')}</p>
          )}
          {transferConfirmed && (
            <p className="co-transfer-note" style={{ color: 'var(--green)' }}>
              {t('transferReady')}
            </p>
          )}
        </div>
      )}

      {/* ── DEBT: customer + optional part payment ── */}
      {mode === 'debt' && (
        <>
          <div className="co-section">
            <CustomerSearch required value={customer} onChange={setCustomer} />
          </div>
          <div className="co-section">
            <div className="co-label">{t('partPayment')} <span style={{ fontWeight: 400, color: 'var(--muted)' }}>({t('optional')})</span></div>
            <input
              className="field"
              type="number"
              min="0"
              placeholder="0"
              value={amountReceived}
              onChange={e => setAmountReceived(e.target.value)}
            />
            <div className="co-cash-summary">
              <div className="co-cash-row">
                <span>{t('total')}</span>
                <strong>{money(total)}</strong>
              </div>
              <div className="co-cash-row">
                <span>{t('paidNow')}</span>
                <strong>{money(debtPartPaid)}</strong>
              </div>
              <div className="co-cash-row co-cash-balance">
                <span>{t('willOwe')}</span>
                <strong>{money(balance)}</strong>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Complete button */}
      <div className="co-section co-footer">
        <button
          className="co-complete-btn"
          onClick={complete}
          disabled={!canComplete()}
          style={{ opacity: canComplete() ? 1 : 0.45 }}
        >
          {mode === 'cash' && `✓  ${t('completeSale')}`}
          {mode === 'transfer' && (transferConfirmed ? `✓  ${t('markAsPaid')}` : t('waitingConfirmation'))}
          {mode === 'debt' && `✓  ${t('recordDebt')}`}
        </button>
      </div>

    </div>
  )
}
