import { useState } from 'react'
import { useStore } from '../store.jsx'
import { useToast } from '../toast.jsx'
import { money } from '../utils.js'
import { usePinGate } from './PinGate.jsx'

function getRecoveryPct(product, transactions) {
  if (product.type !== 'flexible' || !product.invested) return 0
  const sold = transactions
    .flatMap(t => t.items)
    .filter(i => i.productId === product.id)
    .reduce((s, i) => s + i.price * i.qty, 0)
  return Math.round((sold / product.invested) * 100)
}

export default function BulkRestock() {
  const { state, dispatch } = useStore()
  const showToast = useToast()
  const { requirePin } = usePinGate()
  const [values, setValues] = useState({})
  const [filter, setFilter] = useState('all')

  function set(productId, val) {
    setValues(v => ({ ...v, [productId]: val }))
  }

  function applyRestock() {
    const updates = Object.entries(values)
      .filter(([, v]) => v && Number(v) > 0)
      .map(([productId, v]) => {
        const p = state.products.find(p => p.id === productId)
        return p?.type === 'flexible'
          ? { productId, amount: Number(v) }
          : { productId, qty: Number(v) }
      })

    if (!updates.length) { showToast('Enter at least one value to restock.'); return }
    dispatch({ type: 'BULK_RESTOCK', payload: updates })
    showToast(`${updates.length} product${updates.length > 1 ? 's' : ''} restocked!`)
    setValues({})
  }

  function apply() {
    requirePin(applyRestock)
  }

  const fixed = state.products.filter(p => !p.type || p.type === 'fixed')
  const flexible = state.products.filter(p => p.type === 'flexible')

  const needsRestockFixed = fixed.filter(p => p.qty <= p.low)
  const needsRestockFlex = flexible.filter(p => getRecoveryPct(p, state.transactions) >= 80)
  const needsRestockIds = new Set([
    ...needsRestockFixed.map(p => p.id),
    ...needsRestockFlex.map(p => p.id),
  ])

  const showFixed = filter === 'all' ? fixed : fixed.filter(p => needsRestockIds.has(p.id))
  const showFlex = filter === 'all' ? flexible : flexible.filter(p => needsRestockIds.has(p.id))
  const filledCount = Object.values(values).filter(v => v && Number(v) > 0).length

  return (
    <div className="screen-content">

      {/* Filter tabs */}
      <div className="report-periods" style={{ marginBottom: 18 }}>
        <button className={`period-tab${filter === 'all' ? ' is-active' : ''}`} onClick={() => setFilter('all')}>
          All Products
        </button>
        <button className={`period-tab${filter === 'low' ? ' is-active' : ''}`} onClick={() => setFilter('low')}>
          Needs Restock {needsRestockIds.size > 0 && <span className="section-count">{needsRestockIds.size}</span>}
        </button>
      </div>

      {/* Counted products */}
      {showFixed.length > 0 && (
        <section className="section">
          <h3 className="section-title">📦 Counted Products</h3>
          <div className="bulk-list">
            {showFixed.map(p => {
              const isLow = p.qty <= p.low
              const isOut = p.qty === 0
              return (
                <div key={p.id} className={`bulk-row${isOut ? ' bulk-row--out' : isLow ? ' bulk-row--low' : ''}`}>
                  <div className="bulk-info">
                    <strong>{p.name}</strong>
                    <span>
                      {isOut ? '⚠ Out of stock' : isLow ? `⚠ Low — ${p.qty} left` : `${p.qty} in stock`}
                      {' · '}{money(p.price)}
                    </span>
                  </div>
                  <div className="bulk-input-wrap">
                    <span className="bulk-label">+ units</span>
                    <input
                      className="bulk-input"
                      type="number"
                      min="1"
                      placeholder="0"
                      value={values[p.id] || ''}
                      onChange={e => set(p.id, e.target.value)}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Flexible products */}
      {showFlex.length > 0 && (
        <section className="section">
          <h3 className="section-title">⚖️ Flexible Products</h3>
          <div className="bulk-list">
            {showFlex.map(p => {
              const pct = getRecoveryPct(p, state.transactions)
              const isLow = pct >= 80
              const isOut = pct >= 100
              return (
                <div key={p.id} className={`bulk-row${isOut ? ' bulk-row--out' : isLow ? ' bulk-row--low' : ''}`}>
                  <div className="bulk-info">
                    <strong>{p.name}</strong>
                    <span>
                      {isOut ? '⚠ Likely sold out' : isLow ? `⚠ Running low — ${pct}% sold` : `${pct}% sold`}
                      {' · '}Invested {money(p.invested)}
                    </span>
                  </div>
                  <div className="bulk-input-wrap">
                    <span className="bulk-label">+ ₦</span>
                    <input
                      className="bulk-input"
                      type="number"
                      min="1"
                      placeholder="0"
                      value={values[p.id] || ''}
                      onChange={e => set(p.id, e.target.value)}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {showFixed.length === 0 && showFlex.length === 0 && (
        <div className="empty">No products need restocking right now.</div>
      )}

      {/* Sticky apply button */}
      <div className="bulk-footer">
        <button
          className="button"
          style={{ width: '100%', minHeight: 52 }}
          onClick={apply}
          disabled={filledCount === 0}
        >
          {filledCount > 0 ? `✓ Restock ${filledCount} Product${filledCount > 1 ? 's' : ''}` : 'Enter Quantities Above'}
        </button>
      </div>
    </div>
  )
}
