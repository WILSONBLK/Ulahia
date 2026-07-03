import { useState } from 'react'
import { useStore, getActiveOrder } from '../store.jsx'
import { useModal } from '../modal.jsx'
import { useToast } from '../toast.jsx'
import { money } from '../utils.js'
import { useLang } from '../useLang.js'
import CustomerSearch from './CustomerSearch.jsx'
import ReceiptModal from './ReceiptModal.jsx'

export default function CheckoutModal() {
  const { state, dispatch } = useStore()
  const { closeModal, openModal } = useModal()
  const showToast = useToast()
  const t = useLang()

  const activeOrder = getActiveOrder(state)
  const hasMultipleOrders = state.orders.length > 1
  const activeOrderLabel = activeOrder.customLabel || t('orderCustomerLabel', { n: activeOrder.number })

  const [mode, setMode] = useState('cash')
  const [transferConfirmed, setTransferConfirmed] = useState(false)
  const [customer, setCustomer] = useState(null)
  const [amountReceived, setAmountReceived] = useState('')
  const [discountType, setDiscountType] = useState(null) // null | 'percent' | 'flat'
  const [discountValue, setDiscountValue] = useState('')

  const rawItems = activeOrder.items.map(i => ({ ...i, subtotal: i.price * i.qty }))
  const rawTotal = rawItems.reduce((sum, i) => sum + i.subtotal, 0)

  const discountAmount = (() => {
    if (!discountType || !discountValue) return 0
    const v = Number(discountValue)
    if (!v || v <= 0) return 0
    if (discountType === 'percent') return Math.round(rawTotal * Math.min(v, 100) / 100)
    return Math.min(v, rawTotal)
  })()

  const items = rawItems
  const total = Math.max(0, rawTotal - discountAmount)
  const profit = items
    .filter(i => i.type === 'fixed')
    .reduce((sum, i) => sum + (i.price - i.cost) * i.qty, 0) - discountAmount

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

    const transaction = {
      id: crypto.randomUUID(),
      time: new Date().toISOString(),
      items,
      total,
      profit: Math.max(0, profit),
      mode,
      customerId: customer?.id || null,
      customerName: customer?.name || '',
      customerPhone: customer?.phone || '',
      amountPaid,
      balance: finalBalance,
    }

    dispatch({
      type: 'COMPLETE_TRANSACTION',
      payload: { items, total, profit: Math.max(0, profit), mode, customer, amountPaid, balance: finalBalance },
    })

    // Haptic feedback
    if (navigator.vibrate) navigator.vibrate([80, 40, 80])

    closeModal()
    showToast(t('saleRecordedToast', { amount: money(total) }))

    // Auto-show receipt after a brief pause so modal closes cleanly
    setTimeout(() => openModal(<ReceiptModal transaction={transaction} />), 120)
  }

  function formatItem(item) {
    return item.type === 'flexible' ? item.name : `${item.name} × ${item.qty}`
  }

  return (
    <div className="co-wrap">

      {/* Sticky header */}
      <div className="co-header">
        <button className="icon-button co-back-btn" onClick={closeModal}>←</button>
        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>
          {t('checkout')}{hasMultipleOrders && ` — ${activeOrderLabel}`}
        </h3>
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
          <strong>{money(rawTotal)}</strong>
        </div>
      </div>

      {/* Discount */}
      <div className="co-section">
        <div className="co-label">{t('discountLabel')} <span style={{ fontWeight: 400, color: 'var(--muted)', textTransform: 'none', letterSpacing: 0 }}>({t('optional')})</span></div>
        <div className="co-discount-row">
          <button
            className={`co-discount-btn${discountType === 'percent' ? ' is-active' : ''}`}
            onClick={() => { setDiscountType(discountType === 'percent' ? null : 'percent'); setDiscountValue('') }}
          >
            {t('percentOffBtn')}
          </button>
          <button
            className={`co-discount-btn${discountType === 'flat' ? ' is-active' : ''}`}
            onClick={() => { setDiscountType(discountType === 'flat' ? null : 'flat'); setDiscountValue('') }}
          >
            {t('flatOffBtn')}
          </button>
        </div>
        {discountType && (
          <div style={{ marginTop: 10 }}>
            <input
              className="field"
              type="number"
              min="0"
              placeholder={discountType === 'percent' ? t('egPercent') : t('egFlat')}
              value={discountValue}
              onChange={e => setDiscountValue(e.target.value)}
              autoFocus
            />
            {discountAmount > 0 && (
              <div className="co-discount-savings">
                {t('saveDiscount', { amt: money(discountAmount), total: money(total) })}
              </div>
            )}
          </div>
        )}
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
