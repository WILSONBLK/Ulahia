import { useState, useRef } from 'react'

let _posSearch = ''
import { useStore } from '../store.jsx'
import { useModal } from '../modal.jsx'
import { money } from '../utils.js'
import { useLang } from '../useLang.js'
import CheckoutModal from './CheckoutModal.jsx'
import ProductForm from './ProductForm.jsx'

export default function POSScreen() {
  const { state, dispatch } = useStore()
  const { openModal } = useModal()
  const t = useLang()
  const [search, setSearch] = useState(_posSearch)
  function updateSearch(val) { _posSearch = val; setSearch(val) }
  const [activeFlexId, setActiveFlexId] = useState(null)
  const [flexAmount, setFlexAmount] = useState('')
  const [confirmClear, setConfirmClear] = useState(false)
  const flexInputRef = useRef(null)

  const sorted = [...state.products].sort((a, b) => {
    const aOut = a.type === 'fixed' && a.qty <= 0
    const bOut = b.type === 'fixed' && b.qty <= 0
    if (aOut && !bOut) return 1
    if (!aOut && bOut) return -1
    return 0
  })
  const filtered = sorted.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  const cartTotal = state.cart.reduce((sum, i) => sum + i.price * i.qty, 0)
  const cartCount = state.cart.reduce((sum, i) => sum + i.qty, 0)

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

  return (
    <div className="pos-screen">

      {/* Header */}
      <div className="pos-header">
        <button className="pos-back-btn" onClick={() => dispatch({ type: 'SET_VIEW', payload: 'home' })}>
          ← {t('dashboard')}
        </button>
        <h2 className="pos-title">{t('newSale')}</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          {state.cart.length > 0 && (
            confirmClear ? (
              <>
                <button className="pos-clear-btn" style={{ color: 'var(--red)', fontWeight: 800 }}
                  onClick={() => { dispatch({ type: 'CLEAR_CART' }); setConfirmClear(false) }}>
                  Sure?
                </button>
                <button className="pos-back-btn" onClick={() => setConfirmClear(false)}>Keep</button>
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
            {search ? `No products matching "${search}"` : t('noProductsYet')}
          </div>
        )}

        {filtered.map(product => {
          const isFixed = !product.type || product.type === 'fixed'
          const fixedCartItem = isFixed ? state.cart.find(i => i.productId === product.id) : null
          const flexCartLines = isFixed ? [] : state.cart.filter(i => i.productId === product.id)
          const qty = fixedCartItem?.qty || 0
          const outOfStock = isFixed && product.qty <= 0
          const lowStock = isFixed && product.qty > 0 && product.qty <= product.low
          const isFlexActive = activeFlexId === product.id

          return (
            <div key={product.id} className="pos-product-block">

              {/* Product row */}
              <div className={`pos-product-row${outOfStock ? ' out-of-stock' : ''}`}>
                <div className="pos-product-info">
                  <strong className="pos-product-name">{product.name}</strong>
                  <div className="pos-product-meta">
                    {isFixed ? (
                      <>
                        <span>{money(product.price)}</span>
                        {product.cost > 0 && !outOfStock && (
                          <span style={{ color: 'var(--green)', fontSize: '0.8rem', fontWeight: 700 }}>
                            {Math.round((product.price - product.cost) / product.price * 100)}%
                          </span>
                        )}
                        {lowStock && <span className="pill warn pos-stock-pill">{product.qty} left</span>}
                        {outOfStock && <span className="pill bad pos-stock-pill">Out of stock</span>}
                      </>
                    ) : (
                      <span className="pos-flex-label">⚖️ Tap to enter amount</span>
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
                      <span className="qty-value">{qty}</span>
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

                {/* Flexible: always show [Enter ₦] — each tap adds a new independent line */}
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
                        Add
                      </button>
                      <button className="flex-cancel-btn" onClick={() => setActiveFlexId(null)}>×</button>
                    </div>
                  ) : (
                    <button className="pos-add-btn flex-trigger" onClick={() => openFlexInput(product.id)}>
                      + Enter ₦
                    </button>
                  )
                )}
              </div>

              {/* Flexible cart lines — each is an independent amount, remove only */}
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
            <span className="pos-cart-count">{cartCount} {cartCount === 1 ? 'item' : 'items'}</span>
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
