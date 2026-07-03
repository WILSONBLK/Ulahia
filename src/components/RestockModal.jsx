import { useState } from 'react'
import { useStore } from '../store.jsx'
import { useModal } from '../modal.jsx'
import { useToast } from '../toast.jsx'
import { money } from '../utils.js'
import { useLang } from '../useLang.js'

export default function RestockModal({ product }) {
  const { dispatch } = useStore()
  const { closeModal } = useModal()
  const showToast = useToast()
  const t = useLang()
  const [value, setValue] = useState('')

  const isFlexible = product.type === 'flexible'

  function apply() {
    const num = Number(value)
    if (!num || num <= 0) return
    dispatch({
      type: 'RESTOCK_PRODUCT',
      payload: { productId: product.id, qty: num, amount: num },
    })
    showToast(t('restockedToast', { name: product.name }))
    closeModal()
  }

  return (
    <div className="restock-modal">
      <div className="restock-modal-head">
        <button className="icon-button" onClick={closeModal}>←</button>
        <h3>{t('restock')} — {product.name}</h3>
      </div>

      <div className="restock-current">
        {isFlexible ? (
          <>
            <span>{t('currentInvestment')}</span>
            <strong>{money(product.invested)}</strong>
          </>
        ) : (
          <>
            <span>{t('currentStock')}</span>
            <strong>{product.qty} {t('units')}</strong>
          </>
        )}
      </div>

      <label className="label">
        {isFlexible ? t('newStockValue') : t('unitsReceived')}
        <input
          className="field"
          type="number"
          min="1"
          placeholder={isFlexible ? t('restockPlaceholderFlex') : t('restockPlaceholderFixed')}
          value={value}
          onChange={e => setValue(e.target.value)}
          autoFocus
          onKeyDown={e => e.key === 'Enter' && apply()}
        />
      </label>

      {isFlexible && value && Number(value) > 0 && (
        <div className="restock-preview">
          {t('newTotalInvestmentLabel')} <strong>{money(product.invested + Number(value))}</strong>
        </div>
      )}
      {!isFlexible && value && Number(value) > 0 && (
        <div className="restock-preview">
          {t('newStockLevelLabel')} <strong>{product.qty + Number(value)} {t('units')}</strong>
        </div>
      )}

      <div className="row" style={{ marginTop: 18 }}>
        <button className="button" onClick={apply} disabled={!value || Number(value) <= 0}>
          ✓ {t('addToStock')}
        </button>
        <button className="button light" onClick={closeModal}>{t('cancel')}</button>
      </div>
    </div>
  )
}
