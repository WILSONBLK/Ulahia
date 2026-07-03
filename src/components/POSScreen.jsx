import { useState, useRef } from 'react'

let _posSearch = ''
import { useStore, getActiveOrder } from '../store.jsx'
import { useModal } from '../modal.jsx'
import { money } from '../utils.js'
import { useLang } from '../useLang.js'
import CheckoutModal from './CheckoutModal.jsx'
import ProductForm from './ProductForm.jsx'
import OrderTabs from './OrderTabs.jsx'

export default function POSScreen() {
  const { state, dispatch } = useStore()
  const { openModal } = useModal()
  const t = useLang()
  const activeOrder = getActiveOrder(state)
  const activeCart = activeOrder.items
  const hasMultipleOrders = state.orders.length > 1
  const activeOrderLabel = activeOrder.customLabel || t('orderCustomerLabel', { n: activeOrder.number })
  const [search, setSearch] = useState(_posSearch)
  function updateSearch(val) { _posSearch = val; setSearch(val) }
  const [activeFlexId, setActiveFlexId] = useState(null)
  const [flexAmount, setFlexAmount] = useState('')
  const [confirmClear, setConfirmClear] = useState(false)
  const [editQtyId, setEditQtyId] = useState(null)
  const [editQtyVal, setEditQtyVal] = useState('')
  const flexInputRef = useRef(null)
  const qtyInputRef = useRef(null)

  const pinnedIds = state.pinnedProducts || []

  const sorted = [...state.products].sort((a, b) => {
    const aPinned = pinnedIds.includes(a.id)
    const bPinned = pinnedIds.includes(b.id)
    if (aPinned && !bPinned) return -1
    if (!aPinned && bPinned) return 1
    const aOut = a.type === 'fixed' && a.qty <= 0
    const bOut = b.type === 'fixed' && b.qty <= 0
    if (aOut && !bOut) return 1
    if (!aOut && bOut) return -1
    return 0
  })

  const filtered = sorted.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  const hasPinned = filtered.some(p => pinnedIds.includes(p.id))
  const hasUnpinned = filtered.some(p => !pinnedIds.includes(p.id))

  const cartTotal = activeCart.reduce((sum, i) => sum + i.price * i.qty, 0)
  const cartCount = activeCart.reduce((sum, i) => sum + i.qty, 0)

  function addFixed(productId) {
    dispatch({ type: 'ADD_TO_CART', payload: productId })
  }

  function updateFixed(productId, qty) {
    dispatch({ type: 'UPDATE_CART_QTY', payload: { cartItemId: productId, qty } })
  }

  function removeFlexLine(cartItemId) {
    dispatch({ type: 'UPDATE_CART_QTY', payload: { cartItemId, qty: 0 } })
  }

  function openFlexInput(productId) {
    setActiveFlexId(productId)
    setFlexAmount('')
    setTimeout(() => flexInputRef.current?.focus(), 50)
  }

  function addFlex(product) {
    const amt = Number(flexAmount)
    if (!amt || amt <= 0) return
    dispatch({ type: 'ADD_FLEXIBLE_TO_CART', payload: { productId: product.id, name: product.name, amount: amt } })
    setActiveFlexId(null)
    setFlexAmount('')
  }

  function openQtyEdit(cartItemId, currentQty) {
    setEditQtyId(cartItemId)
    setEditQtyVal(String(currentQty))
    setTimeout(() => qtyInputRef.current?.select(), 30)
  }

  function commitQtyEdit(productId) {
    const qty = parseInt(editQtyVal, 10)
    if (!isNaN(qty) && qty >= 0) {
      dispatch({ type: 'UPDATE_CART_QTY', payload: { cartItemId: productId, qty } })
    }
    setEditQtyId(null)
    setEditQtyVal('')
  }

  function togglePin(productId) {
    dispatch({ type: 'TOGGLE_PIN_PRODUCT', payload: productId })
  }

  let lastWasPinned = null

  return (
    <div className="pos-screen">

      {/* Header */}
      <div className="pos-header">
        <button className="pos-back-btn" onClick={() => dispatch({ type: 'SET_VIEW', payload: 'home' })}>
          ← {t('dashboard')}
        </button>
        <h2 className="pos-title">{t('newSale')}</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className="button light"
            style={{ minHeight: 38, padding: '0 12px', fontSize: '0.88rem' }}
            onClick={() => dispatch({ type: 'NEW_ORDER' })}
          >
            + {t('addCustomer')}
          </button>
          {activeCart.length > 0 && (
            confirmClear ? (
              <>
                <button className="pos-clear-btn" style={{ color: 'var(--red)', fontWeight: 800 }}
                  onClick={() => { dispatch({ type: 'CLEAR_CART' }); setConfirmClear(false) }}>
                  {t('sureBtn')}
                </button>
                <button className="pos-back-btn" onClick={() => setConfirmClear(false)}>{t('keepBtn')}</button>
              </>
            ) : (
              <button className="pos-clear-btn" onClick={() => setConfirmClear(true)}>{t('clear')}</button>
            )
          )}
          <button
            className="button secondary"
            style={{ minHeight: 38, padding: '0 12px', fontSize: '0.88rem' }}
            onClick={() => openModal(<ProductForm />)}
          >
            + {t('addProduct')}
          </button>
        </div>
      </div>

      {hasMultipleOrders && <OrderTabs />}

      {/* Search */}
      <div className="pos-search-wrap">
        <input
          className="field pos-search"
          placeholder={`🔍  ${t('search')}...`}
          value={search}
          onChange={e => updateSearch(e.target.value)}
          autoComplete="off"
        />
      </div>

      {/* Product list */}
      <div className="pos-products">
        {filtered.length === 0 && (
          <div className="empty" style={{ margin: 20 }}>
            {search ? t('noProductsMatching', { query: search }) : t('noProductsYet')}
          </div>
        )}

        {filtered.map((product, idx) => {
          const isPinned = pinnedIds.includes(product.id)
          const isFixed = !product.type || product.type === 'fixed'
          const fixedCartItem = isFixed ? activeCart.find(i => i.productId === product.id) : null
          const flexCartLines = isFixed ? [] : activeCart.filter(i => i.productId === product.id)
          const qty = fixedCartItem?.qty || 0
          const outOfStock = isFixed && product.qty <= 0
          const lowStock = isFixed && product.qty > 0 && product.qty <= product.low
          const isFlexActive = activeFlexId === product.id
          const profitPerUnit = isFixed && product.cost > 0 ? product.price - product.cost : null

          // Section dividers for pinned vs unpinned
          const showPinnedDivider = isPinned && (idx === 0 || !pinnedIds.includes(filtered[idx - 1]?.id))
          const showOthersDivider = !isPinned && hasPinned && (idx === 0 || pinnedIds.includes(filtered[idx - 1]?.id))

          return (
            <div key={product.id} className="pos-product-block">

              {showPinnedDivider && (
                <div className="pos-pinned-divider">⭐ {t('pinnedProductsHeader')}</div>
              )}
              {showOthersDivider && hasPinned && (
                <div className="pos-pinned-divider" style={{ background: 'var(--bg)', color: 'var(--muted)' }}>{t('allProductsHeader')}</div>
              )}

              {/* Product row */}
              <div className={`pos-product-row${outOfStock ? ' out-of-stock' : ''}`}>

                {/* Pin button */}
                <button
                  className={`pos-pin-btn${isPinned ? ' is-pinned' : ''}`}
                  onClick={() => togglePin(product.id)}
                  title={isPinned ? t('unpinTitle') : t('pinToTopTitle')}
                >
                  {isPinned ? '⭐' : '☆'}
                </button>

                <div className="pos-product-info">
                  <strong className="pos-product-name">{product.name}</strong>
                  <div className="pos-product-meta">
                    {isFixed ? (
                      <>
                        <span>{money(product.price)}</span>
                        {profitPerUnit !== null && !outOfStock && (
                          <span className="pos-profit-label">+{money(profitPerUnit)}</span>
                        )}
                        {lowStock && <span className="pill warn pos-stock-pill">{product.qty} {t('leftSuffix')}</span>}
                        {outOfStock && <span className="pill bad pos-stock-pill">{t('outOfStockPill')}</span>}
                      </>
                    ) : (
                      <span className="pos-flex-label">⚖️ {t('tapEnterAmount')}</span>
                    )}
                  </div>
                </div>

                {/* Fixed: [+Add] or [-qty+] */}
                {isFixed && (
                  qty === 0 ? (
                    <button
                      className="pos-add-btn"
                      onClick={() => addFixed(product.id)}
                      disabled={outOfStock}
                    >
                      + {t('addGoods')}
                    </button>
                  ) : (
                    <div className="qty-control">
                      <button className="qty-btn" onClick={() => updateFixed(product.id, qty - 1)}>−</button>
                      {editQtyId === product.id ? (
                        <input
                          ref={qtyInputRef}
                          className="qty-quick-input"
                          type="number"
                          min="0"
                          max={product.qty}
                          value={editQtyVal}
                          onChange={e => setEditQtyVal(e.target.value)}
                          onBlur={() => commitQtyEdit(product.id)}
                          onKeyDown={e => { if (e.key === 'Enter') commitQtyEdit(product.id) }}
                        />
                      ) : (
                        <span
                          className="qty-value"
                          style={{ cursor: 'pointer' }}
                          onClick={() => openQtyEdit(product.id, qty)}
                          title={t('tapTypeQty')}
                        >
                          {qty}
                        </span>
                      )}
                      <button
                        className="qty-btn"
                        onClick={() => updateFixed(product.id, qty + 1)}
                        disabled={qty >= product.qty}
                      >
                        +
                      </button>
                    </div>
                  )
                )}

                {/* Flexible: always show [Enter ₦] */}
                {!isFixed && (
                  isFlexActive ? (
                    <div className="flex-input-wrap">
                      <span className="flex-naira">₦</span>
                      <input
                        ref={flexInputRef}
                        className="flex-amount-input"
                        type="number"
                        min="1"
                        value={flexAmount}
                        onChange={e => setFlexAmount(e.target.value)}
                        placeholder="0"
                        onKeyDown={e => {
                          if (e.key === 'Enter') addFlex(product)
                          if (e.key === 'Escape') setActiveFlexId(null)
                        }}
                      />
                      <button
                        className="flex-add-btn"
                        onClick={() => addFlex(product)}
                        disabled={!flexAmount || Number(flexAmount) <= 0}
                      >
                        {t('flexAddBtn')}
                      </button>
                      <button className="flex-cancel-btn" onClick={() => setActiveFlexId(null)}>×</button>
                    </div>
                  ) : (
                    <button className="pos-add-btn flex-trigger" onClick={() => openFlexInput(product.id)}>
                      + {t('enterAmountBtn')}
                    </button>
                  )
                )}
              </div>

              {/* Flexible cart lines */}
              {flexCartLines.map(line => (
                <div key={line.cartItemId} className="pos-flex-cart-line">
                  <span className="pos-flex-line-price">{money(line.price)}</span>
                  <button className="flex-remove-btn" onClick={() => removeFlexLine(line.cartItemId)}>
                    ×
                  </button>
                </div>
              ))}

            </div>
          )
        })}
      </div>

      {/* Checkout bar */}
      {cartCount > 0 && (
        <div className="pos-checkout-bar">
          <div className="pos-cart-summary">
            {hasMultipleOrders && <span className="pos-cart-order-label">{activeOrderLabel}</span>}
            <span className="pos-cart-count">{cartCount === 1 ? t('cartItemsOne') : t('cartItemsMany', { n: cartCount })}</span>
            <strong className="pos-cart-total">{money(cartTotal)}</strong>
          </div>
          <button
            className="checkout-btn"
            onClick={() => openModal(<CheckoutModal />)}
          >
            {t('checkout')} →
          </button>
        </div>
      )}
    </div>
  )
}
