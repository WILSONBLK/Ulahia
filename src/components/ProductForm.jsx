import { useState, useRef } from 'react'
import { useStore } from '../store.jsx'
import { useModal } from '../modal.jsx'
import { useToast } from '../toast.jsx'
import { useLang } from '../useLang.js'
import { resizeImage } from '../utils.js'
import { CATEGORIES, CATEGORY_KEY } from '../categories.js'
import { IconCamera, IconX } from './icons.jsx'

export default function ProductForm({ product = null }) {
  const { dispatch } = useStore()
  const { closeModal } = useModal()
  const showToast = useToast()
  const t = useLang()
  const isEdit = !!product
  const isFlexEdit = isEdit && product.type === 'flexible'

  const [priceError, setPriceError] = useState(false)
  const [qty, setQty] = useState(
    isEdit && product.type === 'fixed' ? String(product.qty) : ''
  )
  const [category, setCategory] = useState(product?.category || '')
  const [image, setImage] = useState(product?.image || null)
  const fileRef = useRef(null)
  const qtyNum = Number(qty || 0)
  const showFixedFields = isEdit ? product.type === 'fixed' : qtyNum > 0
  const showFlexHint = !isEdit && qtyNum <= 0 && qty.trim() !== ''

  async function pickImage(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      const dataUrl = await resizeImage(file)
      setImage(dataUrl)
    } catch {
      showToast(t('couldNotReadFile'))
    }
  }

  function handleSubmit(e) {
    e.preventDefault()
    const d = new FormData(e.currentTarget)
    const name = d.get('name').trim()
    if (!name) return
    const cost = Number(d.get('cost') || 0)

    if (isEdit) {
      const payload = { id: product.id, name, category, image }
      if (product.type === 'fixed') {
        const price = Number(d.get('price'))
        if (!price || price <= 0) { setPriceError(true); return }
        Object.assign(payload, { cost, price, qty: qtyNum, low: Number(d.get('low') || product.low || 5) })
      } else {
        Object.assign(payload, { invested: cost })
      }
      dispatch({ type: 'EDIT_PRODUCT', payload })
      showToast(t('productUpdatedToast', { name }))
    } else {
      if (qtyNum > 0) {
        const price = Number(d.get('price'))
        if (!price || price <= 0) { setPriceError(true); return }
        dispatch({ type: 'ADD_PRODUCT', payload: { type: 'fixed', name, cost, price, qty: qtyNum, low: Number(d.get('low') || 5), category, image } })
      } else {
        dispatch({ type: 'ADD_PRODUCT', payload: { type: 'flexible', name, invested: cost, category, image } })
      }
      showToast(t('productAddedToast', { name }))
    }
    closeModal()
  }

  return (
    <>
      <h3 style={{ margin: '0 0 18px' }}>{isEdit ? t('editProduct') : t('addProduct')}</h3>
      <form onSubmit={handleSubmit} className="form-grid">

        {/* Image uploader */}
        <div className="label wide">
          {t('productImageLabel')}
          <div className="pf-image-row">
            <button type="button" className="pf-image-thumb" onClick={() => fileRef.current?.click()}>
              {image
                ? <img src={image} alt="" />
                : <span className="pf-image-placeholder"><IconCamera size={26} /></span>}
            </button>
            <div className="pf-image-actions">
              <button type="button" className="button light" onClick={() => fileRef.current?.click()}>
                {image ? t('changePhoto') : t('addPhoto')}
              </button>
              {image && (
                <button type="button" className="pf-image-remove" onClick={() => setImage(null)}>
                  <IconX size={16} /> {t('removePhoto')}
                </button>
              )}
              <span className="pf-image-hint">{t('productImageHint')}</span>
            </div>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={pickImage} />
          </div>
        </div>

        <label className="label wide">
          {t('productName')}
          <input className="field" name="name" defaultValue={product?.name ?? ''} placeholder={t('namePlaceholder')} autoFocus required />
        </label>

        <label className="label wide">
          {t('productCategoryLabel')}
          <select className="select" value={category} onChange={e => setCategory(e.target.value)}>
            <option value="">{t('productCategoryPlaceholder')}</option>
            {CATEGORIES.map(c => (
              <option key={c.id} value={c.id}>{t(CATEGORY_KEY[c.id])}</option>
            ))}
          </select>
        </label>

        <label className="label wide">
          {t('cost')} (₦)
          <input className="field" name="cost" type="number" min="0"
            defaultValue={isEdit ? (product.type === 'fixed' ? product.cost : product.invested) : ''}
            placeholder={t('costPlaceholder')} />
        </label>

        {!isFlexEdit && (
          <label className="label wide">
            {t('qty')}
            <input className="field" name="qty" type="number" min="0"
              placeholder={isEdit ? '' : t('qtyPlaceholderBlank')}
              value={qty}
              onChange={e => setQty(e.target.value)}
            />
            {!isEdit && !showFixedFields && (
              <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--muted)', marginTop: 4 }}>
                {t('flexHint')}
              </span>
            )}
          </label>
        )}

        {showFixedFields && (
          <>
            <label className="label">
              {t('price')} (₦)
              <input className="field" name="price" type="number" min="1"
                defaultValue={isEdit && product.type === 'fixed' ? product.price : ''}
                placeholder={t('pricePlaceholder')} required
                onChange={() => setPriceError(false)} />
              {priceError && <span style={{ color: 'var(--red)', fontSize: '0.8rem', marginTop: 4, display: 'block' }}>{t('priceRequiredError')}</span>}
            </label>
            <label className="label">
              {t('lowStock')}
              <input className="field" name="low" type="number" min="1"
                defaultValue={isEdit && product.type === 'fixed' ? product.low : ''}
                placeholder="5" />
            </label>
          </>
        )}

        {showFixedFields && <p className="form-hint wide">📦 {t('tracksStockHint')}</p>}
        {showFlexHint && <p className="form-hint wide" style={{ color: 'var(--green)' }}>⚖️ {t('soldByAmountHint')}</p>}

        <div className="row wide">
          <button className="button" type="submit">{isEdit ? t('saveChanges') : t('addProduct')}</button>
          <button className="button light" type="button" onClick={closeModal}>{t('cancel')}</button>
        </div>
      </form>
    </>
  )
}
