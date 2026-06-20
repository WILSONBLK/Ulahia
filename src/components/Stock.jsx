import { useStore } from '../store.jsx'
import { useLang } from '../useLang.js'
import { useModal } from '../modal.jsx'
import { useStats } from '../useStats.js'
import { money } from '../utils.js'
import ProductForm from './ProductForm.jsx'

export default function Stock() {
  const { state } = useStore()
  const t = useLang()
  const { openModal } = useModal()
  const { totalStock } = useStats()

  return (
    <section className="section">
      <div className="section-head">
        <div>
          <span className="section-kicker">{t('stock')}</span>
          <h2>{t('stockLeft')}: {totalStock}</h2>
        </div>
        <button className="button" onClick={() => openModal(<ProductForm />)}>
          {t('addGoods')}
        </button>
      </div>
      <div className="list">
        {state.products.map(product => {
          const percent = Math.max(4, Math.min(100, (product.qty / Math.max(product.low * 3, 1)) * 100))
          return (
            <div key={product.id} className="panel">
              <div className="product-top">
                <div>
                  <strong>{product.name}</strong>
                  <p>{money(product.cost)} cost · {money(product.price)} selling</p>
                </div>
                <span className={`pill${product.qty <= product.low ? ' warn' : ''}`}>
                  {product.qty} left
                </span>
              </div>
              <div className="progress">
                <span style={{ width: `${percent}%` }} />
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
