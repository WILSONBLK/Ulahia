import { useState } from 'react'
import { useStore } from '../store.jsx'
import { useModal } from '../modal.jsx'
import { useToast } from '../toast.jsx'
import { money } from '../utils.js'
import { useLang } from '../useLang.js'
import { usePinGate } from './PinGate.jsx'
import { CATEGORIES, CATEGORY_KEY } from '../categories.js'
import ProductForm from './ProductForm.jsx'
import RestockModal from './RestockModal.jsx'
import BarcodeScanner from './BarcodeScanner.jsx'
import ProductThumb from './ProductThumb.jsx'
import { IconSearch, IconCamera, IconPlus, IconMore, IconChevron, IconBox } from './icons.jsx'

function getRecovery(product, transactions) {
  const totalSold = transactions
    .flatMap(t => t.items)
    .filter(i => i.productId === product.id && i.type === 'flexible')
    .reduce((sum, i) => sum + i.price * i.qty, 0)
  const pct = product.invested > 0 ? Math.round((totalSold / product.invested) * 100) : null
  return { totalSold, pct, recovered: pct !== null && pct >= 100, low: pct !== null && pct >= 80 }
}

const btnSm = { minHeight: 34, padding: '0 12px', fontSize: '0.8rem' }

// Module-level so search/filter survive view switches (same pattern as POS)
let _prodSearch = ''
let _prodCategory = 'all'

export default function Products() {
  const { state, dispatch } = useStore()
  const { openModal } = useModal()
  const showToast = useToast()
  const t = useLang()
  const { requirePin } = usePinGate()
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
  const [openActionsId, setOpenActionsId] = useState(null)
  const [search, setSearch] = useState(_prodSearch)
  const [category, setCategory] = useState(_prodCategory)
  const updateSearch = v => { _prodSearch = v; setSearch(v) }
  const updateCategory = v => { _prodCategory = v; setCategory(v) }

  function deleteProduct(id, name) {
    const product = state.products.find(p => p.id === id)
    dispatch({ type: 'DELETE_PRODUCT', payload: id })
    setConfirmDeleteId(null)
    setOpenActionsId(null)
    showToast(t('removedToast', { name }), {
      undo: () => dispatch({ type: 'RESTORE_PRODUCT', payload: product }),
    })
  }

  function toggleActions(id) {
    setConfirmDeleteId(null)
    setOpenActionsId(cur => (cur === id ? null : id))
  }

  function ProductActions({ p }) {
    return (
      <div className="prod-actions-row">
        <button className="button light" style={btnSm} onClick={() => requirePin(() => openModal(<ProductForm product={p} />))}>{t('editProduct')}</button>
        <button className="button secondary" style={btnSm} onClick={() => requirePin(() => openModal(<RestockModal product={p} />))}>{t('restock')}</button>
        {confirmDeleteId === p.id
          ? <button className="button" style={{ ...btnSm, background: 'var(--red)' }} onClick={() => requirePin(() => deleteProduct(p.id, p.name))}>{t('sureBtn')}</button>
          : <button className="button light" style={{ ...btnSm, color: 'var(--red)' }} onClick={() => setConfirmDeleteId(p.id)}>{t('deleteProduct')}</button>
        }
      </div>
    )
  }

  const q = search.trim().toLowerCase()
  const visible = state.products.filter(p => {
    if (q && !p.name.toLowerCase().includes(q)) return false
    if (category !== 'all' && (p.category || '') !== category) return false
    return true
  })

  const fixed = visible.filter(p => !p.type || p.type === 'fixed')
  const flexible = visible.filter(p => p.type === 'flexible')

  // Summary counts are for the whole shop, not the current filter
  const allFixed = state.products.filter(p => !p.type || p.type === 'fixed')
  const allFlexible = state.products.filter(p => p.type === 'flexible')
  const lowFixedCount = allFixed.filter(p => p.qty <= p.low).length
  const lowFlexCount = allFlexible.filter(p => {
    const { low, recovered } = getRecovery(p, state.transactions)
    return low || recovered
  }).length
  const totalAlerts = lowFixedCount + lowFlexCount

  const usedCategories = new Set(state.products.map(p => p.category).filter(Boolean))
  const chips = [{ id: 'all', key: 'catAll' }, ...CATEGORIES.filter(c => usedCategories.has(c.id))]

  return (
    <div className="screen-content">

      {/* Search + quick actions */}
      <div className="prod-toolbar">
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
        <button className="prod-tool-btn" aria-label={t('scanBtn')} title={t('scanBtn')} onClick={() => openModal(<BarcodeScanner />)}>
          <IconCamera size={20} />
        </button>
        <button className="prod-tool-btn prod-tool-btn--primary" aria-label={t('addProduct')} title={t('addProduct')} onClick={() => requirePin(() => openModal(<ProductForm />))}>
          <IconPlus size={20} />
        </button>
      </div>

      {/* Category chips */}
      {chips.length > 1 && (
        <div className="pos-chips prod-chips">
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

      {!state.products.length && (
        <div className="empty">{t('noProductsYet')}</div>
      )}
      {state.products.length > 0 && !visible.length && (
        <div className="empty">{q ? t('noProductsMatching', { query: search }) : t('noProductsMatchingFilter')}</div>
      )}

      {/* ── Counted Products ── */}
      {fixed.length > 0 && (
        <section className="section">
          <div className="section-kicker-row">
            <span className="section-kicker">📦 {t('countedProducts')}</span>
          </div>
          <div className="list">
            {fixed.map(p => {
              const isLow = p.qty <= p.low
              const isOut = p.qty === 0
              const expanded = openActionsId === p.id
              return (
                <div key={p.id} className={`prod-card${expanded ? ' is-open' : ''}`}>
                  <div className="prod-card-main">
                    <ProductThumb product={p} size={46} />
                    <div className="prod-card-info">
                      <strong>{p.name}</strong>
                      <span className="prod-card-sub">
                        {p.category ? t(CATEGORY_KEY[p.category]) : t('countedProducts')}
                      </span>
                    </div>
                    <div className="prod-card-right">
                      <strong className="prod-card-price">{money(p.price)}</strong>
                      <span className={`prod-card-stock${isOut ? ' is-out' : isLow ? ' is-low' : ''}`}>
                        {isOut ? t('outOfStock') : t('inStockLabel', { qty: p.qty })}
                      </span>
                    </div>
                    <button
                      className="prod-card-more"
                      aria-label={t('prodActionsLabel')}
                      aria-expanded={expanded}
                      onClick={() => toggleActions(p.id)}
                    >
                      <IconMore size={18} />
                    </button>
                  </div>
                  {expanded && <ProductActions p={p} />}
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* ── Flexible Products with Recovery Tracking ── */}
      {flexible.length > 0 && (
        <section className="section">
          <div className="section-kicker-row">
            <span className="section-kicker">⚖️ {t('flexibleProducts')}</span>
          </div>
          <div className="list">
            {flexible.map(p => {
              const { totalSold, pct, recovered, low } = getRecovery(p, state.transactions)
              const hasInvested = p.invested > 0
              const expanded = openActionsId === p.id

              return (
                <div key={p.id} className={`flex-prod-card${expanded ? ' is-open' : ''}`}>
                  <div className="prod-card-main" style={{ padding: 0, border: 0, background: 'transparent' }}>
                    <ProductThumb product={p} size={46} />
                    <div className="prod-card-info">
                      <strong>{p.name}</strong>
                      <span className="prod-card-sub">
                        {p.category ? t(CATEGORY_KEY[p.category]) : t('flexible')}
                      </span>
                    </div>
                    {recovered
                      ? <span className="pill bad">⚠ {t('likelyOut')}</span>
                      : low
                      ? <span className="pill warn">{t('runningLow')}</span>
                      : <span className="pill">{t('flexible')}</span>
                    }
                    <button
                      className="prod-card-more"
                      aria-label={t('prodActionsLabel')}
                      aria-expanded={expanded}
                      onClick={() => toggleActions(p.id)}
                    >
                      <IconMore size={18} />
                    </button>
                  </div>

                  {recovered && (
                    <div className="restock-alert">{t('stockLikelySoldOut')}</div>
                  )}

                  {expanded && <ProductActions p={p} />}

                  {hasInvested ? (
                    <>
                      <div className="recovery-stats">
                        <div className="recovery-stat">
                          <span>{t('invested')}</span>
                          <strong>{money(p.invested)}</strong>
                        </div>
                        <div className="recovery-stat">
                          <span>{t('sold')}</span>
                          <strong>{money(totalSold)}</strong>
                        </div>
                        <div className="recovery-stat">
                          <span>{t('recovery')}</span>
                          <strong className={recovered ? 'amount bad' : low ? 'amount warn' : ''}>{pct}%</strong>
                        </div>
                      </div>
                      <div className="recovery-bar-wrap">
                        <div
                          className="recovery-bar-fill"
                          style={{
                            width: `${Math.min(100, pct)}%`,
                            background: recovered ? 'var(--red)' : low ? 'var(--yellow)' : 'var(--blue)',
                          }}
                        />
                      </div>
                    </>
                  ) : (
                    <span className="flex-prod-hint">{t('soldByAmount')}</span>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Summary footer — taps through to bulk restock */}
      {state.products.length > 0 && (
        <button className="prod-summary" onClick={() => dispatch({ type: 'SET_VIEW', payload: 'bulk-restock' })}>
          <span className="prod-summary-cell">
            <span className="prod-summary-icon"><IconBox size={20} /></span>
            <span className="prod-summary-text">
              <span>{t('prodTotalLabel')}</span>
              <strong>{state.products.length}</strong>
            </span>
          </span>
          <span className="prod-summary-divider" />
          <span className="prod-summary-cell">
            <span className="prod-summary-text">
              <span>{t('prodLowStockLabel')}</span>
              <strong className={totalAlerts > 0 ? 'prod-summary-alert' : ''}>{totalAlerts}</strong>
            </span>
          </span>
          <IconChevron size={18} />
        </button>
      )}
    </div>
  )
}
