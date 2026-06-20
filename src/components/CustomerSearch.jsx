import { useState, useRef, useEffect } from 'react'
import { useStore } from '../store.jsx'
import { money } from '../utils.js'
import { useLang } from '../useLang.js'

export default function CustomerSearch({ required, value, onChange }) {
  const { state } = useStore()
  const t = useLang()
  const [query, setQuery] = useState(value?.name || '')
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  const matches = query.trim()
    ? state.customers.filter(c =>
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.phone.includes(query)
      )
    : state.customers.slice(0, 6)

  const exactMatch = state.customers.find(
    c => c.name.toLowerCase() === query.toLowerCase().trim()
  )

  useEffect(() => {
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  function select(customer) {
    setQuery(customer.name)
    onChange(customer)
    setOpen(false)
  }

  function handleInput(e) {
    const val = e.target.value
    setQuery(val)
    setOpen(true)
    onChange(val.trim() ? { name: val.trim(), phone: value?.phone || '' } : null)
  }

  return (
    <div className="customer-search" ref={ref}>
      <label className="label">
        {t('customerName')}{' '}
        {required
          ? <span className="cs-required">*</span>
          : <span className="cs-optional">({t('optional')})</span>
        }
        <input
          className="field"
          value={query}
          onChange={handleInput}
          onFocus={() => setOpen(true)}
          placeholder={`${t('search')}...`}
          autoComplete="off"
        />
      </label>

      {open && (
        <div className="cs-dropdown">
          {matches.map(c => (
            <button key={c.id} className="cs-option" onMouseDown={() => select(c)}>
              <div className="cs-option-info">
                <strong>{c.name}</strong>
                <span>{c.phone || t('noPhone')}</span>
              </div>
              {c.totalBalance > 0 && (
                <span className="pill warn" style={{ fontSize: '0.78rem', flexShrink: 0 }}>
                  {money(c.totalBalance)} owed
                </span>
              )}
            </button>
          ))}

          {query.trim() && !exactMatch && (
            <button
              className="cs-option cs-new"
              onMouseDown={() => {
                onChange({ name: query.trim(), phone: value?.phone || '' })
                setOpen(false)
              }}
            >
              + New customer: <strong style={{ marginLeft: 4 }}>{query}</strong>
            </button>
          )}

          {!query.trim() && state.customers.length === 0 && (
            <div className="cs-empty">{t('noDebt')}</div>
          )}
        </div>
      )}

      {/* Phone field — only for new debt customers (no id) */}
      {required && value && !value.id && (
        <label className="label" style={{ marginTop: 10 }}>
          {t('phone')} <span className="cs-required">*</span>
          <input
            className="field"
            type="tel"
            value={value.phone || ''}
            onChange={e => onChange({ ...value, phone: e.target.value })}
            placeholder="0803 xxx xxxx"
          />
        </label>
      )}
    </div>
  )
}
