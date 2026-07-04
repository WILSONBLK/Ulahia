import { useState, useRef, useEffect } from 'react'

let _posSearch = ''
let _posCategory = 'all'
import { useStore, getActiveOrder } from '../store.jsx'
import { useModal } from '../modal.jsx'
import { money } from '../utils.js'
import { useLang } from '../useLang.js'
import ProductForm from './ProductForm.jsx'
import OrderTabs from './OrderTabs.jsx'
import CustomerSearch from './CustomerSearch.jsx'
import { CATEGORIES, CATEGORY_KEY } from '../categories.js'
import { IconUsers, IconSearch, IconBox } from './icons.jsx'

// Small product thumbnail — real image, else a colored initial tile
function Thumb({ product }) {
  if (product.image) {
    return <span className="pos-thumb"><img src={product.image} alt="" /></span>
  }
  const initial = (product.name || '?').trim().charAt(0).toUpperCase()
  return <span className="pos-thumb pos-thumb--initial">{initial}</span>
}

// Attach-customer modal (person+ icon) — commit on Save
function AttachCustomerModal() {
  const { state, dispatch } = useStore()
  const { closeModal } = useModal()
  const t = useLang()
  const order = getActiveOrder(state)
  const [sel, setSel] = useState(order.customer)
  const [editedName, setEditedName] = useState(order.customer?.name || '')
  const saleLabel = `Sale ${order.number}`

  useEffect(() => {
    setEditedName(sel?.name || '')
  }, [sel])

  function setWalkIn() {
    dispatch({ type: 'SET_ORDER_CUSTOMER', payload: null })
    closeModal()
  }

  function saveCustomer() {
    const name = editedName.trim()
    if (!name) return
    dispatch({ type: 'SET_ORDER_CUSTOMER', payload: { ...(sel || {}), name } })
    closeModal()
  }

  function createNewSale() {
    dispatch({ type: 'NEW_ORDER' })
    closeModal()
  }

  const hasCustomerName = !!sel?.name?.trim()

  return (
    <div className="store-modal">
      <h3>{t('rsAddCustomer')}</h3>
      <CustomerSearch value={sel} onChange={setSel} />
      {sel && (
        <label className="label" style={{ marginTop: 10 }}>
          {t('customerName')}
          <input
            className="field"
            value={editedName}
            onChange={e => setEditedName(e.target.value)}
            placeholder={saleLabel}
          />
        </label>
      )}
      <div className="row" style={{ marginTop: 12 }}>
        <button className="button" disabled={!editedName.trim()} style={{ opacity: editedName.trim() ? 1 : 0.5 }}
          onClick={saveCustomer}>
          {t('doneBtn')}
        </button>
        {hasCustomerName && <button className="button light" onClick={setWalkIn}>{t('rsWalkIn')}</button>}
      </div>
      <div className="row" style={{ marginTop: 10 }}>
        <button className="button light" onClick={createNewSale}>+ New Sale</button>
        <button className="button light" onClick={closeModal}>{t('cancel')}</button>
      </div>
    </div>
  )
}

export default function POSScreen() {
  const { state, dispatch } = useStore()
  const { openModal } = useModal()
  const t = useLang()
  const activeOrder = getActiveOrder(state)
  const activeCart = activeOrder.items
  const activeSaleLabel = activeOrder.customer?.name?.trim() || `Sale ${activeOrder.number}`
  const activeSaleSub = activeOrder.customer?.name?.trim() ? `Sale ${activeOrder.number}` : t('rsWalkIn')
  const [search, setSearch] = useState(_posSearch)
  const [category, setCategory] = useState(_posCategory)
  function updateSearch(val) { _posSearch = val; setSearch(val) }
  function updateCategory(val) { _posCategory = val; setCategory(val) }
  const [activeFlexId, setActiveFlexId] = useState(null)
  const [flexAmount, setFlexAmount] = useState('')
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

  const filtered = sorted.filter(p => {
    if (!p.name.toLowerCase().includes(search.toLowerCase())) return false
    if (category !== 'all' && (p.category || '') !== category) return false
    return true
  })

  // Which category chips to show — only those with products (plus All)
  const usedCategories = new Set(state.products.map(p => p.category).filter(Boolean))
  const chips = [{ id: 'all', key: 'catAll' }, ...CATEGORIES.filter(c => usedCategories.has(c.id))]

  const hasPinned = filtered.some(p => pinnedIds.includes(p.id))

  const cartTotal = activeCart.reduce((sum, i) => sum + i.price * i.qty, 0)
  const cartCount = activeCart.reduce((sum, i) => sum + i.qty, 0)

  function addFixed(productId) { dispatch({ type: 'ADD_TO_CART', payload: productId }) }
  function updateFixed(productId, qty) { dispatch({ type: 'UPDATE_CART_QTY', payload: { cartItemId: productId, qty } }) }
  function removeFlexLine(cartItemId) { dispatch({ type: 'UPDATE_CART_QTY', payload: { cartItemId, qty: 0 } }) }

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
    if (!isNaN(qty) && qty >= 0) dispatch({ type: 'UPDATE_CART_QTY', payload: { cartItemId: productId, qty } })
    setEditQtyId(null)
    setEditQtyVal('')
  }
  function togglePin(productId) { dispatch({ type: 'TOGGLE_PIN_PRODUCT', payload: productId }) }

  return (
    <div className="pos-screen pos-v2">

      {/* Header */}
      <div className="pos-header">
        <button className="home-iconbtn" aria-label={t('dashboard')} onClick={() => dispatch({ type: 'SET_VIEW', payload: 'home' })}>←</button>
        <div className="pos-session-title-stack">
          <h2 className="pos-title">{activeSaleLabel}</h2>
          <span className="pos-session-subtitle">{activeSaleSub}</span>
        </div>
        <button className="home-iconbtn" aria-label={t('rsAddCustomer')} onClick={() => openModal(<AttachCustomerModal />)}>
          <IconUsers size={22} />
          {activeOrder.customer && <span className="pos-cust-dot" />}
        </button>
      </div>

      {/* Search */}
      <div className="pos-search-wrap">
        <span className="pos-search-field">
          <span className="pos-search-icon"><IconSearch size={19} /></span>
          <input
            className="pos-search-input"
            placeholder={`${t('search')}...`}
            value={search}
            onChange={e => updateSearch(e.target.value)}
            autoComplete="off"
          />
        </span>
        <button
          className="pos-addprod-icon"
          aria-label={t('addProduct')}
          title={t('addProduct')}
          onClick={() => openModal(<ProductForm />)}
        >
          <IconBox size={20} />
          <span className="pos-addprod-plus">+</span>
        </button>
      </div>

      {/* Category chips */}
      {chips.length > 1 && (
        <div className="pos-chips">
          {chips.map(c => (
            <button
              key={c.id}
              className={`pos-chip${category === c.id ? ' is-active' : ''}`}
              onClick={() => updateCategory(c.id)}
            >
              {t(c.key)}
            </button>
          ))}
        </div>
      )}

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

          const showPinnedDivider = isPinned && (idx === 0 || !pinnedIds.includes(filtered[idx - 1]?.id))
          const showOthersDivider = !isPinned && hasPinned && (idx === 0 || pinnedIds.includes(filtered[idx - 1]?.id))

          return (
            <div key={product.id} className="pos-product-block">
              {showPinnedDivider && <div className="pos-pinned-divider">⭐ {t('pinnedProductsHeader')}</div>}
              {showOthersDivider && hasPinned && (
                <div className="pos-pinned-divider" style={{ background: 'var(--bg)', color: 'var(--muted)' }}>{t('allProductsHeader')}</div>
              )}

              <div className={`pos-product-row${outOfStock ? ' out-of-stock' : ''}`}>
                <button
                  className={`pos-pin-btn${isPinned ? ' is-pinned' : ''}`}
                  onClick={() => togglePin(product.id)}
                  title={isPinned ? t('unpinTitle') : t('pinToTopTitle')}
                >
                  {isPinned ? '⭐' : '☆'}
                </button>

                <Thumb product={product} />

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

                {isFixed && (
                  qty === 0 ? (
                    <button className="pos-add-btn" onClick={() => addFixed(product.id)} disabled={outOfStock}>
                      + {t('addGoods')}
                    </button>
                  ) : (
                    <div className="qty-control">
                      <button className="qty-btn" onClick={() => updateFixed(product.id, qty - 1)}>−</button>
                      {editQtyId === product.id ? (
                        <input
                          ref={qtyInputRef}
                          className="qty-quick-input"
                          type="number" min="0" max={product.qty}
                          value={editQtyVal}
                          onChange={e => setEditQtyVal(e.target.value)}
                          onBlur={() => commitQtyEdit(product.id)}
                          onKeyDown={e => { if (e.key === 'Enter') commitQtyEdit(product.id) }}
                        />
                      ) : (
                        <span className="qty-value" style={{ cursor: 'pointer' }} onClick={() => openQtyEdit(product.id, qty)} title={t('tapTypeQty')}>{qty}</span>
                      )}
                      <button className="qty-btn" onClick={() => updateFixed(product.id, qty + 1)} disabled={qty >= product.qty}>+</button>
                    </div>
                  )
                )}

                {!isFixed && (
                  isFlexActive ? (
                    <div className="flex-input-wrap">
                      <span className="flex-naira">₦</span>
                      <input
                        ref={flexInputRef}
                        className="flex-amount-input"
                        type="number" min="1"
                        value={flexAmount}
                        onChange={e => setFlexAmount(e.target.value)}
                        placeholder="0"
                        onKeyDown={e => { if (e.key === 'Enter') addFlex(product); if (e.key === 'Escape') setActiveFlexId(null) }}
                      />
                      <button className="flex-add-btn" onClick={() => addFlex(product)} disabled={!flexAmount || Number(flexAmount) <= 0}>{t('flexAddBtn')}</button>
                      <button className="flex-cancel-btn" onClick={() => setActiveFlexId(null)}>×</button>
                    </div>
                  ) : (
                    <button className="pos-add-btn flex-trigger" onClick={() => openFlexInput(product.id)}>+ {t('enterAmountBtn')}</button>
                  )
                )}
              </div>

              {flexCartLines.map(line => (
                <div key={line.cartItemId} className="pos-flex-cart-line">
                  <span className="pos-flex-line-price">{money(line.price)}</span>
                  <button className="flex-remove-btn" onClick={() => removeFlexLine(line.cartItemId)}>×</button>
                </div>
              ))}
            </div>
          )
        })}
      </div>

      {/* Order tabs (multi-sale) */}
      <OrderTabs />

      {/* Review bar */}
      {cartCount > 0 && (
        <div className="pos-checkout-bar">
          <div className="pos-cart-summary">
            <span className="pos-cart-count">{cartCount === 1 ? t('cartItemsOne') : t('cartItemsMany', { n: cartCount })}</span>
            <strong className="pos-cart-total">{money(cartTotal)}</strong>
          </div>
          <button className="checkout-btn" onClick={() => dispatch({ type: 'SET_VIEW', payload: 'review' })}>
            {t('reviewSaleBtn')} →
          </button>
        </div>
      )}
    </div>
  )
}
