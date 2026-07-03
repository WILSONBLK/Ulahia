import { useState } from 'react'
import { useStore } from '../store.jsx'
import { useLang } from '../useLang.js'
import { money } from '../utils.js'

export default function OrderTabs() {
  const { state, dispatch } = useStore()
  const t = useLang()
  const [confirmCloseId, setConfirmCloseId] = useState(null)

  function labelFor(order) {
    return order.customLabel || t('orderCustomerLabel', { n: order.number })
  }

  function requestClose(e, order) {
    e.stopPropagation()
    if (order.items.length === 0) {
      dispatch({ type: 'CLOSE_ORDER', payload: order.id })
      return
    }
    setConfirmCloseId(order.id)
  }

  return (
    <div className="pos-order-tabs">
      {state.orders.map(order => {
        if (confirmCloseId === order.id) {
          return (
            <div key={order.id} className="pos-order-tab pos-order-tab--confirm">
              <span>{t('removeOrderQ')}</span>
              <button
                className="pos-order-tab-confirm-btn pos-order-tab-confirm-btn--yes"
                onClick={() => { dispatch({ type: 'CLOSE_ORDER', payload: order.id }); setConfirmCloseId(null) }}
              >
                ✓
              </button>
              <button
                className="pos-order-tab-confirm-btn"
                onClick={() => setConfirmCloseId(null)}
              >
                {t('keepOrder')}
              </button>
            </div>
          )
        }

        const count = order.items.reduce((s, i) => s + i.qty, 0)
        const total = order.items.reduce((s, i) => s + i.price * i.qty, 0)
        const isActive = order.id === state.activeOrderId

        return (
          <button
            key={order.id}
            className={`pos-order-tab${isActive ? ' is-active' : ''}`}
            onClick={() => dispatch({ type: 'SWITCH_ORDER', payload: order.id })}
          >
            <span className="pos-order-tab-label">{labelFor(order)}</span>
            {count > 0 && <span className="pos-order-tab-meta">{count} · {money(total)}</span>}
            <span
              className="pos-order-tab-close"
              onClick={e => requestClose(e, order)}
              role="button"
              aria-label="Close order"
            >
              ×
            </span>
          </button>
        )
      })}
      <button className="pos-order-tab pos-order-tab-add" onClick={() => dispatch({ type: 'NEW_ORDER' })}>
        + {t('addCustomer')}
      </button>
    </div>
  )
}
