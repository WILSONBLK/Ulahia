import { useState } from 'react'
import { useStore, getActiveOrder } from '../store.jsx'
import { useModal } from '../modal.jsx'
import { useToast } from '../toast.jsx'
import { money } from '../utils.js'
import { useLang } from '../useLang.js'
import CustomerPicker from './CustomerPicker.jsx'
import CheckoutModal from './CheckoutModal.jsx'
import { IconUser, IconChevron, IconPlus } from './icons.jsx'

function Thumb({ item, product }) {
  const img = product?.image
  if (img) return <span className="pos-thumb"><img src={img} alt="" /></span>
  const initial = (item.name || '?').trim().charAt(0).toUpperCase()
  return <span className="pos-thumb pos-thumb--initial">{initial}</span>
}

// Compute discount amount from a discount object and a subtotal
function discountAmountOf(discount, subtotal) {
  if (!discount || !discount.value) return 0
  const v = Number(discount.value)
  if (!v || v <= 0) return 0
  if (discount.type === 'percent') return Math.round(subtotal * Math.min(v, 100) / 100)
  return Math.min(v, subtotal)
}

export default function ReviewSale() {
  const { state, dispatch } = useStore()
  const { openModal } = useModal()
  const showToast = useToast()
  const t = useLang()

  const order = getActiveOrder(state)
  const items = order.items
  const productById = id => state.products.find(p => p.id === id)

  const [discEditing, setDiscEditing] = useState(false)
  const [discType, setDiscType] = useState(order.discount?.type || 'flat')
  const [discValue, setDiscValue] = useState(order.discount?.value ? String(order.discount.value) : '')

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0)
  const discountAmount = discountAmountOf(order.discount, subtotal)
  const total = Math.max(0, subtotal - discountAmount)
  const orderLabel = order.customer?.name?.trim() || `Sale ${order.number}`
  const orderSub = order.customer?.name?.trim() ? `Sale ${order.number}` : t('rsWalkIn')

  function backToSale() { dispatch({ type: 'SET_VIEW', payload: 'sell' }) }

  function setQty(item, qty) {
    dispatch({ type: 'UPDATE_CART_QTY', payload: { cartItemId: item.cartItemId || item.productId, qty } })
  }

  function saveDiscount() {
    const v = Number(discValue)
    dispatch({ type: 'SET_ORDER_DISCOUNT', payload: v > 0 ? { type: discType, value: v } : null })
    setDiscEditing(false)
  }
  function clearDiscount() {
    dispatch({ type: 'SET_ORDER_DISCOUNT', payload: null })
    setDiscValue(''); setDiscEditing(false)
  }

  function holdSale() {
    dispatch({ type: 'NEW_ORDER' })
    showToast(t('rsHeldToast'))
    dispatch({ type: 'SET_VIEW', payload: 'home' })
  }

  function completeSale() {
    openModal(<CheckoutModal />)
  }

  if (items.length === 0) {
    return (
      <div className="pos-screen pos-v2">
        <div className="pos-header">
          <button className="home-iconbtn" onClick={backToSale}>←</button>
          <h2 className="pos-title">{t('rsTitle')}</h2>
          <span style={{ width: 44 }} />
        </div>
        <div className="empty" style={{ margin: 24 }}>{t('rsEmptyCart')}</div>
      </div>
    )
  }

  return (
    <div className="pos-screen pos-v2 review-screen">
      {/* Header */}
      <div className="pos-header">
        <button className="home-iconbtn" onClick={backToSale}>←</button>
        <div className="pos-session-title-stack">
          <h2 className="pos-title">{t('rsTitle')}{state.orders.length > 1 ? ` · ${orderLabel}` : ''}</h2>
          <span className="pos-session-subtitle">{orderSub}</span>
        </div>
        <span style={{ width: 44 }} />
      </div>

      <div className="review-scroll">
        {/* Customer */}
        <div className="review-section">
          <div className="review-section-head">
            <strong>{t('rsCustomer')}</strong>
            {order.customer
              ? <button className="home-link" onClick={() => openModal(<CustomerPicker />)}>{t('rsChangeCustomer')}</button>
              : <button className="home-link" onClick={() => openModal(<CustomerPicker />)}>+ {t('rsAddCustomer')}</button>}
          </div>
          {order.customer ? (
            <button className="review-cust-card" onClick={() => openModal(<CustomerPicker />)}>
              <span className="review-cust-avatar">{(order.customer.name || '?').charAt(0).toUpperCase()}</span>
              <span className="review-cust-text">
                <strong>{order.customer.name}</strong>
                <span>{order.customer.phone || t('rsWalkIn')}</span>
              </span>
              <IconChevron size={18} />
            </button>
          ) : (
            <button className="review-cust-empty" onClick={() => openModal(<CustomerPicker />)}>
              <span className="review-cust-avatar review-cust-avatar--empty"><IconUser size={20} /></span>
              <span>{t('rsWalkIn')}</span>
              <IconPlus size={18} />
            </button>
          )}
        </div>

        {/* Items */}
        <div className="review-section">
          <div className="review-section-head">
            <strong>{t('rsItems')} ({items.length})</strong>
            <button className="home-link" onClick={backToSale}>{t('rsEditCart')}</button>
          </div>
          <div className="review-items">
            {items.map(item => {
              const isFlex = item.type === 'flexible'
              return (
                <div key={item.cartItemId || item.productId} className="review-item">
                  <Thumb item={item} product={productById(item.productId)} />
                  <div className="review-item-info">
                    <strong>{item.name}</strong>
                    <span>{money(item.price)}{!isFlex && ` × ${item.qty}`}</span>
                  </div>
                  {!isFlex ? (
                    <div className="qty-control review-qty">
                      <button className="qty-btn" onClick={() => setQty(item, item.qty - 1)}>−</button>
                      <span className="qty-value">{item.qty}</span>
                      <button className="qty-btn" onClick={() => setQty(item, item.qty + 1)}>+</button>
                    </div>
                  ) : (
                    <button className="review-remove" onClick={() => setQty(item, 0)}>×</button>
                  )}
                  <strong className="review-item-total">{money(item.price * item.qty)}</strong>
                </div>
              )
            })}
          </div>
        </div>

        {/* Totals */}
        <div className="review-section review-totals">
          <div className="review-total-row">
            <span>{t('rsSubtotal')}</span>
            <strong>{money(subtotal)}</strong>
          </div>

          {/* Discount */}
          {!discEditing ? (
            <button className="review-total-row review-disc-row" onClick={() => setDiscEditing(true)}>
              <span>{t('rsDiscount')}</span>
              <span className="review-disc-value">
                {discountAmount > 0 ? `− ${money(discountAmount)}` : t('rsNoDiscount')}
                <IconChevron size={16} />
              </span>
            </button>
          ) : (
            <div className="review-disc-editor">
              <div className="co-discount-row">
                <button className={`co-discount-btn${discType === 'percent' ? ' is-active' : ''}`} onClick={() => setDiscType('percent')}>{t('percentOffBtn')}</button>
                <button className={`co-discount-btn${discType === 'flat' ? ' is-active' : ''}`} onClick={() => setDiscType('flat')}>{t('flatOffBtn')}</button>
              </div>
              <input
                className="field" type="number" min="0" autoFocus
                placeholder={discType === 'percent' ? t('egPercent') : t('egFlat')}
                value={discValue}
                onChange={e => setDiscValue(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') saveDiscount() }}
              />
              <div className="row" style={{ marginTop: 8 }}>
                <button className="button" onClick={saveDiscount}>{t('doneBtn')}</button>
                <button className="button light" onClick={clearDiscount}>{t('rsNoDiscount')}</button>
              </div>
            </div>
          )}

          <div className="review-total-row review-grand">
            <span>{t('rsTotal')}</span>
            <strong>{money(total)}</strong>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="review-actions">
        <button className="button light review-hold" onClick={holdSale}>❚❚ {t('rsHoldSale')}</button>
        <button className="button review-complete" onClick={completeSale}>✓ {t('rsCompleteSale')}</button>
      </div>
    </div>
  )
}
