import { useRef, useState } from 'react'
import { useStore } from '../store.jsx'
import { useModal } from '../modal.jsx'
import { useToast } from '../toast.jsx'
import { useLang } from '../useLang.js'
import { money } from '../utils.js'
import { activeCurrency } from '../currency.js'
import { invoiceImageDataUrl, parseInvoice, matchProduct } from '../invoice.js'
import { IconReceipt, IconCamera, IconPlus, IconX } from './icons.jsx'

let _rowSeq = 0
function emptyRow() {
  return { key: `r${++_rowSeq}`, name: '', qty: '', unitCost: '', price: '', include: true }
}

export default function InvoiceImport() {
  const { state, dispatch } = useStore()
  const { closeModal } = useModal()
  const showToast = useToast()
  const t = useLang()
  const fileRef = useRef(null)
  const symbol = activeCurrency().symbol

  const [step, setStep] = useState('upload') // upload | reading | review
  const [rows, setRows] = useState([])
  const [note, setNote] = useState('') // soft error / info line on the review screen

  function rowsFromItems(items) {
    return items.map(it => ({
      key: `r${++_rowSeq}`,
      name: it.name,
      qty: it.qty > 0 ? String(it.qty) : '',
      unitCost: it.unitCost > 0 ? String(it.unitCost) : '',
      price: '',
      include: true,
    }))
  }

  async function onFile(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setStep('reading')
    setNote('')
    try {
      const dataUrl = await invoiceImageDataUrl(file)
      const existingNames = state.products.map(p => p.name)
      const items = await parseInvoice({ dataUrl, existingNames })
      if (!items.length) {
        setRows([emptyRow()])
        setNote(t('invoiceNothingFound'))
      } else {
        setRows(rowsFromItems(items))
      }
      setStep('review')
    } catch (err) {
      // Graceful fallback → let them type it in by hand.
      setRows([emptyRow()])
      setNote(err.code === 'not_configured' ? t('invoiceOfflineNote') : t('invoiceReadError'))
      setStep('review')
    }
  }

  function startManual() {
    setRows([emptyRow()])
    setNote('')
    setStep('review')
  }

  function update(key, patch) {
    setRows(rs => rs.map(r => (r.key === key ? { ...r, ...patch } : r)))
  }
  function removeRow(key) {
    setRows(rs => rs.filter(r => r.key !== key))
  }

  function apply() {
    const active = rows.filter(r => r.include && r.name.trim() && Number(r.qty) > 0)
    if (!active.length) { showToast(t('invoiceNoItems')); return }

    // New products need a selling price before we can add them.
    const needingPrice = active.filter(r => {
      const m = matchProduct(r.name, state.products)
      return !m && !(Number(r.price) > 0)
    })
    if (needingPrice.length) { showToast(t('invoiceNeedPrice')); return }

    let added = 0
    let restocked = 0
    active.forEach(r => {
      const qty = Number(r.qty)
      const unitCost = Number(r.unitCost) || 0
      const match = matchProduct(r.name, state.products)
      if (match) {
        dispatch({
          type: 'RESTOCK_PRODUCT',
          payload: { productId: match.id, qty, amount: qty * unitCost },
        })
        restocked++
      } else {
        dispatch({
          type: 'ADD_PRODUCT',
          payload: {
            type: 'fixed',
            name: r.name.trim(),
            cost: unitCost,
            price: Number(r.price),
            qty,
            low: 5,
            category: '',
          },
        })
        added++
      }
    })

    showToast(t('invoiceAppliedToast', { added, restocked }))
    closeModal()
  }

  // ── Upload step ──
  if (step === 'upload') {
    return (
      <div className="inv-import">
        <div className="inv-head">
          <span className="inv-head-icon"><IconReceipt size={26} /></span>
          <h3>{t('invoiceTitle')}</h3>
          <p>{t('invoiceUploadPrompt')}</p>
        </div>

        <input ref={fileRef} type="file" accept="image/*" capture="environment" hidden onChange={onFile} />
        <button className="button inv-upload-btn" onClick={() => fileRef.current?.click()}>
          <IconCamera size={20} /> {t('invoiceChoosePhoto')}
        </button>
        <button className="button light" onClick={startManual}>
          <IconPlus size={18} /> {t('invoiceManualEntry')}
        </button>
        <button className="button light inv-cancel" onClick={closeModal}>{t('cancel')}</button>
      </div>
    )
  }

  // ── Reading step ──
  if (step === 'reading') {
    return (
      <div className="inv-import inv-reading">
        <div className="inv-spinner" aria-hidden="true" />
        <strong>{t('invoiceReading')}</strong>
        <span>{t('invoiceReadingHint')}</span>
      </div>
    )
  }

  // ── Review step ──
  const active = rows.filter(r => r.include && r.name.trim() && Number(r.qty) > 0)
  return (
    <div className="inv-import inv-review">
      <div className="inv-review-head">
        <h3>{t('invoiceReviewTitle')}</h3>
        <p>{t('invoiceReviewHint')}</p>
        {note && <div className="inv-note">{note}</div>}
      </div>

      <div className="inv-rows">
        {rows.map(r => {
          const match = r.name.trim() ? matchProduct(r.name, state.products) : null
          const isNew = r.name.trim() && !match
          return (
            <div key={r.key} className={`inv-row${r.include ? '' : ' is-off'}`}>
              <div className="inv-row-top">
                <input
                  className="field inv-name"
                  value={r.name}
                  placeholder={t('invoiceItemName')}
                  onChange={e => update(r.key, { name: e.target.value })}
                />
                <button className="inv-remove" aria-label={t('invoiceRemoveRow')} onClick={() => removeRow(r.key)}>
                  <IconX size={18} />
                </button>
              </div>

              <div className="inv-row-badge">
                {match
                  ? <span className="pill good">↻ {t('invoiceRestockBadge', { name: match.name })}</span>
                  : r.name.trim()
                  ? <span className="pill">＋ {t('invoiceNewBadge')}</span>
                  : null}
              </div>

              <div className="inv-fields">
                <label className="inv-f">
                  <span>{t('invoiceQty')}</span>
                  <input className="field" type="number" min="1" inputMode="numeric"
                    value={r.qty} onChange={e => update(r.key, { qty: e.target.value })} />
                </label>
                <label className="inv-f">
                  <span>{t('invoiceUnitCost')} ({symbol})</span>
                  <input className="field" type="number" min="0" inputMode="decimal"
                    value={r.unitCost} onChange={e => update(r.key, { unitCost: e.target.value })} />
                </label>
                {isNew && (
                  <label className="inv-f">
                    <span>{t('invoiceSellPrice')} ({symbol})</span>
                    <input className="field" type="number" min="1" inputMode="decimal"
                      value={r.price} onChange={e => update(r.key, { price: e.target.value })} />
                  </label>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <button className="button light inv-add-row" onClick={() => setRows(rs => [...rs, emptyRow()])}>
        <IconPlus size={18} /> {t('invoiceAddRow')}
      </button>

      <div className="inv-actions">
        <button className="button" onClick={apply} disabled={!active.length}>
          {t('invoiceApply', { count: active.length })}
        </button>
        <button className="button light" onClick={closeModal}>{t('cancel')}</button>
      </div>
    </div>
  )
}
