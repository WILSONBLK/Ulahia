import { useState } from 'react'
import { useStore, getActiveOrder } from '../store.jsx'
import { useModal } from '../modal.jsx'
import { useToast } from '../toast.jsx'
import { money } from '../utils.js'
import { useLang } from '../useLang.js'
import { IconSearch, IconUserPlus, IconX } from './icons.jsx'

// Attach a customer to the active sale. Self-contained modal (inline list, no
// absolutely-positioned dropdown that a modal would clip). Tapping an existing
// customer commits immediately; a new customer takes a name + optional phone.
export default function CustomerPicker() {
  const { state, dispatch } = useStore()
  const { closeModal } = useModal()
  const showToast = useToast()
  const t = useLang()
  const order = getActiveOrder(state)

  const [query, setQuery] = useState('')
  const [newPhone, setNewPhone] = useState('')

  const q = query.trim().toLowerCase()
  const matches = q
    ? state.customers.filter(c =>
        c.name.toLowerCase().includes(q) || (c.phone || '').includes(query.trim()))
    : state.customers
  const exact = state.customers.find(c => c.name.toLowerCase() === q)

  function attach(customer) {
    dispatch({ type: 'SET_ORDER_CUSTOMER', payload: customer })
    showToast(t('cpAttached'))
    closeModal()
  }

  function createNew() {
    const name = query.trim()
    if (!name) return
    attach({ name, phone: newPhone.trim() })
  }

  function removeCustomer() {
    dispatch({ type: 'SET_ORDER_CUSTOMER', payload: null })
    closeModal()
  }

  return (
    <div className="cp">
      <div className="cp-head">
        <h3>{t('rsAddCustomer')}</h3>
        <button className="icon-button cp-close" aria-label={t('cancel')} onClick={closeModal}>
          <IconX size={18} />
        </button>
      </div>

      <div className="cp-search">
        <span className="cp-search-icon"><IconSearch size={18} /></span>
        <input
          className="cp-search-input"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={`${t('search')}...`}
          autoComplete="off"
          autoFocus
        />
      </div>

      <div className="cp-list">
        {/* Create-new — appears as soon as a name is typed with no exact match */}
        {q && !exact && (
          <div className="cp-new">
            <button className="cp-row cp-row--new" onClick={createNew}>
              <span className="cp-avatar cp-avatar--new"><IconUserPlus size={20} /></span>
              <span className="cp-row-text">
                <strong>{t('newCustomerPrefix')} {query.trim()}</strong>
                <span>{t('cpAddThisCustomer')}</span>
              </span>
            </button>
            <input
              className="field cp-phone"
              type="tel"
              inputMode="tel"
              value={newPhone}
              onChange={e => setNewPhone(e.target.value)}
              placeholder={t('cpPhoneOptional')}
              onKeyDown={e => { if (e.key === 'Enter') createNew() }}
            />
          </div>
        )}

        {matches.map(c => (
          <button key={c.id} className="cp-row" onClick={() => attach(c)}>
            <span className="cp-avatar">{(c.name || '?').charAt(0).toUpperCase()}</span>
            <span className="cp-row-text">
              <strong>{c.name}</strong>
              <span>{c.phone || t('noPhone')}</span>
            </span>
            {c.totalBalance > 0 && (
              <span className="pill warn cp-owed">{money(c.totalBalance)} {t('owedSuffix')}</span>
            )}
          </button>
        ))}

        {!q && state.customers.length === 0 && (
          <div className="cp-empty">{t('cpNoCustomers')}</div>
        )}
      </div>

      {order.customer && (
        <button className="cp-remove" onClick={removeCustomer}>
          <IconX size={16} /> {t('cpRemove')}
        </button>
      )}
    </div>
  )
}
