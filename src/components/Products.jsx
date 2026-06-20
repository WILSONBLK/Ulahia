import { useState } from 'react'
import { useStore } from '../store.jsx'
import { useModal } from '../modal.jsx'
import { useToast } from '../toast.jsx'
import { money } from '../utils.js'
import { useLang } from '../useLang.js'
import ProductForm from './ProductForm.jsx'
import RestockModal from './RestockModal.jsx'
import BarcodeScanner from './BarcodeScanner.jsx'

function getRecovery(product, transactions) {
  const totalSold = transactions
    .flatMap(t => t.items)
    .filter(i => i.productId === product.id && i.type === 'flexible')
    .reduce((sum, i) => sum + i.price * i.qty, 0)
  const pct = product.invested > 0 ? Math.round((totalSold / product.invested) * 100) : null
  return { totalSold, pct, recovered: pct !== null && pct >= 100, low: pct !== null && pct >= 80 }
}

const btnSm = { minHeight: 32, padding: '0 10px', fontSize: '0.8rem' }

export default function Products() {
  const { state, dispatch } = useStore()
  const { openModal } = useModal()
  const showToast = useToast()
  const t = useLang()
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)

  function deleteProduct(id, name) {
    dispatch({ type: 'DELETE_PRODUCT', payload: id })
    setConfirmDeleteId(null)
    showToast(`${name} removed.`)
  }

  function ProductActions({ p }) {
    return (
      <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
        <button className="button light" style={btnSm} onClick={() => openModal(<ProductForm product={p} />)}>Edit</button>
        {confirmDeleteId === p.id
          ? <button className="button" style={{ ...btnSm, background: 'var(--red)' }} onClick={() => deleteProduct(p.id, p.name)}>Sure?</button>
          : <button className="button light" style={{ ...btnSm, color: 'var(--red)' }} onClick={() => setConfirmDeleteId(p.id)}>Delete</button>
        }
      </div>
    )
  }

  const fixed = state.products.filter(p => !p.type || p.type === 'fixed')
  const flexible = state.products.filter(p => p.type === 'flexible')

  const lowFixedCount = fixed.filter(p => p.qty <= p.low).length
  const lowFlexCount = flexible.filter(p => {
    const { low, recovered } = getRecovery(p, state.transactions)
    return low || recovered
  }).length
  const totalAlerts = lowFixedCount + lowFlexCount

  return (
    <div className="screen-content">
      <div className="screen-top-actions" style={{ flexWrap: 'wrap', gap: 8 }}>
        <button className="button" onClick={() => openModal(<ProductForm />)}>
          + {t('addProduct')}
        </button>
        <button
          className="button secondary"
          onClick={() => dispatch({ type: 'SET_VIEW', payload: 'bulk-restock' })}
        >
          📦 {t('bulkRestock')}{totalAlerts > 0 ? ` (${totalAlerts})` : ''}
        </button>
        <button className="button light" onClick={() => openModal(<BarcodeScanner />)}>
          📷 Scan
        </button>
      </div>

      {!state.products.length && (
        <div className="empty">{t('noProductsYet')}</div>
      )}

      {/* ── Counted Products ── */}
      {fixed.length > 0 && (
        <section className="section">
          <div className="section-kicker-row">
            <span className="section-kicker">📦 {t('countedProducts')}</span>
          </div>
          <div className="list">
            {fixed.map(p => {
              const pct = Math.min(100, ((p.qty || 0) / Math.max((p.low || 1) * 3, 1)) * 100)
              const isLow = p.qty <= p.low
              const isOut = p.qty === 0
              return (
                <div key={p.id} className="prod-row">
                  <div className="prod-info">
                    <strong>{p.name}</strong>
                    <span>{money(p.price)} · Cost {money(p.cost)}</span>
                    <div className="prod-bar-wrap">
                      <div className="prod-bar" style={{ width: `${pct}%`, background: isOut ? 'var(--red)' : isLow ? 'var(--yellow)' : 'var(--green)' }} />
                    </div>
                    <ProductActions p={p} />
                  </div>
                  <div className="prod-right">
                    <strong className={isOut ? 'amount bad' : isLow ? 'amount warn' : ''}>{p.qty}</strong>
                    <span className="prod-unit">{t('units')}</span>
                    {isOut && <span className="pill bad" style={{ fontSize: '0.72rem' }}>{t('outOfStock')}</span>}
                    {!isOut && isLow && <span className="pill warn" style={{ fontSize: '0.72rem' }}>{t('lowStock')}</span>}
                    <button
                      className="restock-btn"
                      onClick={() => openModal(<RestockModal product={p} />)}
                    >
                      {t('restock')}
                    </button>
                  </div>
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

              return (
                <div key={p.id} className="flex-prod-card">
                  <div className="flex-prod-header">
                    <strong className="flex-prod-name">{p.name}</strong>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      {recovered
                        ? <span className="pill bad">⚠ {t('likelyOut')}</span>
                        : low
                        ? <span className="pill warn">{t('runningLow')}</span>
                        : <span className="pill">{t('flexible')}</span>
                      }
                      <button
                        className="restock-btn"
                        onClick={() => openModal(<RestockModal product={p} />)}
                      >
                        Restock
                      </button>
                    </div>
                  </div>

                  {/* Restock alert banner */}
                  {recovered && (
                    <div className="restock-alert">
                      {t('stockLikelySoldOut')}
                    </div>
                  )}

                  <ProductActions p={p} />

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
                          <strong className={recovered ? 'amount bad' : low ? 'amount warn' : ''}>
                            {pct}%
                          </strong>
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
    </div>
  )
}
